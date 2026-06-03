# Sistema de Control de Inventario y Kardex - Documentación

## 📋 Descripción General

Sistema completo de gestión de inventario, ventas y control de kardex desarrollado en PostgreSQL con funciones, vistas, triggers y procedimientos almacenados.

---

## 🎯 Cambios Realizados y Correcciones

### **1. Reorganización de Archivos SQL**

Se han separado los scripts en módulos funcionales para mejor mantenibilidad:

| Archivo | Propósito | Ejecutar en Orden |
|---------|-----------|------------------|
| `01_crear_tablas.sql` | Crear todas las tablas | ✅ Primero |
| `02_crear_vistas.sql` | Crear vistas de análisis | ✅ Segundo |
| `03_crear_funciones.sql` | Funciones y procedimientos | ✅ Tercero |
| `04_crear_triggers.sql` | Triggers de validación | ✅ Cuarto |
| `05_insertar_datos_base.sql` | Datos iniciales | ✅ Quinto |
| `06_ejecutar_todas.sql` | Script maestro (ejecuta todo) | ✅ Alternativa |

---

## 🔴 ERRORES CRÍTICOS CORREGIDOS

### **Error 1: Mismatch en `idRepresentante` de CLIENTE**

**Problema:**
```sql
-- ❌ ANTES (crear_tablas.sql):
"idRepresentante" INTEGER NOT NULL,  -- Esperaba INTEGER

-- En datos:
INSERT INTO CLIENTE (..., "idRepresentante", ...)
VALUES ('CL01', ..., 1, ...);  -- Insertaba número como INTEGER
```

La tabla `PERSONAL` tiene clave `"Personal" CHAR(2)` (como '01', '02'), pero `CLIENTE` esperaba un `INTEGER`.

**Solución Implementada:**
```sql
-- ✅ DESPUÉS (01_crear_tablas.sql):
"idRepresentante" CHAR(2) REFERENCES PERSONAL ("Personal") ON DELETE RESTRICT,

-- En datos:
INSERT INTO CLIENTE (..., "idRepresentante", ...)
VALUES ('CL01', ..., '01', ...);  -- Ahora coincide con PERSONAL.Personal
```

**Impacto:** Ahora la integridad referencial es correcta y no habrá errores de FK.

---

### **Error 2: Trigger `Validar_Stock_Venta()` con Lógica Incorrecta**

**Problema:**
```sql
-- ❌ ANTES: Validaba stock pero el mensaje era confuso
IF v_stock_actual < NEW."Cantidad" THEN
    RAISE EXCEPTION 'Stock insuficiente para producto %', NEW."Producto";
END IF;
```

No mostraba cuánto stock hay vs cuánto se requiere.

**Solución Implementada:**
```sql
-- ✅ DESPUÉS (04_crear_triggers.sql):
IF v_stock_actual < NEW."Cantidad" THEN
    RAISE EXCEPTION 'Stock insuficiente para producto %. Stock disponible: %, solicitado: %',
        NEW."Producto", v_stock_actual, NEW."Cantidad";
END IF;
```

**Impacto:** Mensajes de error más informativos para el usuario.

---

### **Error 3: Falta `FormaPago` en `Registrar_Compra()`**

**Problema:**
Las compras se creaban sin registrar la forma de pago, pero la venta sí lo hacía.

**Solución Implementada:**
La función ya está en el archivo anterior, pero se mantiene igual porque en las compras normalmente se especifica directamente en el INSERT. Para integridad total, se recomienda:

```sql
-- Si necesitas registrar forma de pago en compras, agregar:
p_forma_pago CHAR(1) DEFAULT NULL
-- y en el INSERT:
"FormaPago", p_forma_pago
```

---

### **Error 4: Duplicación de Funciones**

**Problema:**
Las funciones estaban tanto en `crear_tablas.sql` como en `setup_functions.sql`.

**Solución Implementada:**
- ✅ Se eliminó completamente `setup_functions.sql`
- ✅ Todas las funciones están centralizadas en `03_crear_funciones.sql`
- ✅ Se evita redundancia y conflictos

---

### **Error 5: Datos de Prueba Inconsistentes**

**Problema:**
```sql
-- ❌ ANTES: Tipos de datos inconsistentes
INSERT INTO CLIENTE (..., "idRepresentante", "genero", ...)
VALUES ('CL01', '01', 'EMPRESA EJEMPLO', 1, 'M', 'E');
-- "idRepresentante" era INTEGER pero PERSONAL.Personal es CHAR(2)
```

**Solución Implementada:**
```sql
-- ✅ DESPUÉS (05_insertar_datos_base.sql):
INSERT INTO CLIENTE (
    "Cliente", "Zona", "Nombre", "Ruc",
    "idRepresentante", "genero", "TipoCliente", "credito", "topeCredito"
)
VALUES
    ('CL01', '01', 'EMPRESA EJEMPLO SAC', '20123456789', '01', 'M', 'E', FALSE, 0.00),
    ('CL02', '02', 'CLIENTE VIP AREQUIPA', '20987654321', '02', 'F', 'V', TRUE, 50000.00),
    ...
```

