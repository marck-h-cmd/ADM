import { query } from '../config/database';
import { KardexItem } from '../types';

export const kardexService = {
  async getKardex(productoId: string, fechaInicio?: string, fechaFin?: string): Promise<KardexItem[]> {
    const result = await query<KardexItem>(
      `SELECT * FROM Kardex_Consulta($1, $2, $3)`,
      [productoId, fechaInicio || null, fechaFin || null]
    );
    return result.rows;
  },

  async getStockResumen(marca?: string, stockMinimo: boolean = false): Promise<any[]> {
    const result = await query(
      `SELECT * FROM Stock_Resumen($1)`,
      [marca || null]
    );
    if (stockMinimo) {
      return result.rows.filter((row: any) => row.estado === 'STOCK BAJO');
    }
    return result.rows;
  },

  async getValorizacion(): Promise<any[]> {
    const result = await query(`SELECT * FROM Valorizacion_Inventario()`);
    return result.rows;
  },

  async getRotacion(anio: number, mes?: number): Promise<any[]> {
    const result = await query(
      `SELECT * FROM Rotacion_Inventario($1, $2)`,
      [anio, mes || null]
    );
    return result.rows;
  },

  async getMovimientosPorFecha(fechaInicio: string, fechaFin: string, tipoMov?: 'I' | 'S'): Promise<any[]> {
    const result = await query(
      `SELECT * FROM Movimientos_PorFecha($1, $2, $3)`,
      [fechaInicio, fechaFin, tipoMov || null]
    );
    return result.rows;
  },

  async getKardexResumido(productoId: string, anio: number, mes?: number): Promise<any[]> {
    const result = await query(
      `SELECT * FROM Kardex_Resumido($1, $2, $3)`,
      [productoId, anio, mes || null]
    );
    return result.rows;
  },

  async getProductoInfo(productoId: string): Promise<any> {
    const result = await query(
      `SELECT "Producto", "Descripcion", "Marca", "StockAc", "StockMin", "StockMax", "PrecVenta", "PrecCosto"
       FROM PRODUCTO WHERE "Producto" = $1`,
      [productoId]
    );
    return result.rows[0];
  },

  async exportarKardexExcel(productoId: string, fechaInicio?: string, fechaFin?: string): Promise<any> {
    // Para exportar a Excel, obtenemos los datos del kardex
    const movimientos = await this.getKardex(productoId, fechaInicio, fechaFin);
    const producto = await this.getProductoInfo(productoId);
    
    return {
      producto,
      movimientos,
      resumen: {
        totalIngresos: movimientos.filter(m => m.tipomov.includes('Ingreso')).reduce((sum, m) => sum + m.cantidad, 0),
        totalSalidas: movimientos.filter(m => m.tipomov.includes('Salida')).reduce((sum, m) => sum + m.cantidad, 0),
        stockFinal: movimientos.length > 0 ? movimientos[movimientos.length - 1].stock : 0
      }
    };
  }
};