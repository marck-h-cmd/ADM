# Tenebrosa Backend - Sistema de Control de Inventario y Kardex

Este es el backend del **Sistema de Control de Inventario y Kardex**, desarrollado utilizando **Node.js**, **Express**, **TypeScript** y **PostgreSQL**. Cuenta con autenticación segura por JWT, validaciones avanzadas de esquema e integración con funciones y triggers en la base de datos PostgreSQL.

---

## 🛠️ Tecnologías y Librerías Utilizadas

*   **Entorno de Ejecución:** Node.js v18+
*   **Lenguaje:** TypeScript
*   **Servidor Web:** Express.js
*   **Base de Datos:** PostgreSQL 15+ (con soporte para triggers y funciones PL/pgSQL)
*   **Seguridad y Autenticación:** JSON Web Tokens (JWT) y cifrado de contraseñas con Bcryptjs
*   **Seguridad HTTP:** Helmet, Cors y Morgan para logs
*   **Control de Peticiones:** Express Rate Limit para mitigar ataques DDoS
*   **Validaciones de DTOs:** Zod

---

## 📂 Estructura del Proyecto

```text
backend/
├── src/
│   ├── config/          # Configuración de base de datos y scripts de semilla
│   ├── controllers/     # Controladores que manejan las peticiones HTTP
│   ├── middleware/      # Middlewares de Express (Auth, Error Handler, Validación)
│   ├── routes/          # Definición de rutas y endpoints de la API
│   ├── services/        # Lógica de negocio y consultas SQL directas
│   ├── types/           # Interfaces y tipos de TypeScript
│   ├── utils/           # Clases y funciones auxiliares
│   └── index.ts         # Punto de entrada del servidor
├── crear_tablas.sql     # Script SQL completo de inicialización de la base de datos
├── setup_functions.sql  # Funciones SQL complementarias
├── package.json         # Dependencias y scripts del proyecto
├── tsconfig.json        # Configuración del compilador TypeScript
└── .env                 # Variables de entorno (no versionado)
```

---

## 🚀 Instalación y Configuración

### 1. Requisitos Previos

*   Tener instalado **Node.js** y **npm**.
*   Tener una base de datos **PostgreSQL** iniciada.

### 2. Instalación de Dependencias

Ejecuta el siguiente comando en la raíz del proyecto para instalar todas las dependencias:

```bash
npm install
```

### 3. Variables de Entorno

Duplica el archivo `.env.example` y renombralo a `.env`:

```bash
cp .env.example .env
```

Asegúrate de configurar los valores correctos para tu base de datos local:

```env
PORT=3000
NODE_ENV=development

# Configuración de Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tenebrosa
DB_USER=postgres
DB_PASSWORD=tu_contraseña_de_postgres

# JWT
JWT_SECRET=tu_secreto_jwt_muy_seguro_cambiar_en_produccion
JWT_EXPIRES_IN=7d
```

### 4. Inicialización y Semilla de Base de Datos

El proyecto cuenta con un script de semilla que automatiza:
1. La alteración de la tabla `PERSONAL` para agregar soporte de contraseñas.
2. El registro de dos usuarios de prueba con contraseñas seguras hasheadas con `bcrypt`.
3. La carga de funciones SQL críticas (`setup_functions.sql`) requeridas por el backend.

Ejecuta la semilla con el siguiente comando:

```bash
npm run db:seed
```

---

## 🏃 Ejecución del Servidor

### Modo Desarrollo (con recarga automática mediante Nodemon):

```bash
npm run dev
```

### Modo Producción (Compilación y Ejecución):

```bash
# Compilar código TypeScript a JavaScript
npm run build

# Iniciar servidor compilado
npm start
```

El servidor estará escuchando por defecto en: `http://localhost:3000`

---

## 🔑 Usuarios de Prueba

Para iniciar sesión y obtener el token JWT, puedes utilizar las siguientes credenciales:

*   **Usuario:** `juan@tenebrosa.com` / **Contraseña:** `password123`
*   **Usuario:** `maria@tenebrosa.com` / **Contraseña:** `password123`

---

## 📡 Endpoints de la API

La base de la API es `/api`. A continuación, se detallan las principales rutas:

### 🔐 Autenticación (`/api/auth`)
*   `POST /auth/login` - Iniciar sesión (retorna token JWT y datos del usuario)
*   `POST /auth/logout` - Cerrar sesión

### 📦 Productos (`/api/productos`)
*   `GET /productos` - Obtener lista paginada de productos
*   `GET /productos/:id` - Obtener producto por código
*   `GET /productos/stock/critico` - Obtener lista de productos con stock bajo el mínimo
*   `GET /productos/top` - Obtener lista de productos más vendidos
*   `POST /productos` - Crear nuevo producto
*   `PUT /productos/:id` - Actualizar producto
*   `DELETE /productos/:id` - Eliminar producto

### 👥 Clientes (`/api/clientes`)
*   `GET /clientes` - Obtener lista paginada de clientes
*   `GET /clientes/:id` - Obtener cliente por código
*   `GET /clientes/credito` - Obtener clientes que tienen habilitado el crédito
*   `POST /clientes` - Crear un cliente
*   `PUT /clientes/:id` - Actualizar datos del cliente
*   `DELETE /clientes/:id` - Eliminar cliente (si no tiene documentos asociados)

### 🛒 Ventas (`/api/ventas`)
*   `POST /ventas` - Registrar una nueva venta (Boleta/Factura). Genera cuotas en `CRONOGRAMA` si es crédito.
*   `GET /ventas` - Obtener listado de ventas realizadas
*   `GET /ventas/:id` - Obtener detalle y cronograma de una venta
*   `POST /ventas/:id/pago` - Registrar el pago de una cuota de crédito

### 📥 Compras / Abastecimiento (`/api/compras`)
*   `POST /compras` - Registrar una compra de abastecimiento (actualiza stock automáticamente)
*   `GET /compras` - Obtener listado de compras
*   `GET /compras/:id` - Obtener detalle de una compra

### 📊 Kardex e Inventario (`/api/kardex`)
*   `GET /kardex/producto/:productoId` - Obtener historial detallado de movimientos (Kardex) para un producto
*   `GET /kardex/stock/resumen` - Obtener resumen de stock total o filtrado por marca
*   `GET /kardex/stock/valorizacion` - Obtener valorización total del inventario (precio costo vs precio venta)

### 📈 Métricas de Dashboard (`/api/dashboard`)
*   `GET /dashboard/metrics` - Estadísticas y KPIs de ventas de hoy, del mes, anuales y variaciones
*   `GET /dashboard/ventas/mes` - Total ventas agrupadas por mes del año corriente
*   `GET /dashboard/ventas/dia` - Tendencia diaria de ventas de la última semana
*   `GET /dashboard/vendedores/top` - Ranking de vendedores con mayor facturación
*   `GET /dashboard/alertas/stock` - Notificaciones de stock crítico activo