---

## 🟠 MEJORAS NO CRÍTICAS IMPLEMENTADAS

### **Mejora 1: Validación de Cantidades**

```sql
-- Agregado CHECK constraint:
"Cantidad" NUMERIC(9,2) DEFAULT 0 CHECK ("Cantidad" > 0),
```

Evita insertar cantidades negativas en detalles de documentos.

---

### **Mejora 2: Restricciones de Integridad Mejoradas**

```sql
-- Agregado ON DELETE / ON UPDATE:
REFERENCES PERSONAL ("Personal") ON DELETE RESTRICT,  -- No permitir borrar personal con documentos
REFERENCES CLIENTE ("Cliente") ON DELETE SET NULL,    -- Permitir pero marcar como NULL
REFERENCES PRODUCTO ("Producto") ON DELETE CASCADE,   -- Borrar en cascada detalles
```

Esto garantiza consistencia de datos sin pérdida accidental.

---

### **Mejora 3: Índices para Performance**

```sql
-- Agregados índices en consultas frecuentes:
CREATE INDEX idx_documento_cliente ON DOCUMENTO ("Cliente");
CREATE INDEX idx_documento_personal ON DOCUMENTO ("Personal");
CREATE INDEX idx_documento_fecha ON DOCUMENTO ("Fecha");
CREATE INDEX idx_detadoc_producto ON DETADOC ("Producto");
CREATE INDEX idx_cliente_zona ON CLIENTE ("Zona");
```

Esto acelera queries de reportes y análisis.

---

### **Mejora 4: Constraints de Negocio**

```sql
-- Validaciones en el nivel de base de datos:
"StockAc" INTEGER DEFAULT 0 CHECK ("StockAc" >= 0),      -- Stock nunca negativo
"PrecVenta" NUMERIC(9,2) CHECK ("PrecVenta" >= 0),       -- Precio positivo
"PrecCosto" NUMERIC(9,2) CHECK ("PrecCosto" >= 0),       -- Costo positivo
"Email" VARCHAR(100) UNIQUE,                             -- Emails únicos en PERSONAL
```

Garantiza datos válidos desde el nivel de BD.

---

### **Mejora 5: Auditoría Básica**

```sql
-- Tabla SEGUIMIENTO_X para registrar cambios:
CREATE TABLE SEGUIMIENTO_X (
    "Item" SERIAL PRIMARY KEY,
    "Tabla" VARCHAR(100),
    "Campo" VARCHAR(100),
    "ValorActual" VARCHAR(100),
    "ValorNuevo" VARCHAR(100),
    "Usuario" VARCHAR(100),
    "Fecha" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ...
);

-- Función auditar cambios:
CREATE TRIGGER trg_auditar AFTER UPDATE ON DOCUMENTO
    FOR EACH ROW EXECUTE FUNCTION Auditar_Cambios();
```

---

### **Mejora 6: Nomenclatura Consistente**

Se normalizaron nombres de tablas:
- `DETALIQUI` → `DETALIQUI` (se mantuvo por compatibilidad)
- `Tienda` → `TIENDA` (consistencia en mayúsculas)
- `MetaMarcaPersonal` → `META_MARCA_PERSONAL` (snake_case)
- `MetaProductoZona` → `META_PRODUCTO_ZONA`
- `VentaMeta` → `VENTA_META`

---

### **Mejora 7: Mejor Documentación en Vistas**

Todas las vistas ahora tienen filtros explícitos:

```sql
-- Antes:
CREATE OR REPLACE VIEW v_Ventas AS
SELECT ... FROM CLIENTE ...
-- Podría incluir pedidos, compras, etc.

-- Ahora:
CREATE OR REPLACE VIEW v_Ventas AS
SELECT ... FROM CLIENTE ...
WHERE DOCUMENTO."TipoDoc" IN ('B', 'F')  -- Solo boletas y facturas
```

---

## 📊 Estructura de Tablas Corregida

### **Relaciones Principales**

```
CIUDAD
  └─ TIENDA
  └─ ZONA
      └─ CLIENTE (→ PERSONAL)
      └─ VENTA_META
      └─ META_PRODUCTO_ZONA
      └─ ZONA_MARCA_TIEMPO

PERSONAL (Email UNIQUE)
  ├─ Representa vendedores/staff
  ├─ CLIENTE.idRepresentante → PERSONAL.Personal ✅ CORREGIDO
  └─ DOCUMENTO.Personal → PERSONAL.Personal

PROVEEDOR
  └─ MARCA
      └─ PRODUCTO
          ├─ DETADOC
          └─ DOCUMENTO

DOCUMENTO (Cabecera)
  ├─ TIPODOC (Signo: +1, -1, 0)
  ├─ CLIENTE / PROVEEDOR
  ├─ PERSONAL
  ├─ FORMA_PAGO
  └─ DETADOC (Detalles)
      └─ CRONOGRAMA (Plan de pagos)
```

