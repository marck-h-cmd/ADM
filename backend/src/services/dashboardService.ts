import { query } from '../config/database';

export const dashboardService = {
  async getMetrics(): Promise<any> {
    // Ventas hoy
    const ventasHoy = await query(`
      SELECT COALESCE(SUM("pagado"), 0) as total, COUNT(*) as cantidad
      FROM DOCUMENTO
      WHERE "Fecha"::date = CURRENT_DATE AND "TipoDoc" IN ('B', 'F')
    `);
    
    // Ventas del mes
    const ventasMes = await query(`
      SELECT COALESCE(SUM("pagado"), 0) as total, COUNT(*) as cantidad
      FROM DOCUMENTO
      WHERE EXTRACT(YEAR FROM "Fecha") = EXTRACT(YEAR FROM CURRENT_DATE)
        AND EXTRACT(MONTH FROM "Fecha") = EXTRACT(MONTH FROM CURRENT_DATE)
        AND "TipoDoc" IN ('B', 'F')
    `);
    
    // Ventas del año
    const ventasAnio = await query(`
      SELECT COALESCE(SUM("pagado"), 0) as total
      FROM DOCUMENTO
      WHERE EXTRACT(YEAR FROM "Fecha") = EXTRACT(YEAR FROM CURRENT_DATE)
        AND "TipoDoc" IN ('B', 'F')
    `);
    
    // Productos con stock bajo
    const stockBajo = await query(`SELECT COUNT(*) FROM Productos_StockCritico()`);
    
    // Total productos
    const totalProductos = await query(`SELECT COUNT(*) FROM PRODUCTO`);
    
    // Total clientes
    const totalClientes = await query(`SELECT COUNT(*) FROM CLIENTE`);
    
    // Ventas del día anterior (para comparación)
    const ventasAyer = await query(`
      SELECT COALESCE(SUM("pagado"), 0) as total
      FROM DOCUMENTO
      WHERE "Fecha"::date = CURRENT_DATE - INTERVAL '1 day' AND "TipoDoc" IN ('B', 'F')
    `);
    
    // Ventas del mes anterior
    const ventasMesAnterior = await query(`
      SELECT COALESCE(SUM("pagado"), 0) as total
      FROM DOCUMENTO
      WHERE EXTRACT(YEAR FROM "Fecha") = EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month')
        AND EXTRACT(MONTH FROM "Fecha") = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month')
        AND "TipoDoc" IN ('B', 'F')
    `);
    
    const ventasHoyValue = parseFloat(ventasHoy.rows[0].total);
    const ventasAyerValue = parseFloat(ventasAyer.rows[0].total);
    const ventasMesValue = parseFloat(ventasMes.rows[0].total);
    const ventasMesAnteriorValue = parseFloat(ventasMesAnterior.rows[0].total);
    
    const variacionDiaria = ventasAyerValue > 0 
      ? ((ventasHoyValue - ventasAyerValue) / ventasAyerValue) * 100 
      : 0;
    
    const variacionMensual = ventasMesAnteriorValue > 0
      ? ((ventasMesValue - ventasMesAnteriorValue) / ventasMesAnteriorValue) * 100
      : 0;
    
    return {
      ventasHoy: {
        total: ventasHoyValue,
        cantidad: parseInt(ventasHoy.rows[0].cantidad),
        variacion: Math.round(variacionDiaria * 100) / 100
      },
      ventasMes: {
        total: ventasMesValue,
        cantidad: parseInt(ventasMes.rows[0].cantidad),
        variacion: Math.round(variacionMensual * 100) / 100
      },
      ventasAnio: parseFloat(ventasAnio.rows[0].total),
      stockBajo: parseInt(stockBajo.rows[0].count),
      totalProductos: parseInt(totalProductos.rows[0].count),
      totalClientes: parseInt(totalClientes.rows[0].count)
    };
  },

  async getVentasPorMes(anio?: number): Promise<any[]> {
    const year = anio || new Date().getFullYear();
    
    const result = await query(`
      SELECT 
        EXTRACT(MONTH FROM "Fecha") as mes,
        TO_CHAR(DATE_TRUNC('month', "Fecha"), 'Month') as nombreMes,
        COALESCE(SUM("pagado"), 0) as total,
        COUNT(*) as cantidad
      FROM DOCUMENTO
      WHERE EXTRACT(YEAR FROM "Fecha") = $1 AND "TipoDoc" IN ('B', 'F')
      GROUP BY EXTRACT(MONTH FROM "Fecha"), DATE_TRUNC('month', "Fecha")
      ORDER BY mes
    `, [year]);
    
    return result.rows;
  },

  async getVentasPorDia(limit: number = 7): Promise<any[]> {
    const result = await query(`
      SELECT 
        "Fecha"::date as fecha,
        TO_CHAR("Fecha"::date, 'DD/MM') as fechaStr,
        COALESCE(SUM("pagado"), 0) as total,
        COUNT(*) as cantidad
      FROM DOCUMENTO
      WHERE "Fecha" >= CURRENT_DATE - $1::interval
        AND "TipoDoc" IN ('B', 'F')
      GROUP BY "Fecha"::date
      ORDER BY fecha ASC
    `, [`${limit - 1} days`]);
    
    return result.rows;
  },

  async getVentasPorHora(fecha?: string): Promise<any[]> {
    const fechaConsulta = fecha || new Date().toISOString().split('T')[0];
    const result = await query(`
      SELECT 
        EXTRACT(HOUR FROM "Fecha") as hora,
        COUNT(*) as cantidad,
        COALESCE(SUM("pagado"), 0) as total
      FROM DOCUMENTO
      WHERE "Fecha"::date = $1 AND "TipoDoc" IN ('B', 'F')
      GROUP BY EXTRACT(HOUR FROM "Fecha")
      ORDER BY hora
    `, [fechaConsulta]);
    
    return result.rows;
  },

  async getTopVendedores(limit: number = 5): Promise<any[]> {
    const result = await query(`
      SELECT 
        d."Personal", 
        p."Nombre" as "Vendedor",
        COUNT(*) as "CantidadVentas",
        COALESCE(SUM(d."pagado"), 0) as "TotalVentas",
        COALESCE(AVG(d."pagado"), 0) as "TicketPromedio"
      FROM DOCUMENTO d
      LEFT JOIN PERSONAL p ON p."Personal" = d."Personal"
      WHERE d."Fecha" >= DATE_TRUNC('month', CURRENT_DATE)
        AND d."TipoDoc" IN ('B', 'F')
        AND d."Personal" IS NOT NULL
      GROUP BY d."Personal", p."Nombre"
      ORDER BY "TotalVentas" DESC
      LIMIT $1
    `, [limit]);
    
    return result.rows;
  },

  async getTopClientes(limit: number = 5): Promise<any[]> {
    const result = await query(`
      SELECT 
        d."Cliente",
        c."Nombre" as "ClienteNombre",
        c."TipoCliente",
        COUNT(*) as "CantidadCompras",
        COALESCE(SUM(d."pagado"), 0) as "TotalCompras"
      FROM DOCUMENTO d
      LEFT JOIN CLIENTE c ON c."Cliente" = d."Cliente"
      WHERE d."Fecha" >= DATE_TRUNC('month', CURRENT_DATE)
        AND d."TipoDoc" IN ('B', 'F')
        AND d."Cliente" IS NOT NULL
      GROUP BY d."Cliente", c."Nombre", c."TipoCliente"
      ORDER BY "TotalCompras" DESC
      LIMIT $1
    `, [limit]);
    
    return result.rows;
  },

  async getTopProductos(limit: number = 10, fechaInicio?: string, fechaFin?: string): Promise<any[]> {
    let queryText = `
      SELECT 
        dd."Producto",
        p."Descripcion",
        p."Marca",
        SUM(dd."Cantidad") as "CantidadVendida",
        SUM(dd."Cantidad" * dd."PrecUnit") as "TotalVendido"
      FROM DETADOC dd
      INNER JOIN DOCUMENTO d ON d."Documento" = dd."Documento" AND d."TipoDoc" = dd."TipoDoc"
      INNER JOIN PRODUCTO p ON p."Producto" = dd."Producto"
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
    
    queryText += ` GROUP BY dd."Producto", p."Descripcion", p."Marca"
                   ORDER BY "TotalVendido" DESC
                   LIMIT $${paramIndex++}`;
    params.push(limit);
    
    const result = await query(queryText, params);
    return result.rows;
  },

  async getAlertasStock(): Promise<any[]> {
    const result = await query(`
      SELECT "producto", "descripcion", "stock_actual", "stock_minimo", "faltante"
      FROM Productos_StockCritico()
      LIMIT 10
    `);
    return result.rows;
  },

  async getCuotasVencer(dias: number = 7): Promise<any[]> {
    const result = await query(`
      SELECT 
        c."Documento", c."TipoDoc", c."NroCuota", c."feVence", c."Importe",
        d."Cliente", cl."Nombre" as "ClienteNombre"
      FROM CRONOGRAMA c
      LEFT JOIN DOCUMENTO d ON d."Documento" = c."Documento" AND d."TipoDoc" = c."TipoDoc"
      LEFT JOIN CLIENTE cl ON cl."Cliente" = d."Cliente"
      WHERE c."estado" = 'P' 
        AND c."feVence" BETWEEN CURRENT_DATE AND CURRENT_DATE + $1::interval
      ORDER BY c."feVence" ASC
      LIMIT 20
    `, [`${dias} days`]);
    
    return result.rows;
  }
};