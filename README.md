# Tenebrosa - Sistema de Control de Inventario y Kardex

Este es el repositorio del sistema de control de inventario y kardex. Contiene una arquitectura dividida en un backend escrito en Node.js/TypeScript (con Express y PostgreSQL) y un frontend web moderno con React y Vite.

---

## 🚀 Método 1: Ejecutar con Docker Compose (Recomendado)

Docker Compose levantará automáticamente el frontend, backend, PostgreSQL y pgAdmin, y cargará la base de datos con los datos semilla correspondientes (incluyendo personal, marcas y movimientos actualizados a 2026).

### Requisitos previos
- Docker Desktop instalado y corriendo.

### Pasos para desplegar
1. Abre tu terminal en el directorio raíz del proyecto (`adm`).
2. Limpia volúmenes previos y recrea los contenedores:
   ```bash
   docker-compose down -v
   docker-compose up --build -d
   ```
3. Verifica el estado de los contenedores:
   ```bash
   docker ps
   ```

### Puertos de Acceso en Docker
* **Aplicación Web (Frontend):** [http://localhost:8080](http://localhost:8080)
* **API Backend (Health check):** [http://localhost:3000/health](http://localhost:3000/health)
* **Base de Datos (PostgreSQL):** Puerto host `5433` (conexión interna en el contenedor por el puerto `5432`).
* **Administrador de Base de Datos (pgAdmin):** [http://localhost:5050](http://localhost:5050)
  * **Email:** `admin@admin.com`
  * **Contraseña:** `admin`

---

## 💻 Método 2: Ejecutar Localmente (Sin Docker)

Si prefieres correr el proyecto directamente en tu sistema de desarrollo:

### Requisitos previos
- Node.js (v18 o superior) y npm/pnpm.
- PostgreSQL local instalado y corriendo.

---

### Paso 1: Configurar la Base de Datos Local

1. Crea una base de datos vacía llamada `tenebrosa` en tu PostgreSQL local.
2. Ejecuta los scripts SQL ubicados en el directorio `backend` estrictamente en el siguiente orden secuencial para estructurar la base de datos e insertar los datos base de prueba:
   1. [`01_crear_tablas.sql`](file:///c:/Users/WIND%2011/Documents/Marck/Coding/adm/backend/01_crear_tablas.sql)
   2. [`02_crear_vistas.sql`](file:///c:/Users/WIND%2011/Documents/Marck/Coding/adm/backend/02_crear_vistas.sql)
   3. [`03_crear_funciones.sql`](file:///c:/Users/WIND%2011/Documents/Marck/Coding/adm/backend/03_crear_funciones.sql)
   4. [`04_crear_triggers.sql`](file:///c:/Users/WIND%2011/Documents/Marck/Coding/adm/backend/04_crear_triggers.sql)
   5. [`05_insertar_datos_base.sql`](file:///c:/Users/WIND%2011/Documents/Marck/Coding/adm/backend/05_insertar_datos_base.sql)

*Nota: Alternativamente, puedes importar directamente el archivo [`frontend/init.sql`](file:///c:/Users/WIND%2011/Documents/Marck/Coding/adm/frontend/init.sql) que ya contiene la consolidación de todos los scripts anteriores.*

---

### Paso 2: Iniciar el Backend

1. Entra a la carpeta `backend`:
   ```bash
   cd backend
   ```
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Configura las variables de entorno en el archivo `.env` basándote en `.env.example`:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=tenebrosa
   DB_USER=tu_usuario_postgres
   DB_PASSWORD=tu_contraseña_postgres
   JWT_SECRET=mi_secreto_super_seguro_para_jwt_2024
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=http://localhost:8080
   ```
4. Corre el backend en modo desarrollo:
   ```bash
   npm run dev
   ```

---

### Paso 3: Iniciar el Frontend

1. Entra a la carpeta `frontend`:
   ```bash
   cd ../frontend
   ```
2. Instala dependencias:
   ```bash
   npm install   # o 'pnpm install' si usas pnpm
   ```
3. Configura el archivo `.env` con la ruta de tu API local:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```
4. Inicia el servidor de desarrollo de Vite:
   ```bash
   npm run dev   # o 'pnpm run dev'
   ```
5. Abre en tu navegador [http://localhost:5173](http://localhost:5173) (o el puerto que te indique Vite).

---

## 🔑 Credenciales por Defecto (Seed Data)
Para iniciar sesión en el sistema:

* **Usuario 1 (Admin/Personal 01):** `juan@tenebrosa.com` / `password123`
* **Usuario 2 (Personal 02):** `maria@tenebrosa.com` / `password123`