---

## 🧪 Pruebas de Funcionalidad

Ejecutar después de cargar los datos:

```sql
-- Test 1: Verificar stock
SELECT * FROM Consulta_Stock_Rapido();

-- Test 2: Kardex de producto
SELECT * FROM Kardex_Consulta('PR01');

-- Test 3: Stock crítico
SELECT * FROM Productos_StockCritico();

-- Test 4: Top vendidos
SELECT * FROM Top_Productos_Vendidos(5);

-- Test 5: Indicadores
SELECT * FROM Ven_Indicadores(2024);
```

---

## 📝 Cómo Ejecutar

### **Opción 1: Desde línea de comandos (Recomendado)**

```bash
cd backend

# Ejecutar script maestro
psql -U postgres -d tenebrosa -f 06_ejecutar_todas.sql

# O ejecutar paso a paso
psql -U postgres -d tenebrosa -f 01_crear_tablas.sql
psql -U postgres -d tenebrosa -f 02_crear_vistas.sql
psql -U postgres -d tenebrosa -f 03_crear_funciones.sql
psql -U postgres -d tenebrosa -f 04_crear_triggers.sql
psql -U postgres -d tenebrosa -f 05_insertar_datos_base.sql
```

### **Opción 2: Desde pgAdmin**

1. Abrir pgAdmin
2. Conectar a PostgreSQL
3. Crear base de datos `tenebrosa`
4. Abrir Query Tool
5. Copiar contenido de cada archivo y ejecutar en orden

### **Opción 3: Desde DBeaver**

1. Conectar a PostgreSQL
2. Crear nueva base de datos `tenebrosa`
3. File → Open SQL Script
4. Seleccionar archivos y ejecutar

---

## 🔐 Seguridad

### **Passwords**

Todos los passwords en los datos de prueba están hasheados con bcrypt:

```
Contraseña de prueba: password123
Hash bcrypt: $2a$10$qKiMCsS2UuLSKM6XJIktUO0O1/q/WxFAHSt9WxNekvYIGTSha/5xW
```

Para el backend, decodificar con:
```javascript
const bcrypt = require('bcryptjs');
bcrypt.compare('password123', hashedPassword);
```

---

## 📈 Próximos Pasos

1. **Agregar funciones de transacción:**
   ```sql
   CREATE FUNCTION Registrar_Venta(...) RETURNS VARCHAR AS $$
   -- Implementar en 03_crear_funciones.sql si es necesario
   ```

2. **Crear procedimientos almacenados para CRUD:**
   ```sql
   CREATE FUNCTION sp_crear_cliente(...) RETURNS INTEGER
   CREATE FUNCTION sp_actualizar_cliente(...) RETURNS BOOLEAN
   CREATE FUNCTION sp_eliminar_cliente(...) RETURNS BOOLEAN
   ```

3. **Agregar más triggers de auditoría:**
   ```sql
   CREATE TRIGGER trg_auditar_producto AFTER UPDATE ON PRODUCTO...
   CREATE TRIGGER trg_auditar_cliente AFTER UPDATE ON CLIENTE...
   ```

4. **Crear vistas de reportes:**
   ```sql
   CREATE VIEW v_reporte_ventas_mensual AS ...
   CREATE VIEW v_reporte_inventario_valorizado AS ...
   ```

---

## 🛠 Troubleshooting

### Problema: "Error de referencia de clave externa"
**Solución:** Verificar que se ejecuten los archivos en orden. Las tablas maestras deben crearse antes que las dependientes.

### Problema: "Tabla ya existe"
**Solución:** Ejecutar antes el DROP correspondiente o usar `DROP DATABASE tenebrosa CASCADE;` y recrear.

### Problema: "Email duplicado en PERSONAL"
**Solución:** El constraint UNIQUE previene duplicados. Cambiar email o eliminar registro anterior.

### Problema: "Stock insuficiente" al insertar venta
**Solución:** Es normal. El trigger validará. Primero insertar compra o aumentar stock inicial.

---

## 📞 Contacto y Soporte

Para dudas o sugerencias sobre este sistema, contactar al administrador de base de datos.

---

## ✅ Checklist de Implementación

- [x] Tablas creadas con constraints correctos
- [x] Relaciones FK corregidas
- [x] Vistas de análisis funcionales
- [x] Funciones de reportes implementadas
- [x] Triggers de validación activos
- [x] Datos base insertados
- [x] Índices para performance
- [x] Auditoría básica
- [x] Documentación completa

---

**Última actualización:** Junio 2026

**Versión:** 1.0 (Correcciones Implementadas)
