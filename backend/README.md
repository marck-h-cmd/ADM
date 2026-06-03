# 📦 Sistema KARDEX - Control de Inventario y Ventas

## 🎯 ¿Qué es este Proyecto?

Sistema completo de gestión de inventario desarrollado en **PostgreSQL** que permite:

✅ **Gestionar Inventario**: Crear, actualizar y consultar productos  
✅ **Registrar Compras y Ventas**: Documentos con detalles de transacciones  
✅ **Control de Stock**: Triggers automáticos que validan stock disponible  
✅ **Kardex**: Histórico completo de movimientos de inventario  
✅ **Reportes**: Análisis de ventas, top productos, indicadores de gestión  
✅ **Seguimiento**: Auditoría de cambios en transacciones  

---

## 📚 ¿Qué haremos en este Semestre?

### **Fase 1: Base de Datos ✅ COMPLETADO**
- ✅ Crear 27 tablas con relaciones y constraints
- ✅ Diseñar 7 vistas analíticas
- ✅ Implementar 20 funciones SQL
- ✅ Crear 2 triggers para validación automática
- ✅ Insertar 80+ registros de datos de prueba

### **Fase 2: Backend TypeScript (PRÓXIMO)**
Crearemos API REST con Express que:
- Conecte a PostgreSQL
- CRUD (Create, Read, Update, Delete) para productos, clientes, documentos
- Autenticación con JWT
- Endpoints protegidos

### **Fase 3: Frontend (PRÓXIMO)**
Interfaz visual para:
- Listar productos con stock
- Registrar ventas/compras
- Consultar kardex
- Ver reportes

### **Fase 4: Deploy (FINAL)**
- Subir a Google Cloud
- Publicar en línea

---

## 🗂️ Estructura del Proyecto

```
backend/
│
├── 📄 SQL Scripts (Base de Datos)
│   ├── 01_crear_tablas.sql          → Estructura (27 tablas)
│   ├── 02_crear_vistas.sql          → Vistas de análisis (7 vistas)
│   ├── 03_crear_funciones.sql       → Funciones SQL (20 funciones)
│   ├── 04_crear_triggers.sql        → Validación automática (2 triggers)
│   ├── 05_insertar_datos_base.sql   → Datos de prueba (80+ registros)
│   └── 06_ejecutar_todas.sql        → ⭐ Ejecuta TODO de una vez
│
├── 📋 Documentación
│   ├── README.md                    → Este archivo (LEER PRIMERO)
│   └── CORRECCIONES.md              → Errores encontrados y solucionados
│
├── ⚙️ Configuración
│   ├── package.json                 → Dependencias Node.js
│   ├── tsconfig.json                → Configuración TypeScript
│   ├── docker-compose.yml           → PostgreSQL en Docker
│   └── nodemon.json                 → Auto-reload en desarrollo
│
└── 🚀 Source Code (Próximo)
    └── src/
        ├── index.ts                 → Punto de entrada
        ├── config/                  → Conexión BD
        ├── controllers/             → Lógica de endpoints
        ├── routes/                  → Rutas API
        ├── services/                → Funciones de negocio
        └── middleware/              → Autenticación, validación
```

---

## 🚀 Cómo Ejecutar

### **OPCIÓN A: Script Maestro (Recomendado) ⭐**

```powershell
# 1. Ir al directorio backend
cd backend

# 2. Crear BD (primera vez)
$env:PGPASSWORD='123456'
& "C:\Program Files\PostgreSQL\17\bin\psql" -U postgres -h localhost -c "CREATE DATABASE tenebrosa;"

# 3. Ejecutar script maestro
& "C:\Program Files\PostgreSQL\17\bin\psql" -U postgres -d tenebrosa -f 06_ejecutar_todas.sql
```

### **OPCIÓN B: Paso a Paso**

Si prefieres ver qué se crea en cada paso:

```powershell
$env:PGPASSWORD='123456'
& "C:\Program Files\PostgreSQL\17\bin\psql" -U postgres -d tenebrosa -f 01_crear_tablas.sql
& "C:\Program Files\PostgreSQL\17\bin\psql" -U postgres -d tenebrosa -f 02_crear_vistas.sql
& "C:\Program Files\PostgreSQL\17\bin\psql" -U postgres -d tenebrosa -f 03_crear_funciones.sql
& "C:\Program Files\PostgreSQL\17\bin\psql" -U postgres -d tenebrosa -f 04_crear_triggers.sql
& "C:\Program Files\PostgreSQL\17\bin\psql" -U postgres -d tenebrosa -f 05_insertar_datos_base.sql
```

### **OPCIÓN C: Desde PGAdmin (GUI)**

