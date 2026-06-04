import { db } from './database';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

async function seed() {
  console.log('🌱 Iniciando inicialización y semilla de la base de datos (SQL Server)...');
  
  try {
    // 1. Conectar a la base de datos
    await db.connect();
    
    // 2. Modificar la tabla PERSONAL para agregar Password si no existe
    console.log('🔄 Verificando estructura de la tabla PERSONAL...');
    await db.query(`
      IF NOT EXISTS (
        SELECT * FROM sys.columns 
        WHERE object_id = OBJECT_ID('PERSONAL') AND name = 'Password'
      )
      BEGIN
        ALTER TABLE PERSONAL ADD "Password" VARCHAR(255);
      END
    `);
    console.log('✅ Columna Password verificada/creada en tabla PERSONAL.');

    // 3. Hashear la contraseña por defecto: password123
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 4. Actualizar o insertar usuarios de prueba en PERSONAL usando MERGE
    console.log('👤 Creando/Actualizando usuarios de prueba...');
    
    // Juan Perez (ID 01)
    await db.query(`
      MERGE INTO PERSONAL AS target
      USING (
        SELECT '01' AS Personal, 'JUAN PEREZ' AS Nombre, 'juan@tenebrosa.com' AS Email, $1 AS Password, 1 AS Activo, 2500.00 AS Basico, GETDATE() AS fechaIngre
      ) AS source
      ON target.Personal = source.Personal
      WHEN MATCHED THEN
        UPDATE SET Email = source.Email, Password = source.Password, Activo = source.Activo
      WHEN NOT MATCHED THEN
        INSERT ("Personal", "Nombre", "Email", "Password", "Activo", "Basico", "fechaIngre")
        VALUES (source.Personal, source.Nombre, source.Email, source.Password, source.Activo, source.Basico, source.fechaIngre);
    `, [passwordHash]);

    // Maria Lopez (ID 02)
    await db.query(`
      MERGE INTO PERSONAL AS target
      USING (
        SELECT '02' AS Personal, 'MARIA LOPEZ' AS Nombre, 'maria@tenebrosa.com' AS Email, $1 AS Password, 1 AS Activo, 2600.00 AS Basico, GETDATE() AS fechaIngre
      ) AS source
      ON target.Personal = source.Personal
      WHEN MATCHED THEN
        UPDATE SET Email = source.Email, Password = source.Password, Activo = source.Activo
      WHEN NOT MATCHED THEN
        INSERT ("Personal", "Nombre", "Email", "Password", "Activo", "Basico", "fechaIngre")
        VALUES (source.Personal, source.Nombre, source.Email, source.Password, source.Activo, source.Basico, source.fechaIngre);
    `, [passwordHash]);

    console.log('✅ Usuarios de prueba inicializados correctamente:');
    console.log('   - juan@tenebrosa.com / password123');
    console.log('   - maria@tenebrosa.com / password123');

    // 5. Cargar e instalar funciones SQL desde setup_functions.sql (si existe)
    const sqlPath = path.join(__dirname, '../../setup_functions.sql');
    if (fs.existsSync(sqlPath)) {
      console.log('💾 Instalando funciones y procedimientos SQL de setup_functions.sql...');
      const sqlContent = fs.readFileSync(sqlPath, 'utf8');
      await db.query(sqlContent);
      console.log('✅ Funciones y procedimientos SQL cargados con éxito.');
    } else {
      console.warn('⚠️ No se encontró el archivo setup_functions.sql para cargar.');
    }

    console.log('🎉 Base de datos lista y completamente funcional.');
  } catch (error) {
    console.error('❌ Error durante el seeding de la base de datos:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

seed();
