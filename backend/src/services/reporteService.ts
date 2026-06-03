import { query } from '../config/database';

export const reporteService = {
  async getVentas(fechaInicio: string, fechaFin: string, tipo?: string, vendedor?: string): Promise<any[]> {
    let queryText = `
      SELECT d."Documento", d."TipoDoc", d."Fecha", d."Cliente", c."Nombre" as "ClienteNombre",
             c."Zona", d."Personal", p."Nombre" as "Vendedor", d."pagado",
             COALESCE(SUM(dd."Cantidad" * dd."PrecUnit"), 0) as "Total",
             COUNT(DISTINCT dd."Producto") as "Productos"
      FROM DOCUMENTO d
      LEFT JOIN CLIENTE c ON c."Cliente" = d."Cliente"
      LEFT JOIN PERSONAL p ON p."Personal" = d."Personal"
      LEFT JOIN DETADOC dd ON dd."Documento" = d."Documento" AND dd."TipoDoc" = d."TipoDoc"
      WHERE d."Fecha" >= $1 AND d."Fecha" <= $2
        AND d."TipoDoc" IN ('B', 'F')
    `;
    
    const params: any[] = [fechaInicio, fechaFin];
    let paramIndex = 3;
    
    if (tipo && (tipo === 'B' || tipo === 'F')) {
      queryText += ` AND d."TipoDoc" = $${paramIndex++}`;
      params.push(tipo);
    }
    
    if (vendedor) {
      queryText += ` AND d."Personal" = $${paramIndex++}`;
      params.push(vendedor);
    }
    
    queryText += ` GROUP BY d."Documento", d."TipoDoc", d."Fecha", d."Cliente", c."Nombre", 
                   c."Zona", d."Personal", p."Nombre", d."pagado"
                   ORDER BY d."Fecha" DESC`;
    
    const result = await query(queryText, params);
    return result.rows;
  },

  async getVentasPorVendedor(fechaInicio: string, fechaFin: string): Promise<any[]> {
    const result = await query(`
      SELECT 
        d."Personal", 
        p."Nombre" as "Vendedor",
        COUNT(*) as "CantidadVentas",
        COALESCE(SUM(d."pagado"), 0) as "TotalVentas",
        COALESCE(AVG(d."pagado"), 0) as "TicketPromedio",
        MIN(d."Fecha") as "PrimeraVenta",
        MAX(d."Fecha") as "UltimaVenta"
      FROM DOCUMENTO d
      LEFT JOIN PERSONAL p ON p."Personal" = d."Personal"
      WHERE d."Fecha" >= $1 AND d."Fecha" <= $2
        AND d."TipoDoc" IN ('B', 'F')
        AND d."Personal" IS NOT NULL
      GROUP BY d."Personal", p."Nombre"
      ORDER BY "TotalVentas" DESC
    `, [fechaInicio, fechaFin]);
    
    return result.rows;
  },

  async getVentasPorZona(fechaInicio: string, fechaFin: string): Promise<any[]> {
    const result = await query(`
      SELECT 
        c."Zona",
        z."Descripcion" as "ZonaNombre",
        COUNT(*) as "CantidadVentas",
        COALESCE(SUM(d."pagado"), 0) as "TotalVentas",
        COUNT(DISTINCT d."Cliente") as "ClientesUnicos"
      FROM DOCUMENTO d
      LEFT JOIN CLIENTE c ON c."Cliente" = d."Cliente"
      LEFT JOIN ZONA z ON z."Zona" = c."Zona"
      WHERE d."Fecha" >= $1 AND d."Fecha" <= $2
        AND d."TipoDoc" IN ('B', 'F')
        AND d."Cliente" IS NOT NULL
      GROUP BY c."Zona", z."Descripcion"
      ORDER BY "TotalVentas" DESC
    `, [fechaInicio, fechaFin]);
    
    return result.rows;
  },

  async getVentasPorProducto(fechaInicio: string, fechaFin: string): Promise<any[]> {
    const result = await query(`
      SELECT 
        dd."Producto",
        p."Descripcion",
        p."Marca",
        m."Descripcion" as "MarcaNombre",
        l."Descripcion" as "LineaNombre",
        SUM(dd."Cantidad") as "CantidadVendida",
        SUM(dd."Cantidad" * dd."PrecUnit") as "TotalVendido",
        AVG(dd."PrecUnit") as "PrecioPromedio"
      FROM DETADOC dd
      INNER JOIN DOCUMENTO d ON d."Documento" = dd."Documento" AND d."TipoDoc" = dd."TipoDoc"
      INNER JOIN PRODUCTO p ON p."Producto" = dd."Producto"
      LEFT JOIN MARCA m ON m."Marca" = p."Marca"
      LEFT JOIN LINEA l ON l."Linea" = m."Linea"
      WHERE d."Fecha" >= $1 AND d."Fecha" <= $2
        AND d."TipoDoc" IN ('B', 'F')
      GROUP BY dd."Producto", p."Descripcion", p."Marca", m."Descripcion", l."Descripcion"
      ORDER BY "TotalVendido" DESC
    `, [fechaInicio, fechaFin]);
    
    return result.rows;
  },

  async getRotacion(anio: number): Promise<any[]> {
    const result = await query(`SELECT * FROM Rotacion_Inventario($1)`, [anio]);
    return result.rows;
  },

  async getVencimientos(diasVencimiento: number = 30): Promise<any[]> {
    const result = await query(`
      SELECT 
        c."Documento", 
        c."TipoDoc", 
        c."NroCuota", 
        c."feVence", 
        c."Importe",
        c."Interes",
        c."estado",
        d."Cliente", 
        cl."Nombre" as "ClienteNombre",
        NULL as "Telefono",
        c."feVence"::date - CURRENT_DATE as "DiasVencimiento"
      FROM CRONOGRAMA c
      LEFT JOIN DOCUMENTO d ON d."Documento" = c."Documento" AND d."TipoDoc" = c."TipoDoc"
      LEFT JOIN CLIENTE cl ON cl."Cliente" = d."Cliente"
      WHERE c."estado" = 'P' 
        AND c."feVence" <= CURRENT_DATE + $1::interval
      ORDER BY c."feVence" ASC
    `, [`${diasVencimiento} days`]);
    
    return result.rows;
  },

  async getUtilidades(fechaInicio: string, fechaFin: string): Promise<any> {
    const result = await query(`
      SELECT 
        COALESCE(SUM(dd."Cantidad" * (dd."PrecUnit" - p."PrecCosto")), 0) as "UtilidadBruta",
        COALESCE(SUM(dd."Cantidad" * dd."PrecUnit"), 0) as "IngresoTotal",
        COALESCE(SUM(dd."Cantidad" * p."PrecCosto"), 0) as "CostoTotal"
      FROM DETADOC dd
      INNER JOIN DOCUMENTO d ON d."Documento" = dd."Documento" AND d."TipoDoc" = dd."TipoDoc"
      INNER JOIN PRODUCTO p ON p."Producto" = dd."Producto"
      WHERE d."Fecha" >= $1 AND d."Fecha" <= $2
        AND d."TipoDoc" IN ('B', 'F')
    `, [fechaInicio, fechaFin]);
    
    const data = result.rows[0];
    const utilidad = parseFloat(data.UtilidadBruta);
    const ingreso = parseFloat(data.IngresoTotal);
    
    return {
      utilidadBruta: utilidad,
      ingresoTotal: ingreso,
      costoTotal: parseFloat(data.CostoTotal),
      margenUtilidad: ingreso > 0 ? (utilidad / ingreso) * 100 : 0
    };
  },

  async exportarVentasExcel(fechaInicio: string, fechaFin: string, tipo?: string): Promise<any[]> {
    return await this.getVentas(fechaInicio, fechaFin, tipo);
  }
};