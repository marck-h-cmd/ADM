import { query } from '../config/database';
import { Producto } from '../types';

export const productoService = {
  async getAll(page: number = 1, limit: number = 20, search: string = ''): Promise<{ rows: Producto[]; total: number }> {
    const offset = (page - 1) * limit;
    
    const result = await query<Producto>(
      `SELECT p."Producto", p."Descripcion", p."Marca", p."StockAc", 
              p."StockMin", p."StockMax", p."PrecVenta", p."PrecCosto",
              p."Peso", p."ConIgv", p."UniMed",
              m."Descripcion" as "MarcaDesc"
       FROM PRODUCTO p
       LEFT JOIN MARCA m ON m."Marca" = p."Marca"
       WHERE p."Descripcion" ILIKE $1 OR p."Producto" ILIKE $1
       ORDER BY p."Producto"
       LIMIT $2 OFFSET $3`,
      [`%${search}%`, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM PRODUCTO WHERE "Descripcion" ILIKE $1 OR "Producto" ILIKE $1`,
      [`%${search}%`]
    );

    return {
      rows: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  },

  async getById(productoId: string): Promise<Producto | null> {
    const result = await query<Producto>(
      `SELECT p.*, m."Descripcion" as "MarcaDesc"
       FROM PRODUCTO p
       LEFT JOIN MARCA m ON m."Marca" = p."Marca"
       WHERE p."Producto" = $1`,
      [productoId]
    );
    return result.rows[0] || null;
  },

  async getStockCritico(): Promise<any[]> {
    const result = await query(`SELECT * FROM Productos_StockCritico()`);
    return result.rows;
  },

  async getTop(limit: number = 10): Promise<any[]> {
    const result = await query(`SELECT * FROM Top_Productos_Vendidos($1)`, [limit]);
    return result.rows;
  },

  async search(queryText: string): Promise<Producto[]> {
    const result = await query<Producto>(
      `SELECT "Producto", "Descripcion", "PrecVenta", "StockAc", "Marca"
       FROM PRODUCTO
       WHERE "Descripcion" ILIKE $1 OR "Producto" ILIKE $1
       LIMIT 20`,
      [`%${queryText}%`]
    );
    return result.rows;
  },

  async create(data: Partial<Producto>): Promise<Producto> {
    const result = await query<Producto>(
      `INSERT INTO PRODUCTO ("Producto", "Marca", "Descripcion", "StockAc", "StockMax", "StockMin", "PrecVenta", "PrecCosto", "Peso", "ConIgv", "UniMed")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [data.Producto, data.Marca, data.Descripcion, data.StockAc || 0, data.StockMax || 0, 
       data.StockMin || 0, data.PrecVenta, data.PrecCosto, data.Peso || 0, data.ConIgv || true, data.UniMed || 'UNIDAD']
    );
    return result.rows[0];
  },

  async update(productoId: string, data: Partial<Producto>): Promise<Producto | null> {
    const fields = [];
    const values = [];
    let index = 1;

    if (data.Descripcion !== undefined) {
      fields.push(`"Descripcion" = $${index++}`);
      values.push(data.Descripcion);
    }
    if (data.PrecVenta !== undefined) {
      fields.push(`"PrecVenta" = $${index++}`);
      values.push(data.PrecVenta);
    }
    if (data.PrecCosto !== undefined) {
      fields.push(`"PrecCosto" = $${index++}`);
      values.push(data.PrecCosto);
    }
    if (data.StockMax !== undefined) {
      fields.push(`"StockMax" = $${index++}`);
      values.push(data.StockMax);
    }
    if (data.StockMin !== undefined) {
      fields.push(`"StockMin" = $${index++}`);
      values.push(data.StockMin);
    }
    if (data.Marca !== undefined) {
      fields.push(`"Marca" = $${index++}`);
      values.push(data.Marca);
    }
    if (data.UniMed !== undefined) {
      fields.push(`"UniMed" = $${index++}`);
      values.push(data.UniMed);
    }
    if (data.ConIgv !== undefined) {
      fields.push(`"ConIgv" = $${index++}`);
      values.push(data.ConIgv);
    }
    if (data.Peso !== undefined) {
      fields.push(`"Peso" = $${index++}`);
      values.push(data.Peso);
    }

    if (fields.length === 0) return null;

    values.push(productoId);
    const result = await query<Producto>(
      `UPDATE PRODUCTO SET ${fields.join(', ')} WHERE "Producto" = $${index} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  async updateStock(productoId: string, cantidad: number, tipo: 'ingreso' | 'salida'): Promise<Producto | null> {
    const signo = tipo === 'ingreso' ? '+' : '-';
    const result = await query<Producto>(
      `UPDATE PRODUCTO SET "StockAc" = "StockAc" ${signo} $1 WHERE "Producto" = $2 RETURNING *`,
      [Math.abs(cantidad), productoId]
    );
    return result.rows[0] || null;
  },

  async delete(productoId: string): Promise<boolean> {
    // Verificar si el producto tiene movimientos
    const checkResult = await query(
      `SELECT COUNT(*) FROM DETADOC WHERE "Producto" = $1`,
      [productoId]
    );
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      throw new Error('No se puede eliminar el producto porque tiene movimientos asociados');
    }
    
    const result = await query(`DELETE FROM PRODUCTO WHERE "Producto" = $1`, [productoId]);
    return (result.rowCount || 0) > 0;
  },

  async getByMarca(marcaId: string): Promise<Producto[]> {
    const result = await query<Producto>(
      `SELECT * FROM PRODUCTO WHERE "Marca" = $1 ORDER BY "Producto"`,
      [marcaId]
    );
    return result.rows;
  },

  async getLowStock(threshold: number = 10): Promise<Producto[]> {
    const result = await query<Producto>(
      `SELECT * FROM PRODUCTO WHERE "StockAc" <= $1 ORDER BY "StockAc" ASC`,
      [threshold]
    );
    return result.rows;
  },

  async getValorizacionStock(): Promise<any> {
    const result = await query(
      `SELECT 
         SUM("StockAc" * "PrecCosto") as "valorCosto",
         SUM("StockAc" * "PrecVenta") as "valorVenta",
         SUM("StockAc" * ("PrecVenta" - "PrecCosto")) as "margenPotencial"
       FROM PRODUCTO`
    );
    return result.rows[0];
  }
};