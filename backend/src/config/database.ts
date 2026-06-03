import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

class Database {
  private static instance: Database;
  private pool: Pool;
  private isConnected: boolean = false;

  private constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'tenebrosa',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    });

    // Manejar errores del pool
    this.pool.on('error', (err: Error) => {
      console.error('❌ Error inesperado en el pool de conexiones:', err);
      this.isConnected = false;
    });

    this.pool.on('connect', () => {
      console.log('✅ Nueva conexión a la base de datos establecida');
      this.isConnected = true;
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async connect(): Promise<void> {
    try {
      const client = await this.pool.connect();
      console.log('✅ Conexión a PostgreSQL establecida');
      client.release();
      this.isConnected = true;
    } catch (error) {
      console.error('❌ Error conectando a PostgreSQL:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;
      
      // Log solo en desarrollo y para queries lentas
      if (process.env.NODE_ENV === 'development' || duration > 1000) {
        console.log(`📊 Query ejecutada en ${duration}ms:`, { 
          text: text.substring(0, 200), 
          rows: result.rowCount 
        });
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error en consulta:', { 
        text: text.substring(0, 200), 
        params,
        error 
      });
      throw error;
    }
  }

  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async end(): Promise<void> {
    await this.pool.end();
    this.isConnected = false;
    console.log('🔌 Conexión a PostgreSQL cerrada');
  }

  get status(): boolean {
    return this.isConnected;
  }
}

export const db = Database.getInstance();
export const query = db.query.bind(db);
export const getClient = db.getClient.bind(db);
export const transaction = db.transaction.bind(db);