1. Abrir PGAdmin (http://localhost:5050)
2. Conectar a PostgreSQL local
3. Crear base de datos `tenebrosa`
4. Copiar contenido de cada `.sql` en Query Tool
5. Ejecutar (F5)

---

## 📊 Lo que se Crea

### **Tablas (27 totales)**
- `TIPODOC` - Tipos de documentos (compra, venta, nota crédito)
- `CLIENTE` - Clientes con zona y representante
- `PERSONAL` - Vendedores/Staff (con email y password bcrypt)
- `PRODUCTO` - Productos con marca y stock
- `DOCUMENTO` - Cabecera de compras/ventas
- `DETADOC` - Detalle de productos en cada documento
- `CRONOGRAMA` - Plan de pagos a crédito
- Y 20 tablas más...

### **Vistas (7 totales)**
- `v_Documento` - Resumen de documentos
- `v_Ventas` - Detalle de ventas (solo tipo 'B', 'F')
- `v_Cronograma` - Estado de pagos
- Y 4 vistas más para análisis

### **Funciones (20 totales)**
- `Kardex_Consulta()` - Histórico de movimientos
- `Stock_Resumen()` - Inventario por marca
- `Top_Productos_Vendidos()` - Productos más vendidos
- `Ven_Indicadores()` - Indicadores de venta
- Y 16 funciones más...

### **Triggers (2 totales)**
- `trg_validar_stock` - Valida que haya stock antes de vender
- `trg_actualizar_stock` - Actualiza stock automáticamente

---

## ✅ Verificar que Todo Funciona

Después de ejecutar el script, prueba estas consultas en PGAdmin:

```sql
-- Test 1: Ver productos con stock
SELECT * FROM Consulta_Stock_Rapido();

-- Test 2: Kardex del producto PR01
SELECT * FROM Kardex_Consulta('PR01');

-- Test 3: Top 5 productos vendidos
SELECT * FROM Top_Productos_Vendidos(5);

-- Test 4: Indicadores de venta
SELECT * FROM Ven_Indicadores(2024);
```

**Si todas devuelven datos ✅ = Base de datos está lista**

---

## 🔐 Credenciales de Prueba

### Base de Datos
```
Usuario: postgres
Contraseña: 123456
Base de datos: tenebrosa
```

### Personal (dentro de BD)
```
Email: juan.perez@tenebrosa.com
Contraseña: password123
Hash: $2a$10$qKiMCsS2UuLSKM6XJIktUO0O1/q/WxFAHSt9WxNekvYIGTSha/5xW (bcrypt)
```

---

## 📌 Datos de Prueba Precargados

### Productos
- PR01: Samsung Galaxy S23 (100 units)
- PR02: Samsung TV 55" (50 units)
- PR03: LG Monitor 24" (75 units)
- PR04: HP Laptop (30 units)
- PR05: Dell Desktop (25 units)
- PR06: Cable HDMI (500 units)
- PR07: Mouse Inalámbrico (200 units)

### Clientes
- CL01: Empresa Ejemplo SAC
- CL02: Cliente VIP Arequipa
- CL03: Negocio Central Lima
- CL04: Tienda Callao Express

### Documentos
- C00000001-C: Compra 1
- C00000002-C: Compra 2
- C00000003-C: Compra 3
- B00000001-B: Venta 1 (Boleta)
- F00000001-F: Venta 2 (Factura)
- B00000002-B: Venta 3 (Boleta)

---

## 🐛 Si Hay Problemas

### Error: "Base de datos ya existe"
```powershell
$env:PGPASSWORD='123456'
& "C:\Program Files\PostgreSQL\17\bin\psql" -U postgres -h localhost `
  -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='tenebrosa';" `
  -c "DROP DATABASE IF EXISTS tenebrosa;" `
  -c "CREATE DATABASE tenebrosa;"
```

### Error: "Tabla ya existe"
Significa que ejecutaste el script 2 veces. Los DROP IF EXISTS limpian primero, pero si repites, ya existen. Ejecuta de nuevo el comando de arriba.

### Error: "psql no se reconoce"
Necesitas estar en la carpeta `backend` o usar la ruta completa:
```powershell
& "C:\Program Files\PostgreSQL\17\bin\psql" -U postgres ...
```

---

## 📚 Próximos Pasos (Semana que Viene)

1. **Backend Node.js/TypeScript**
   - Crear endpoints CRUD
   - Conectar a PostgreSQL
   - Autenticación JWT

2. **Frontend React**
   - Listar productos
   - Crear ventas
   - Ver reportes

3. **Deploy Google Cloud**
   - Subir a Cloud SQL
   - API en Cloud Run
   - Frontend en Cloud Storage

---

## 👥 Equipo

Este proyecto es desarrollo como **grupo de clase**. 

Cada miembro debe tener copia de estos archivos y poder ejecutar el script.

---

## 📞 Contacto

Si tienes dudas sobre la BD o necesitas ayuda:
1. Lee este README.md completo
2. Revisa CORRECCIONES.md para entender qué se arregló
3. Pregunta en clase o al profesor

---

## ✨ Resumen

| Aspecto | Estado |
|---------|--------|
| Base de Datos | ✅ Completa |
| SQL Scripts | ✅ Probados |
| Datos Iniciales | ✅ Precargados |
| Documentación | ✅ Completa |
| Backend | 🔄 Próximo |
| Frontend | 🔄 Próximo |
| Deploy | 🔄 Final |

---

**Última actualización:** Junio 2026  
**Versión:** 1.0  
**Estado:** ✅ Listo para usar
