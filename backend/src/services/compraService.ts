import { query, transaction } from '../config/database';
import { RegistrarCompraDTO } from '../types';

export const compraService = {
  async registrar(data: RegistrarCompraDTO): Promise<string> {
    return await transaction(async (client) => {
      const productosJson = JSON.stringify(data.productos);
      
      const result = await client.query(
        `SELECT Registrar_Compra($1, $2, $3, $4, $5) as mensaje`,
        [data.proveedor, data.documento, data.fecha, data.personal, productosJson]
      );
      
      return result.rows[0].mensaje;
    });
  },

  async getAll(page: number = 1, limit: number = 20, fechaInicio?: string, fechaFin?: string): Promise<{ rows: any[]; total: number }> {
    const offset = (page - 1) * limit;
    
    let queryText = `
      SELECT d."Documento", d."TipoDoc", d."Fecha", d."Proveedor", 
             pr."RazonSocial" as "ProveedorNombre", d."Personal", d."pagado",
             COALESCE(SUM(dd."Cantidad" * dd."PrecUnit"), 0) as "Total"
      FROM DOCUMENTO d
      LEFT JOIN PROVEEDOR pr ON pr."Proveedor" = d."Proveedor"
      LEFT JOIN DETADOC dd ON dd."Documento" = d."Documento" AND dd."TipoDoc" = d."TipoDoc"
      WHERE d."TipoDoc" = 'C'
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
    
    queryText += ` GROUP BY d."Documento", d."TipoDoc", d."Fecha", d."Proveedor", pr."RazonSocial", d."Personal", d."pagado"
                   ORDER BY d."Fecha" DESC
                   LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    
    params.push(limit, offset);
    
    const result = await query(queryText, params);
    
    const countResult = await query(`SELECT COUNT(*) FROM DOCUMENTO WHERE "TipoDoc" = 'C'`);
    
    return {
      rows: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  },

  async getById(documento: string, tipoDoc: string): Promise<any> {
    const headerResult = await query(
      `SELECT d.*, pr."RazonSocial" as "ProveedorNombre"
       FROM DOCUMENTO d
       LEFT JOIN PROVEEDOR pr ON pr."Proveedor" = d."Proveedor"
       WHERE d."Documento" = $1 AND d."TipoDoc" = $2`,
      [documento, tipoDoc]
    );
    
    const detalleResult = await query(
      `SELECT dd.*, pr."Descripcion" as "ProductoDescripcion", pr."Marca"
       FROM DETADOC dd
       INNER JOIN PRODUCTO pr ON pr."Producto" = dd."Producto"
       WHERE dd."Documento" = $1 AND dd."TipoDoc" = $2`,
      [documento, tipoDoc]
    );
    
    return {
      header: headerResult.rows[0],
      detalle: detalleResult.rows
    };
  },

  async getByProveedor(proveedorId: string, page: number = 1, limit: number = 20): Promise<{ rows: any[]; total: number }> {
    const offset = (page - 1) * limit;
    
    const result = await query(
      `SELECT d.*, COALESCE(SUM(dd."Cantidad" * dd."PrecUnit"), 0) as "Total"
       FROM DOCUMENTO d
       LEFT JOIN DETADOC dd ON dd."Documento" = d."Documento" AND dd."TipoDoc" = d."TipoDoc"
       WHERE d."TipoDoc" = 'C' AND d."Proveedor" = $1
       GROUP BY d."Documento", d."TipoDoc", d."Fecha", d."Proveedor", d."Personal", d."pagado"
       ORDER BY d."Fecha" DESC
       LIMIT $2 OFFSET $3`,
      [proveedorId, limit, offset]
    );
    
    const countResult = await query(
      `SELECT COUNT(*) FROM DOCUMENTO WHERE "TipoDoc" = 'C' AND "Proveedor" = $1`,
      [proveedorId]
    );
    
    return {
      rows: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }
};