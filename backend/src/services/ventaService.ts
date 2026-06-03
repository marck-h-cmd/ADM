import { query, transaction } from '../config/database';
import { RegistrarVentaDTO } from '../types';

export const ventaService = {
  async registrar(data: RegistrarVentaDTO): Promise<string> {
    return await transaction(async (client) => {
      const productosJson = JSON.stringify(data.productos);
      
      const result = await client.query(
        `SELECT Registrar_Venta($1, $2, $3, $4, $5, $6, $7, $8) as mensaje`,
        [data.cliente, data.documento, data.fecha, data.personal, data.formaPago, productosJson, data.credito, data.cuotas || 1]
      );
      
      return result.rows[0].mensaje;
    });
  },

  async getAll(page: number = 1, limit: number = 20, fechaInicio?: string, fechaFin?: string, search?: string): Promise<{ rows: any[]; total: number }> {
    const offset = (page - 1) * limit;
    
    let queryText = `
      SELECT d."Documento", d."TipoDoc", d."Fecha", d."Cliente", 
             c."Nombre" as "ClienteNombre", d."Personal", d."pagado", d."Estado",
             COALESCE(SUM(dd."Cantidad" * dd."PrecUnit"), 0) as "Total"
      FROM DOCUMENTO d
      LEFT JOIN CLIENTE c ON c."Cliente" = d."Cliente"
      LEFT JOIN DETADOC dd ON dd."Documento" = d."Documento" AND dd."TipoDoc" = d."TipoDoc"
      WHERE d."TipoDoc" IN ('B', 'F')
    `;
    
    const params: any[] = [];
    let paramIndex = 1;
    
    if (fechaInicio) {
      queryText += ` AND d."Fecha" >= $${paramIndex++}`;
      params.push(fechaInicio);
    }
    if (fechaFin) {
      queryText += ` AND d."Fecha" <= $${paramIndex++}`;
      params.push(fechaFin);
    }
    if (search) {
      queryText += ` AND (c."Nombre" ILIKE $${paramIndex++} OR d."Documento" ILIKE $${paramIndex++})`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    queryText += ` GROUP BY d."Documento", d."TipoDoc", d."Fecha", d."Cliente", c."Nombre", d."Personal", d."pagado", d."Estado"
                   ORDER BY d."Fecha" DESC
                   LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    
    params.push(limit, offset);
    
    const result = await query(queryText, params);
    
    // Contar total
    let countQuery = `SELECT COUNT(DISTINCT d."Documento" || d."TipoDoc") as count FROM DOCUMENTO d WHERE d."TipoDoc" IN ('B', 'F')`;
    const countResult = await query(countQuery);
    
    return {
      rows: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  },

  async getById(documento: string, tipoDoc: string): Promise<any> {
    // Cabecera
    const headerResult = await query(
      `SELECT d.*, c."Nombre" as "ClienteNombre", c."Zona", c."TipoCliente",
              p."Nombre" as "PersonalNombre", t."Descripcion" as "TiendaDesc"
       FROM DOCUMENTO d
       LEFT JOIN CLIENTE c ON c."Cliente" = d."Cliente"
       LEFT JOIN PERSONAL p ON p."Personal" = d."Personal"
       LEFT JOIN Tienda t ON t."idTienda" = d."IdTienda"
       WHERE d."Documento" = $1 AND d."TipoDoc" = $2`,
      [documento, tipoDoc]
    );
    
    // Detalle
    const detalleResult = await query(
      `SELECT dd.*, pr."Descripcion" as "ProductoDescripcion", pr."Marca"
       FROM DETADOC dd
       INNER JOIN PRODUCTO pr ON pr."Producto" = dd."Producto"
       WHERE dd."Documento" = $1 AND dd."TipoDoc" = $2`,
      [documento, tipoDoc]
    );
    
    // Cronograma si es crédito
    let cronograma = [];
    if (tipoDoc === 'F') {
      const cronoResult = await query(
        `SELECT * FROM CRONOGRAMA 
         WHERE "Documento" = $1 AND "TipoDoc" = $2 
         ORDER BY "NroCuota"`,
        [documento, tipoDoc]
      );
      cronograma = cronoResult.rows;
    }
    
    return {
      header: headerResult.rows[0],
      detalle: detalleResult.rows,
      cronograma
    };
  },

  async registrarPago(documento: string, tipoDoc: string, monto: number, medioPago: string): Promise<void> {
    await transaction(async (client) => {
      // Registrar pago en la cuota correspondiente
      await client.query(
        `UPDATE CRONOGRAMA 
         SET "Fepago" = CURRENT_TIMESTAMP, "estado" = 'C', "idMedioPago" = $3
         WHERE "Documento" = $1 AND "TipoDoc" = $2 AND "estado" = 'P'
         ORDER BY "NroCuota" LIMIT 1`,
        [documento, tipoDoc, medioPago]
      );
      
      // Verificar si todas las cuotas están pagadas
      const pendingResult = await client.query(
        `SELECT COUNT(*) FROM CRONOGRAMA 
         WHERE "Documento" = $1 AND "TipoDoc" = $2 AND "estado" != 'C'`,
        [documento, tipoDoc]
      );
      
      if (parseInt(pendingResult.rows[0].count) === 0) {
        await client.query(
          `UPDATE DOCUMENTO SET "Estado" = 'C' WHERE "Documento" = $1 AND "TipoDoc" = $2`,
          [documento, tipoDoc]
        );
      }
    });
  },

  async getResumenDiario(fecha?: string): Promise<any> {
    const fechaConsulta = fecha || new Date().toISOString().split('T')[0];
    const result = await query(`
      SELECT 
        COUNT(*) as cantidad,
        COALESCE(SUM("pagado"), 0) as total,
        AVG("pagado") as promedio
      FROM DOCUMENTO
      WHERE "Fecha"::date = $1 AND "TipoDoc" IN ('B', 'F')
    `, [fechaConsulta]);
    return result.rows[0];
  },

  async getResumenPorVendedor(fechaInicio: string, fechaFin: string): Promise<any[]> {
    const result = await query(`
      SELECT 
        d."Personal", p."Nombre" as "Vendedor",
        COUNT(*) as cantidad,
        COALESCE(SUM(d."pagado"), 0) as total,
        COALESCE(AVG(d."pagado"), 0) as promedio
      FROM DOCUMENTO d
      LEFT JOIN PERSONAL p ON p."Personal" = d."Personal"
      WHERE d."Fecha" BETWEEN $1 AND $2 AND d."TipoDoc" IN ('B', 'F')
      GROUP BY d."Personal", p."Nombre"
      ORDER BY total DESC
    `, [fechaInicio, fechaFin]);
    return result.rows;
  },

  async anular(documento: string, tipoDoc: string): Promise<boolean> {
    const result = await query(
      `UPDATE DOCUMENTO SET "Estado" = 'A' WHERE "Documento" = $1 AND "TipoDoc" = $2`,
      [documento, tipoDoc]
    );
    return (result.rowCount || 0) > 0;
  }
};