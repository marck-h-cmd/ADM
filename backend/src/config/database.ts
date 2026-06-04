import mssql from 'mssql';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const config: mssql.config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'StrongPassword123!',
  server: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_NAME || 'tenebrosa',
  options: {
    encrypt: process.env.DB_SSL === 'true',
    trustServerCertificate: true // Requerido para entornos de desarrollo locales con SQL Server
  },
  pool: {
    max: 20,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

class Database {
  private static instance: Database;
  private pool!: mssql.ConnectionPool;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async connect(): Promise<void> {
    try {
      const dbName = config.database || 'tenebrosa';
      
      // 1. Conectar temporalmente a master para asegurar que la DB existe
      console.log('🔌 Verificando existencia de la base de datos en master...');
      const masterConfig = { ...config, database: 'master' };
      const masterPool = new mssql.ConnectionPool(masterConfig);
      await masterPool.connect();
      
      const dbCheck = await masterPool.request().query(`
        SELECT database_id FROM sys.databases WHERE name = '${dbName}'
      `);
      
      if (dbCheck.recordset.length === 0) {
        console.log(`🔄 Base de datos '${dbName}' no existe. Creándola...`);
        await masterPool.request().query(`CREATE DATABASE ${dbName}`);
        console.log(`✅ Base de datos '${dbName}' creada con éxito.`);
      }
      await masterPool.close();

      // 2. Conectar a la base de datos destino
      this.pool = new mssql.ConnectionPool(config);
      await this.pool.connect();
      console.log(`✅ Conexión a SQL Server establecida (DB: ${dbName})`);
      this.isConnected = true;

      // 3. Inicializar esquema si es necesario
      await this.initializeDatabaseSchema();
    } catch (error) {
      console.error('❌ Error conectando a SQL Server:', error);
      this.isConnected = false;
      throw error;
    }
  }

  private async initializeDatabaseSchema(): Promise<void> {
    try {
      const checkTable = await this.pool.request().query(`
        SELECT * FROM sys.tables WHERE name = 'PERSONAL'
      `);

      if (checkTable.recordset.length === 0) {
        console.log('🔄 Base de datos vacía detectada. Buscando init.sql para inicializar el esquema...');
        
        // Buscar init.sql en ubicaciones típicas
        let sqlPath = path.join(__dirname, '../../../../frontend/init.sql'); // local (desde dist/config)
        if (!fs.existsSync(sqlPath)) {
          sqlPath = path.join(__dirname, '../../../frontend/init.sql'); // local (desde src/config)
        }
        if (!fs.existsSync(sqlPath)) {
          sqlPath = path.join(__dirname, '../../init.sql'); // local directo
        }
        if (!fs.existsSync(sqlPath)) {
          sqlPath = '/app/init.sql'; // docker mapped
        }
        if (!fs.existsSync(sqlPath)) {
          sqlPath = 'init.sql'; // cwd fallback
        }

        if (fs.existsSync(sqlPath)) {
          console.log(`💾 Leyendo script de inicialización desde: ${sqlPath}`);
          const sqlContent = fs.readFileSync(sqlPath, 'utf8');
          
          // Dividir por delimitador 'GO' (insensible a mayúsculas y con posibles espacios/saltos de línea)
          const blocks = sqlContent.split(/\r?\n\s*GO\s*\r?\n/i);
          
          console.log(`⚙️ Ejecutando ${blocks.length} bloques SQL para inicializar base de datos...`);
          for (const block of blocks) {
            const cleanBlock = block.trim();
            if (cleanBlock) {
              await this.pool.request().query(cleanBlock);
            }
          }
          console.log('🎉 Inicialización del esquema y datos base completada con éxito.');
        } else {
          console.warn('⚠️ No se encontró el archivo init.sql. El esquema no ha sido inicializado.');
        }
      }
    } catch (error) {
      console.error('❌ Error al inicializar el esquema de base de datos:', error);
    }
  }

  async query<T = any>(text: string, params?: any[]): Promise<{ rows: T[]; rowCount: number }> {
    const start = Date.now();
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      
      const request = new mssql.Request(this.pool);
      let formattedText = text;

      // 1. Convertir placeholders de PostgreSQL ($1, $2, ...) a SQL Server (@p1, @p2, ...)
      if (params && params.length > 0) {
        for (let i = 0; i < params.length; i++) {
          const paramName = `p${i + 1}`;
          const regex = new RegExp(`\\$${i + 1}\\b`, 'g');
          formattedText = formattedText.replace(regex, `@${paramName}`);
          
          // Pasar parámetro de forma segura
          request.input(paramName, params[i]);
        }
      }

      // 2. Mapeos de compatibilidad adicionales para T-SQL
      formattedText = formattedText.replace(/\bILIKE\b/gi, 'LIKE');
      formattedText = formattedText.replace(/"Fecha"::date/g, 'CAST("Fecha" AS DATE)');
      formattedText = formattedText.replace(/=\s*TRUE\b/gi, '= 1');
      formattedText = formattedText.replace(/=\s*FALSE\b/gi, '= 0');

      const result = await request.query(formattedText);
      const duration = Date.now() - start;
      
      // Log solo en desarrollo y para queries lentas
      if (process.env.NODE_ENV === 'development' || duration > 1000) {
        console.log(`📊 Query ejecutada en ${duration}ms:`, { 
          text: text.substring(0, 200), 
          rows: result.recordset?.length || 0 
        });
      }
      
      return {
        rows: result.recordset || [],
        rowCount: result.rowsAffected ? result.rowsAffected[0] : (result.recordset?.length || 0)
      };
    } catch (error) {
      console.error('❌ Error en consulta:', { 
        text: text.substring(0, 200), 
        params,
        error 
      });
      throw error;
    }
  }

  async getClient(): Promise<any> {
    if (!this.isConnected) {
      await this.connect();
    }
    return {
      query: async (text: string, params?: any[]) => {
        return this.query(text, params);
      }
    };
  }

  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    if (!this.isConnected) {
      await this.connect();
    }

    const transaction = new mssql.Transaction(this.pool);
    try {
      await transaction.begin();
      
      const client = {
        query: async <R = any>(text: string, params?: any[]): Promise<{ rows: R[]; rowCount: number }> => {
          const request = new mssql.Request(transaction);
          let formattedText = text;

          if (params && params.length > 0) {
            for (let i = 0; i < params.length; i++) {
              const paramName = `p${i + 1}`;
              const regex = new RegExp(`\\$${i + 1}\\b`, 'g');
              formattedText = formattedText.replace(regex, `@${paramName}`);
              request.input(paramName, params[i]);
            }
          }

          formattedText = formattedText.replace(/\bILIKE\b/gi, 'LIKE');
          formattedText = formattedText.replace(/"Fecha"::date/g, 'CAST("Fecha" AS DATE)');
          formattedText = formattedText.replace(/=\s*TRUE\b/gi, '= 1');
          formattedText = formattedText.replace(/=\s*FALSE\b/gi, '= 0');

          const result = await request.query(formattedText);
          return {
            rows: result.recordset || [],
            rowCount: result.rowsAffected ? result.rowsAffected[0] : (result.recordset?.length || 0)
          };
        }
      };

      const result = await callback(client);
      await transaction.commit();
      return result;
    } catch (error) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error('❌ Error al revertir la transacción:', rollbackError);
      }
      throw error;
    }
  }

  async end(): Promise<void> {
    if (this.pool) {
      await this.pool.close();
    }
    this.isConnected = false;
    console.log('🔌 Conexión a SQL Server cerrada');
  }

  get status(): boolean {
    return this.isConnected;
  }
}

export const db = Database.getInstance();
export const query = db.query.bind(db);
export const getClient = db.getClient.bind(db);
export const transaction = db.transaction.bind(db);