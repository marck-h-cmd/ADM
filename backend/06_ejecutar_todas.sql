-- ============================================
-- SISTEMA DE CONTROL DE INVENTARIO Y KARDEX
-- SCRIPT MAESTRO: EJECUTAR TODA LA BASE DE DATOS
-- ============================================

-- IMPORTANTE: Ejecutar este script desde psql en el directorio BACKEND
-- COMANDO: cd backend && psql -U postgres -d tenebrosa -f 06_ejecutar_todas.sql

-- ============================================
-- PASO 1: CREAR TABLAS
-- ============================================

\echo '========================================='
\echo 'PASO 1: Creando estructura de tablas...'
\echo '========================================='
\i 01_crear_tablas.sql

-- ============================================
-- PASO 2: CREAR VISTAS
-- ============================================

\echo '========================================='
\echo 'PASO 2: Creando vistas...'
\echo '========================================='
\i 02_crear_vistas.sql

-- ============================================
-- PASO 3: CREAR FUNCIONES
-- ============================================

\echo '========================================='
\echo 'PASO 3: Creando funciones y procedimientos...'
\echo '========================================='
\i 03_crear_funciones.sql

-- ============================================
-- PASO 4: CREAR TRIGGERS
-- ============================================

\echo '========================================='
\echo 'PASO 4: Creando triggers...'
\echo '========================================='
\i 04_crear_triggers.sql

-- ============================================
-- PASO 5: INSERTAR DATOS BASE
-- ============================================

\echo '========================================='
\echo 'PASO 5: Insertando datos base...'
\echo '========================================='
\i 05_insertar_datos_base.sql

-- ============================================
-- PASO 6: VERIFICACIONES FINALES
-- ============================================

\echo '========================================='
\echo 'PASO 6: Realizando verificaciones finales...'
\echo '========================================='

-- Verificar que todas las tablas fueron creadas correctamente
\echo ''
\echo '--- TABLAS CREADAS ---'
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verificar vistas
\echo ''
\echo '--- VISTAS CREADAS ---'
SELECT table_name FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar funciones
\echo ''
\echo '--- FUNCIONES CREADAS ---'
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- Prueba de funcionalidad básica
\echo ''
\echo '========================================='
\echo 'PRUEBAS DE FUNCIONALIDAD'
\echo '========================================='

-- Test 1: Verificar productos con stock
\echo ''
\echo '--- TEST 1: Productos en inventario ---'
SELECT * FROM Consulta_Stock_Rapido();

-- Test 2: Verificar kardex
\echo ''
\echo '--- TEST 2: Kardex del producto PR01 ---'
SELECT * FROM Kardex_Consulta('PR01');

-- Test 3: Verificar stock crítico
\echo ''
\echo '--- TEST 3: Productos en stock crítico ---'
SELECT * FROM Productos_StockCritico();

-- Test 4: Top productos vendidos
\echo ''
\echo '--- TEST 4: Top 5 productos más vendidos ---'
SELECT * FROM Top_Productos_Vendidos(5);

-- Test 5: Indicadores de venta
\echo ''
\echo '--- TEST 5: Indicadores de venta 2024 ---'
SELECT * FROM Ven_Indicadores(2024);

\echo ''
\echo '========================================='
\echo '✅ BASE DE DATOS CREADA EXITOSAMENTE'
\echo '========================================='
\echo ''
\echo 'La base de datos "tenebrosa" está lista para usar.'
\echo ''
