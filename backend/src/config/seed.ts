import { db } from './database';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

async function seed() {
  console.log('🌱 Iniciando inicialización y semilla de la base de datos...');
  
  try {
    // 1. Conectar a la base de datos
    await db.connect();
    
    // 2. Modificar la tabla PERSONAL para agregar Password si no existe
    console.log('🔄 Verificando estructura de la tabla PERSONAL...');
    await db.query(`
      ALTER TABLE PERSONAL 
      ADD COLUMN IF NOT EXISTS "Password" VARCHAR(255);
    `);
    console.log('✅ Columna Password verificada/creada en tabla PERSONAL.');

    // 3. Hashear la contraseña por defecto: password123
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 4. Actualizar o insertar usuarios de prueba en PERSONAL
    console.log('👤 Creando/Actualizando usuarios de prueba...');
    
    // Juan Perez (ID 01)
    await db.query(`
      INSERT INTO PERSONAL ("Personal", "Nombre", "Email", "Password", "Activo", "Basico", "fechaIngre")
      VALUES ('01', 'JUAN PEREZ', 'juan@tenebrosa.com', $1, TRUE, 2500.00, CURRENT_TIMESTAMP)
      ON CONFLICT ("Personal") 
      DO UPDATE SET "Email" = 'juan@tenebrosa.com', "Password" = $1, "Activo" = TRUE;
    `, [passwordHash]);

    // Maria Lopez (ID 02)
    await db.query(`
      INSERT INTO PERSONAL ("Personal", "Nombre", "Email", "Password", "Activo", "Basico", "fechaIngre")
      VALUES ('02', 'MARIA LOPEZ', 'maria@tenebrosa.com', $1, TRUE, 2600.00, CURRENT_TIMESTAMP)
      ON CONFLICT ("Personal") 
      DO UPDATE SET "Email" = 'maria@tenebrosa.com', "Password" = $1, "Activo" = TRUE;
    `, [passwordHash]);

    console.log('✅ Usuarios de prueba inicializados correctamente:');
    console.log('   - juan@tenebrosa.com / password123');
    console.log('   - maria@tenebrosa.com / password123');

    // 5. Cargar e instalar funciones SQL desde setup_functions.sql
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
