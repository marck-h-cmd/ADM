import { query } from '../config/database';
import { Cliente } from '../types';

export const clienteService = {
  async getAll(page: number = 1, limit: number = 20, search: string = ''): Promise<{ rows: Cliente[]; total: number }> {
    const offset = (page - 1) * limit;
    
    const result = await query<Cliente>(
      `SELECT c."Cliente", c."Nombre", c."Zona", z."Descripcion" as "ZonaDesc",
              c."TipoCliente", c."credito", c."Saldo", c."topeCredito", 
              c."Ruc", c."Direccion", c."Calificacion", c."genero"
       FROM CLIENTE c
       LEFT JOIN ZONA z ON z."Zona" = c."Zona"
       WHERE c."Nombre" ILIKE $1 OR c."Cliente" ILIKE $1 OR c."Ruc" ILIKE $1
       ORDER BY c."Nombre"
       LIMIT $2 OFFSET $3`,
      [`%${search}%`, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM CLIENTE WHERE "Nombre" ILIKE $1 OR "Cliente" ILIKE $1`,
      [`%${search}%`]
    );

    return {
      rows: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  },

  async getById(clienteId: string): Promise<Cliente | null> {
    const result = await query<Cliente>(
      `SELECT c.*, z."Descripcion" as "ZonaDesc"
       FROM CLIENTE c
       LEFT JOIN ZONA z ON z."Zona" = c."Zona"
       WHERE c."Cliente" = $1`,
      [clienteId]
    );
    return result.rows[0] || null;
  },

  async getCredito(): Promise<Cliente[]> {
    const result = await query<Cliente>(
      `SELECT "Cliente", "Nombre", "Saldo", "topeCredito", "TipoCliente", "credito", "Zona"
       FROM CLIENTE
       WHERE "credito" = TRUE
       ORDER BY "Nombre"`
    );
    return result.rows;
  },

  async getByZona(zonaId: string): Promise<Cliente[]> {
    const result = await query<Cliente>(
      `SELECT * FROM CLIENTE WHERE "Zona" = $1 ORDER BY "Nombre"`,
      [zonaId]
    );
    return result.rows;
  },

  async getByTipo(tipo: string): Promise<Cliente[]> {
    const result = await query<Cliente>(
      `SELECT * FROM CLIENTE WHERE "TipoCliente" = $1 ORDER BY "Nombre"`,
      [tipo]
    );
    return result.rows;
  },

  async create(data: Partial<Cliente>): Promise<Cliente> {
    const result = await query<Cliente>(
      `INSERT INTO CLIENTE ("Cliente", "Zona", "Nombre", "Direccion", "Ruc", "credito", "topeCredito", "TipoCliente", "Calificacion", "idRepresentante", "genero")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [data.Cliente, data.Zona, data.Nombre, data.Direccion || null, data.Ruc || null, 
       data.credito || false, data.topeCredito || 0, data.TipoCliente || 'R', 
       data.Calificacion || null, data.idRepresentante || 1, data.genero || 'M']
    );
    return result.rows[0];
  },

  async update(clienteId: string, data: Partial<Cliente>): Promise<Cliente | null> {
    const fields = [];
    const values = [];
    let index = 1;

    if (data.Nombre !== undefined) {
      fields.push(`"Nombre" = $${index++}`);
      values.push(data.Nombre);
    }
    if (data.Direccion !== undefined) {
      fields.push(`"Direccion" = $${index++}`);
      values.push(data.Direccion);
    }
    if (data.Zona !== undefined) {
      fields.push(`"Zona" = $${index++}`);
      values.push(data.Zona);
    }
    if (data.Ruc !== undefined) {
      fields.push(`"Ruc" = $${index++}`);
      values.push(data.Ruc);
    }
    if (data.credito !== undefined) {
      fields.push(`"credito" = $${index++}`);
      values.push(data.credito);
    }
    if (data.topeCredito !== undefined) {
      fields.push(`"topeCredito" = $${index++}`);
      values.push(data.topeCredito);
    }
    if (data.TipoCliente !== undefined) {
      fields.push(`"TipoCliente" = $${index++}`);
      values.push(data.TipoCliente);
    }
    if (data.Calificacion !== undefined) {
      fields.push(`"Calificacion" = $${index++}`);
      values.push(data.Calificacion);
    }

    if (fields.length === 0) return null;

    values.push(clienteId);
    const result = await query<Cliente>(
      `UPDATE CLIENTE SET ${fields.join(', ')} WHERE "Cliente" = $${index} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  async updateSaldo(clienteId: string, monto: number, tipo: 'incrementar' | 'disminuir'): Promise<Cliente | null> {
    const operacion = tipo === 'incrementar' ? '+' : '-';
    const result = await query<Cliente>(
      `UPDATE CLIENTE SET "Saldo" = "Saldo" ${operacion} $1 WHERE "Cliente" = $2 RETURNING *`,
      [Math.abs(monto), clienteId]
    );
    return result.rows[0] || null;
  },

  async delete(clienteId: string): Promise<boolean> {
    // Verificar si el cliente tiene documentos asociados
    const checkResult = await query(
      `SELECT COUNT(*) FROM DOCUMENTO WHERE "Cliente" = $1`,
      [clienteId]
    );
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      throw new Error('No se puede eliminar el cliente porque tiene documentos asociados');
    }
    
    const result = await query(`DELETE FROM CLIENTE WHERE "Cliente" = $1`, [clienteId]);
    return (result.rowCount || 0) > 0;
  },

  async getDashboardStats(): Promise<any> {
    const result = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN "credito" = TRUE THEN 1 ELSE 0 END) as conCredito,
        SUM(CASE WHEN "TipoCliente" = 'V' THEN 1 ELSE 0 END) as vip,
        SUM(CASE WHEN "TipoCliente" = 'E' THEN 1 ELSE 0 END) as empresas,
        SUM("Saldo") as saldoTotal
      FROM CLIENTE
    `);
    return result.rows[0];
  }
};