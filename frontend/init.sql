-- ============================================
-- SISTEMA DE CONTROL DE INVENTARIO Y KARDEX
-- FASE 1: CREACIÓN DE TABLAS
-- ============================================

-- ============================================
-- LIMPIAR OBJETOS EXISTENTES
-- ============================================
DROP TRIGGER IF EXISTS trg_actualizar_stock ON DETADOC;
DROP TRIGGER IF EXISTS trg_validar_stock ON DETADOC;

DROP VIEW IF EXISTS v_VentasDetalladas;
DROP VIEW IF EXISTS v_dimTiempo;
DROP VIEW IF EXISTS _Otros;
DROP VIEW IF EXISTS v_VentasPrevio;
DROP VIEW IF EXISTS v_Ventas;
DROP VIEW IF EXISTS v_cronograma;
DROP VIEW IF EXISTS v_Documento;

DROP TABLE IF EXISTS DETADOC CASCADE;
DROP TABLE IF EXISTS DETAPEDIDO CASCADE;
DROP TABLE IF EXISTS DETALIQUI CASCADE;
DROP TABLE IF EXISTS CRONOGRAMA CASCADE;
DROP TABLE IF EXISTS DOCUMENTO CASCADE;
DROP TABLE IF EXISTS PEDIDO CASCADE;
DROP TABLE IF EXISTS DETALLE_REQUERIMIENTO CASCADE;
DROP TABLE IF EXISTS REQUERIMIENTO CASCADE;
DROP TABLE IF EXISTS LIQUIDACION CASCADE;
DROP TABLE IF EXISTS META_MARCA_PERSONAL CASCADE;
DROP TABLE IF EXISTS META_PRODUCTO_ZONA CASCADE;
DROP TABLE IF EXISTS METAS_VENTA CASCADE;
DROP TABLE IF EXISTS META_SECTORISTA CASCADE;
DROP TABLE IF EXISTS VENTA_META CASCADE;
DROP TABLE IF EXISTS VENTA_META_Y CASCADE;
DROP TABLE IF EXISTS ZONA_MARCA_TIEMPO CASCADE;
DROP TABLE IF EXISTS PRONOSTICO_CLIENTE_MARCA CASCADE;
DROP TABLE IF EXISTS PRODUCTO_UNEGOCIO CASCADE;
DROP TABLE IF EXISTS PRODUCTO CASCADE;
DROP TABLE IF EXISTS CLIENTE CASCADE;
DROP TABLE IF EXISTS SEGUIMIENTO_X CASCADE;
DROP TABLE IF EXISTS SYS_DOCUMENTACION CASCADE;
DROP TABLE IF EXISTS MULTI_TABLA CASCADE;
DROP TABLE IF EXISTS PARAMETRO CASCADE;
DROP TABLE IF EXISTS PUNTO_PAGO CASCADE;
DROP TABLE IF EXISTS MEDIO_PAGO CASCADE;
DROP TABLE IF EXISTS BANCO CASCADE;
DROP TABLE IF EXISTS FORMA_PAGO CASCADE;
DROP TABLE IF EXISTS PERSONAL CASCADE;
DROP TABLE IF EXISTS TIENDA CASCADE;
DROP TABLE IF EXISTS UNEGOCIO CASCADE;
DROP TABLE IF EXISTS MARCA CASCADE;
DROP TABLE IF EXISTS LINEA CASCADE;
DROP TABLE IF EXISTS PROVEEDOR CASCADE;
DROP TABLE IF EXISTS ZONA CASCADE;
DROP TABLE IF EXISTS CIUDAD CASCADE;
DROP TABLE IF EXISTS TIPODOC CASCADE;
DROP TABLE IF EXISTS FERIADOS CASCADE;

-- ============================================
-- TABLAS MAESTRAS (Sin dependencias)
-- ============================================

-- Tabla TIPODOC - Tipos de documentos
CREATE TABLE TIPODOC (
    "TipoDoc" CHAR(1) PRIMARY KEY,
    "Descripcion" VARCHAR(30) NOT NULL,
    "Serie" CHAR(3),
    "Numero" INTEGER,
    "Signo" SMALLINT NOT NULL DEFAULT 1,
    "Unegocio" CHAR(2)
);

-- Tabla CIUDAD
CREATE TABLE CIUDAD (
    "idCiudad" INTEGER PRIMARY KEY,
    "Nombre" VARCHAR(100) NOT NULL
);

-- Tabla ZONA
CREATE TABLE ZONA (
    "Zona" CHAR(2) PRIMARY KEY,
    "Descripcion" VARCHAR(50) NOT NULL,
    "Ciudad" VARCHAR(30)
);

-- Tabla TIENDA
CREATE TABLE TIENDA (
    "idTienda" CHAR(2) PRIMARY KEY,
    "Descripcion" VARCHAR(100) NOT NULL,
    "Responsable" VARCHAR(50),
    "Region" INTEGER NOT NULL,
    "idCiudad" INTEGER REFERENCES CIUDAD ("idCiudad") ON DELETE SET NULL
);

-- Tabla PROVEEDOR
CREATE TABLE PROVEEDOR (
    "Proveedor" CHAR(4) PRIMARY KEY,
    "RazonSocial" VARCHAR(100) NOT NULL,
    "Direccion" VARCHAR(100),
    "email" VARCHAR(100),
    "Ruc" CHAR(11),
    "Local" BOOLEAN DEFAULT TRUE
);

-- Tabla LINEA
CREATE TABLE LINEA (
    "Linea" CHAR(2) PRIMARY KEY,
    "Descripcion" VARCHAR(100) NOT NULL,
    "ComiMayor" NUMERIC(6,2) NOT NULL
);

-- Tabla MARCA
CREATE TABLE MARCA (
    "Marca" CHAR(2) PRIMARY KEY,
    "Proveedor" CHAR(4) REFERENCES PROVEEDOR ("Proveedor") ON DELETE SET NULL,
    "Linea" CHAR(2) REFERENCES LINEA ("Linea") ON DELETE SET NULL,
    "Descripcion" VARCHAR(100) NOT NULL,
    "idLinea" CHAR(2),
    "idSubLinea" CHAR(2)
);

-- Tabla UNEGOCIO
CREATE TABLE UNEGOCIO (
    "UNegocio" CHAR(2) PRIMARY KEY,
    "Descripcion" VARCHAR(100) NOT NULL,
    "Responsable" VARCHAR(100),
    "sysEquipo" VARCHAR(100),
    "SysFecha" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "SysUsuario" VARCHAR(100)
);

-- ============================================
-- TABLAS DE PERSONAS Y CLIENTES
-- ============================================

-- Tabla PERSONAL (Con Password y Email)
CREATE TABLE PERSONAL (
    "Personal" CHAR(2) PRIMARY KEY,
    "Nombre" VARCHAR(100) NOT NULL,
    "Telefono" CHAR(11),
    "Activo" BOOLEAN DEFAULT TRUE,
    "Basico" NUMERIC(9,2) DEFAULT 0,
    "idTienda" CHAR(2) REFERENCES TIENDA ("idTienda") ON DELETE SET NULL,
    "fechaNac" TIMESTAMP,
    "Masculino" BOOLEAN DEFAULT TRUE,
    "idOficina" INTEGER,
    "fechaIngre" TIMESTAMP,
    "formato" CHAR(5),
    "Email" VARCHAR(100) UNIQUE,
    "Password" VARCHAR(255) NOT NULL
);

-- Tabla CLIENTE - CORREGIDA: idRepresentante ahora referencia PERSONAL
CREATE TABLE CLIENTE (
    "Cliente" CHAR(4) PRIMARY KEY,
    "Zona" CHAR(2) REFERENCES ZONA ("Zona") ON DELETE SET NULL,
    "Ruc" CHAR(11),
    "Nombre" VARCHAR(100) NOT NULL,
    "Direccion" VARCHAR(100),
    "Saldo" NUMERIC(9,2) DEFAULT 0,
    "credito" BOOLEAN DEFAULT FALSE,
    "topeCredito" NUMERIC(9,2) DEFAULT 0,
    "TipoCliente" CHAR(1) NOT NULL,
    "Calificacion" CHAR(1),
    "idRepresentante" CHAR(2) REFERENCES PERSONAL ("Personal") ON DELETE RESTRICT,
    "genero" CHAR(1) NOT NULL,
    "idCliente" SERIAL NOT NULL UNIQUE
);

-- ============================================
-- TABLAS DE PRODUCTOS
-- ============================================

-- Tabla PRODUCTO
CREATE TABLE PRODUCTO (
    "Producto" CHAR(4) PRIMARY KEY,
    "Marca" CHAR(2) REFERENCES MARCA ("Marca") ON DELETE SET NULL,
    "Descripcion" VARCHAR(200) NOT NULL,
    "StockAc" INTEGER DEFAULT 0 CHECK ("StockAc" >= 0),
    "StockMax" INTEGER DEFAULT 0,
    "StockMin" INTEGER DEFAULT 0,
    "PrecVenta" NUMERIC(9,2) DEFAULT 0 CHECK ("PrecVenta" >= 0),
    "PrecCosto" NUMERIC(9,2) DEFAULT 0 CHECK ("PrecCosto" >= 0),
    "Peso" NUMERIC(9,2) DEFAULT 0,
    "ConIgv" BOOLEAN DEFAULT TRUE,
    "UniMed" VARCHAR(20) DEFAULT 'UNIDAD',
    "idProducto" INTEGER,
    "idProd" SERIAL NOT NULL UNIQUE
);

-- ============================================
-- TABLAS DE PARÁMETROS Y CONFIGURACIÓN
-- ============================================

-- Tabla PARAMETRO
CREATE TABLE PARAMETRO (
    "Parametro" INTEGER PRIMARY KEY,
    "Igv" NUMERIC(8,2) DEFAULT 18,
    "TasaInt" NUMERIC(8,2) DEFAULT 0,
    "TasaLegal" NUMERIC(8,2) DEFAULT 0,
    "Fecha" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "TasaDolar" NUMERIC(9,2) DEFAULT 0,
    "activo" BOOLEAN DEFAULT TRUE,
    "Vencidos" SMALLINT DEFAULT 0
);

-- Tabla FORMA_PAGO
CREATE TABLE FORMA_PAGO (
    "FormaPago" CHAR(1) PRIMARY KEY,
    "Descripcion" VARCHAR(30) NOT NULL,
    "NroDias" INTEGER NOT NULL DEFAULT 0
);

-- Tabla BANCO
CREATE TABLE BANCO (
    "idBanco" CHAR(2) PRIMARY KEY,
    "nombreBanco" VARCHAR(100) NOT NULL
);

-- Tabla MEDIO_PAGO
CREATE TABLE MEDIO_PAGO (
    "idMedioPago" CHAR(2) PRIMARY KEY,
    "Descripcion" VARCHAR(100) NOT NULL,
    "Activo" BOOLEAN NOT NULL DEFAULT TRUE
);

-- Tabla PUNTO_PAGO
CREATE TABLE PUNTO_PAGO (
    "idPuntoPago" CHAR(2) PRIMARY KEY,
    "Descripcion" VARCHAR(100) NOT NULL,
    "Activo" BOOLEAN NOT NULL DEFAULT TRUE,
    "idTienda" CHAR(2) REFERENCES TIENDA ("idTienda") ON DELETE CASCADE
);

-- ============================================
-- TABLAS DE DOCUMENTOS Y TRANSACCIONES
-- ============================================

-- Tabla DOCUMENTO - Cabecera de transacciones
CREATE TABLE DOCUMENTO (
    "Documento" CHAR(9) NOT NULL,
    "TipoDoc" CHAR(1) NOT NULL REFERENCES TIPODOC ("TipoDoc") ON DELETE RESTRICT,
    "Proveedor" CHAR(4) REFERENCES PROVEEDOR ("Proveedor") ON DELETE SET NULL,
    "Pedido" CHAR(9),
    "Cliente" CHAR(4) REFERENCES CLIENTE ("Cliente") ON DELETE SET NULL,
    "Fecha" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "Estado" CHAR(1) DEFAULT 'P',
    "DocRefer" CHAR(9),
    "Personal" CHAR(2) REFERENCES PERSONAL ("Personal") ON DELETE SET NULL,
    "pagado" NUMERIC(9,2) DEFAULT 0,
    "IdTienda" CHAR(2) DEFAULT '01' REFERENCES TIENDA ("idTienda") ON DELETE SET NULL,
    "FormaPago" CHAR(1) REFERENCES FORMA_PAGO ("FormaPago") ON DELETE SET NULL,
    "Hora" TIMESTAMP,
    PRIMARY KEY ("Documento", "TipoDoc")
);

-- Tabla DETADOC - Detalles de documentos
CREATE TABLE DETADOC (
    "Documento" CHAR(9) NOT NULL,
    "TipoDoc" CHAR(1) NOT NULL,
    "Producto" CHAR(4) NOT NULL REFERENCES PRODUCTO ("Producto") ON DELETE RESTRICT,
    "Cantidad" NUMERIC(9,2) DEFAULT 0 CHECK ("Cantidad" > 0),
    "Igv" NUMERIC(9,2) DEFAULT 0,
    "PrecUnit" NUMERIC(9,2) DEFAULT 0,
    PRIMARY KEY ("Documento", "TipoDoc", "Producto"),
    FOREIGN KEY ("Documento", "TipoDoc") REFERENCES DOCUMENTO ("Documento", "TipoDoc") ON DELETE CASCADE
);

-- Tabla CRONOGRAMA - Plan de pagos
CREATE TABLE CRONOGRAMA (
    "NroCuota" INTEGER NOT NULL,
    "Documento" CHAR(9) NOT NULL,
    "TipoDoc" CHAR(1) NOT NULL,
    "Importe" NUMERIC(9,2) DEFAULT 0,
    "Interes" NUMERIC(9,2) DEFAULT 0,
    "IgvInteres" NUMERIC(9,2) DEFAULT 0,
    "feVence" TIMESTAMP NOT NULL,
    "Fepago" TIMESTAMP,
    "estado" CHAR(1) DEFAULT 'P',
    "idMedioPago" CHAR(2) REFERENCES MEDIO_PAGO ("idMedioPago") ON DELETE SET NULL,
    "idPuntoPago" CHAR(2) REFERENCES PUNTO_PAGO ("idPuntoPago") ON DELETE SET NULL,
    "idBanco" CHAR(2) REFERENCES BANCO ("idBanco") ON DELETE SET NULL,
    PRIMARY KEY ("NroCuota", "Documento", "TipoDoc"),
    FOREIGN KEY ("Documento", "TipoDoc") REFERENCES DOCUMENTO ("Documento", "TipoDoc") ON DELETE CASCADE
);

-- Tabla PEDIDO
CREATE TABLE PEDIDO (
    "Pedido" CHAR(9) PRIMARY KEY,
    "FormaPago" CHAR(1) REFERENCES FORMA_PAGO ("FormaPago") ON DELETE SET NULL,
    "Personal" CHAR(2) REFERENCES PERSONAL ("Personal") ON DELETE SET NULL,
    "Cliente" CHAR(4) REFERENCES CLIENTE ("Cliente") ON DELETE SET NULL,
    "Fecha" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "Estado" CHAR(1) DEFAULT 'P',
    "idTienda" CHAR(2) REFERENCES TIENDA ("idTienda") ON DELETE SET NULL
);

-- Tabla DETAPEDIDO - Detalles de pedidos
CREATE TABLE DETAPEDIDO (
    "Pedido" CHAR(9) NOT NULL REFERENCES PEDIDO ("Pedido") ON DELETE CASCADE,
    "Producto" CHAR(4) NOT NULL REFERENCES PRODUCTO ("Producto") ON DELETE RESTRICT,
    "Cantidad" NUMERIC(9,2) NOT NULL,
    "PrecUnit" NUMERIC(9,2),
    "FAB" INTEGER
);

-- ============================================
-- TABLAS DE METAS Y ANÁLISIS
-- ============================================

-- Tabla VENTA_META
CREATE TABLE VENTA_META (
    "idcodigo" SERIAL PRIMARY KEY,
    "personal" CHAR(2) REFERENCES PERSONAL ("Personal") ON DELETE CASCADE,
    "anual" INTEGER NOT NULL,
    "Mes" INTEGER NOT NULL,
    "zona" CHAR(2) REFERENCES ZONA ("Zona") ON DELETE SET NULL,
    "Monto" NUMERIC(38,6) DEFAULT 0
);

-- Tabla META_MARCA_PERSONAL
CREATE TABLE META_MARCA_PERSONAL (
    "personal" CHAR(2) NOT NULL REFERENCES PERSONAL ("Personal") ON DELETE CASCADE,
    "marca" CHAR(2) NOT NULL REFERENCES MARCA ("Marca") ON DELETE CASCADE,
    "Anualidad" INTEGER NOT NULL,
    "Mensualidad" INTEGER NOT NULL,
    "MontoPresupuesto" NUMERIC(38,2),
    PRIMARY KEY ("personal", "marca", "Anualidad", "Mensualidad")
);

-- Tabla META_PRODUCTO_ZONA
CREATE TABLE META_PRODUCTO_ZONA (
    "zona" CHAR(2) NOT NULL REFERENCES ZONA ("Zona") ON DELETE CASCADE,
    "producto" CHAR(4) NOT NULL REFERENCES PRODUCTO ("Producto") ON DELETE CASCADE,
    "Anualidad" INTEGER NOT NULL,
    "Mensualidad" INTEGER NOT NULL,
    "MontoPresupuesto" NUMERIC(38,2),
    PRIMARY KEY ("zona", "producto", "Anualidad", "Mensualidad")
);

-- Tabla METAS_VENTA
CREATE TABLE METAS_VENTA (
    "idMeta" INTEGER PRIMARY KEY,
    "Anual" INTEGER NOT NULL,
    "Mes" SMALLINT NOT NULL,
    "idSucursal" CHAR(2) REFERENCES TIENDA ("idTienda") ON DELETE SET NULL,
    "TipoCliente" CHAR(1),
    "MontoProy" NUMERIC(12,2)
);

-- Tabla META_SECTORISTA
CREATE TABLE META_SECTORISTA (
    "personal" CHAR(2) NOT NULL REFERENCES PERSONAL ("Personal") ON DELETE CASCADE,
    "Mes" INTEGER NOT NULL,
    "Anual" INTEGER NOT NULL,
    "Meta" NUMERIC(38,4),
    PRIMARY KEY ("personal", "Mes", "Anual")
);

-- Tabla VENTA_META_Y
CREATE TABLE VENTA_META_Y (
    "zona" CHAR(2) NOT NULL REFERENCES ZONA ("Zona") ON DELETE CASCADE,
    "Anual" INTEGER NOT NULL,
    "Mensual" INTEGER NOT NULL,
    "MetaVenta" NUMERIC(38,4),
    PRIMARY KEY ("zona", "Anual", "Mensual")
);

-- Tabla ZONA_MARCA_TIEMPO
CREATE TABLE ZONA_MARCA_TIEMPO (
    "zona" CHAR(2) NOT NULL REFERENCES ZONA ("Zona") ON DELETE CASCADE,
    "linea" CHAR(2) NOT NULL REFERENCES LINEA ("Linea") ON DELETE CASCADE,
    "Anualidad" INTEGER NOT NULL,
    "trimestre" INTEGER NOT NULL,
    "MontoProyectado" NUMERIC(38,2),
    PRIMARY KEY ("zona", "linea", "Anualidad", "trimestre")
);

-- ============================================
-- TABLAS DE APOYO Y CONFIGURACIÓN
-- ============================================

-- Tabla LIQUIDACION
CREATE TABLE LIQUIDACION (
    "liquidacion" CHAR(9) PRIMARY KEY,
    "Personal" CHAR(2) REFERENCES PERSONAL ("Personal") ON DELETE SET NULL,
    "Fecha" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla DETALIQUI - Detalle de liquidación
CREATE TABLE DETALIQUI (
    "liquidacion" CHAR(9) NOT NULL REFERENCES LIQUIDACION ("liquidacion") ON DELETE CASCADE,
    "Documento" CHAR(9) NOT NULL,
    "TipoDoc" CHAR(1) NOT NULL,
    "TipoPago" CHAR(1),
    "Importe" NUMERIC(9,2),
    "Estado" CHAR(1)
);

-- Tabla FERIADOS
CREATE TABLE FERIADOS (
    "fecha" TIMESTAMP PRIMARY KEY
);

-- Tabla MULTI_TABLA - Tabla parametrizable
CREATE TABLE MULTI_TABLA (
    "Tipo" CHAR(2) NOT NULL,
    "Valor" CHAR(3) NOT NULL,
    "Descripcion" VARCHAR(100),
    PRIMARY KEY ("Tipo", "Valor")
);

-- Tabla PRONOSTICO_CLIENTE_MARCA
CREATE TABLE PRONOSTICO_CLIENTE_MARCA (
    "idPronostico" SERIAL PRIMARY KEY,
    "marca" CHAR(2) NOT NULL REFERENCES MARCA ("Marca") ON DELETE CASCADE,
    "Anual" INTEGER NOT NULL,
    "TRIMEStre" INTEGER NOT NULL,
    "cliente" CHAR(4) NOT NULL REFERENCES CLIENTE ("Cliente") ON DELETE CASCADE,
    "Monto" NUMERIC(38,4)
);

-- Tabla PRODUCTO_UNEGOCIO
CREATE TABLE PRODUCTO_UNEGOCIO (
    "UNegocio" CHAR(2) REFERENCES UNEGOCIO ("UNegocio") ON DELETE CASCADE,
    "Producto" CHAR(4) REFERENCES PRODUCTO ("Producto") ON DELETE CASCADE,
    "Stockac" NUMERIC(9,2),
    PRIMARY KEY ("UNegocio", "Producto")
);

-- Tabla REQUERIMIENTO
CREATE TABLE REQUERIMIENTO (
    "item" INTEGER PRIMARY KEY,
    "descripcion" VARCHAR(100) NOT NULL,
    "Cubo" VARCHAR(50),
    "Proyecto" VARCHAR(100)
);

-- Tabla DETALLE_REQUERIMIENTO
CREATE TABLE DETALLE_REQUERIMIENTO (
    "Item" INTEGER PRIMARY KEY,
    "Tipo" VARCHAR(30),
    "Descripcion" VARCHAR(100) NOT NULL
);

-- Tabla SEGUIMIENTO_X - Auditoría de cambios
CREATE TABLE SEGUIMIENTO_X (
    "Item" SERIAL PRIMARY KEY,
    "Tabla" VARCHAR(100),
    "Campo" VARCHAR(100),
    "ValorActual" VARCHAR(100),
    "ValorNuevo" VARCHAR(100),
    "Usuario" VARCHAR(100),
    "Equipo" VARCHAR(100),
    "Fecha" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "Aplicacion" VARCHAR(100),
    "Codigo" VARCHAR(100)
);

-- Tabla SYS_DOCUMENTACION - Documentación del sistema
CREATE TABLE SYS_DOCUMENTACION (
    "Schemax" VARCHAR(255),
    "Tabla" VARCHAR(255),
    "Campo" VARCHAR(255),
    "Columna" VARCHAR(255),
    "max_length" SMALLINT,
    "scale" SMALLINT,
    "precision" SMALLINT,
    PRIMARY KEY ("Schemax", "Tabla", "Campo")
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX idx_documento_cliente ON DOCUMENTO ("Cliente");
CREATE INDEX idx_documento_personal ON DOCUMENTO ("Personal");
CREATE INDEX idx_documento_fecha ON DOCUMENTO ("Fecha");
CREATE INDEX idx_documento_tipodoc ON DOCUMENTO ("TipoDoc");
CREATE INDEX idx_detadoc_producto ON DETADOC ("Producto");
CREATE INDEX idx_detadoc_documento ON DETADOC ("Documento", "TipoDoc");
CREATE INDEX idx_cliente_zona ON CLIENTE ("Zona");
CREATE INDEX idx_producto_marca ON PRODUCTO ("Marca");
CREATE INDEX idx_cronograma_documento ON CRONOGRAMA ("Documento", "TipoDoc");

-- ============================================
-- FIN DE CREACIÓN DE TABLAS
-- ============================================


-- ============================================
-- SISTEMA DE CONTROL DE INVENTARIO Y KARDEX
-- FASE 2: CREACIÓN DE VISTAS
-- ============================================

-- ============================================
-- VISTAS DE ANÁLISIS
-- ============================================

CREATE OR REPLACE VIEW v_Documento AS
SELECT 
    d1."Documento",
    d1."TipoDoc",
    d1."Fecha",
    d1."Cliente",
    d1."Personal",
    d1."Estado",
    d1."pagado",
    SUM(COALESCE(dd1."Cantidad", 0) * COALESCE(dd1."PrecUnit", 0)) AS monto
FROM DOCUMENTO d1 
INNER JOIN DETADOC dd1 ON d1."Documento" = dd1."Documento" AND d1."TipoDoc" = dd1."TipoDoc"
GROUP BY d1."Documento", d1."TipoDoc", d1."Fecha", d1."Cliente", d1."Personal", d1."Estado", d1."pagado";

CREATE OR REPLACE VIEW v_cronograma AS
SELECT 
    "Documento",
    "TipoDoc",
    SUM("Importe") AS Programado,
    SUM(CASE WHEN "estado" = 'C' THEN "Importe" ELSE 0 END) AS cancelado
FROM CRONOGRAMA 
GROUP BY "Documento", "TipoDoc";

CREATE OR REPLACE VIEW v_Ventas AS
SELECT 
    CLIENTE."Cliente",
    CLIENTE."Zona",
    CLIENTE."Nombre",
    CLIENTE."TipoCliente",
    DOCUMENTO."Fecha",
    DOCUMENTO."pagado",
    DOCUMENTO."Personal",
    PRODUCTO."Producto",
    PRODUCTO."Marca",
    PRODUCTO."Descripcion",
    SUM(DETADOC."Cantidad") AS TotCantidad,
    SUM(DETADOC."PrecUnit" * DETADOC."Cantidad") AS TotMonto
FROM CLIENTE 
INNER JOIN DOCUMENTO ON CLIENTE."Cliente" = DOCUMENTO."Cliente"
INNER JOIN DETADOC ON DOCUMENTO."Documento" = DETADOC."Documento" AND DOCUMENTO."TipoDoc" = DETADOC."TipoDoc"
INNER JOIN PRODUCTO ON DETADOC."Producto" = PRODUCTO."Producto"
WHERE DOCUMENTO."TipoDoc" IN ('B', 'F')
GROUP BY CLIENTE."Cliente", CLIENTE."Zona", CLIENTE."Nombre", CLIENTE."TipoCliente",
         DOCUMENTO."Fecha", DOCUMENTO."pagado", DOCUMENTO."Personal",
         PRODUCTO."Producto", PRODUCTO."Marca", PRODUCTO."Descripcion";

CREATE OR REPLACE VIEW v_VentasPrevio AS
SELECT 
    EXTRACT(YEAR FROM vd."Fecha") AS anual,
    EXTRACT(MONTH FROM vd."Fecha") AS Mes,
    EXTRACT(DAY FROM vd."Fecha") AS Dia,
    vd."Cliente",
    c."Nombre" AS NomCliente,
    c."Zona",
    vd.monto,
    vd."pagado",
    vd."Fecha"
FROM v_Documento vd 
INNER JOIN CLIENTE c ON vd."Cliente" = c."Cliente"
WHERE vd."TipoDoc" IN ('B', 'F');

CREATE OR REPLACE VIEW _Otros AS
SELECT DISTINCT 
    EXTRACT(YEAR FROM d."Fecha") AS anual,
    EXTRACT(MONTH FROM d."Fecha") AS mes,
    SUM(dd."Cantidad" * dd."PrecUnit") AS monto,
    d."Personal",
    p."Descripcion" AS prod,
    m."Descripcion" AS marca,
    l."Descripcion" AS linea
FROM DOCUMENTO d 
INNER JOIN DETADOC dd ON dd."Documento" = d."Documento" AND d."TipoDoc" = dd."TipoDoc"
INNER JOIN PRODUCTO p ON p."Producto" = dd."Producto"
INNER JOIN MARCA m ON m."Marca" = p."Marca"
INNER JOIN LINEA l ON l."Linea" = m."Linea"
WHERE d."Cliente" IS NOT NULL AND d."TipoDoc" IN ('B', 'F')
GROUP BY EXTRACT(YEAR FROM d."Fecha"), EXTRACT(MONTH FROM d."Fecha"), d."Personal",
         p."Descripcion", m."Descripcion", l."Descripcion";

CREATE OR REPLACE VIEW v_dimTiempo AS
SELECT DISTINCT 
    EXTRACT(YEAR FROM d."Fecha") AS Anual,
    EXTRACT(YEAR FROM d."Fecha")::TEXT || CASE WHEN EXTRACT(MONTH FROM d."Fecha") < 7 THEN '-S1' ELSE '-S2' END AS Semestre,
    EXTRACT(QUARTER FROM d."Fecha") AS Trimestre,
    TO_CHAR(d."Fecha", 'Month') AS Mes,
    TO_CHAR(d."Fecha", 'Day') AS DiaSemana,
    EXTRACT(MONTH FROM d."Fecha") AS NroMes,
    TO_CHAR(d."Fecha", 'DD/MM/YYYY') AS idFecha
FROM DOCUMENTO d;

CREATE OR REPLACE VIEW v_VentasDetalladas AS
SELECT 
    DOCUMENTO."Documento",
    DOCUMENTO."TipoDoc",
    CLIENTE."Cliente",
    CLIENTE."Zona",
    DOCUMENTO."Fecha",
    DOCUMENTO."Pedido"
FROM CLIENTE 
INNER JOIN DOCUMENTO ON CLIENTE."Cliente" = DOCUMENTO."Cliente"
WHERE DOCUMENTO."TipoDoc" IN ('B', 'F');

-- ============================================
-- FIN DE CREACIÓN DE VISTAS
-- ============================================


-- ============================================
-- SISTEMA DE CONTROL DE INVENTARIO Y KARDEX
-- FASE 3: CREACIÓN DE FUNCIONES Y PROCEDIMIENTOS
-- ============================================

-- ============================================
-- FUNCIONES DE ANÁLISIS DE VENTAS
-- ============================================

CREATE OR REPLACE FUNCTION ven_AnalisisVenta(
    p_anual INTEGER,
    p_mes SMALLINT
)
RETURNS TABLE(
    Anual INTEGER,
    Mes INTEGER,
    Dia INTEGER,
    Cliente CHAR(4),
    Zona CHAR(2),
    CliNombre VARCHAR(100),
    Fecha TIMESTAMP,
    pagado NUMERIC(9,2),
    Personal CHAR(2),
    Marca CHAR(2),
    NomProducto VARCHAR(200),
    totcantidad NUMERIC,
    totMonto NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(YEAR FROM v."Fecha")::INTEGER,
        EXTRACT(MONTH FROM v."Fecha")::INTEGER,
        EXTRACT(DAY FROM v."Fecha")::INTEGER,
        v."Cliente",
        v."Zona",
        v."Nombre",
        v."Fecha",
        v."pagado",
        v."Personal",
        v."Marca",
        v."Descripcion",
        v."TotCantidad",
        v."TotMonto"
    FROM v_Ventas v
    WHERE EXTRACT(YEAR FROM v."Fecha") = p_anual
      AND EXTRACT(MONTH FROM v."Fecha") = p_mes;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION Ven_GeneraKardex(p_idproducto CHAR(4))
RETURNS TABLE(
    Documento CHAR(9),
    TipoDoc CHAR(1),
    Fecha TIMESTAMP,
    Cantidad NUMERIC(9,2),
    Stock NUMERIC(9,2),
    Signo SMALLINT
) AS $$
DECLARE
    v_stock NUMERIC(9,2) := 0;
    v_doc CHAR(9);
    v_tdoc CHAR(1);
    v_fecha TIMESTAMP;
    v_can NUMERIC(9,2);
    v_signo SMALLINT;
    cur CURSOR FOR 
        SELECT d."Documento", d."TipoDoc", d."Fecha", dd."Cantidad", COALESCE(td."Signo", 1)
        FROM DOCUMENTO d 
        INNER JOIN DETADOC dd ON d."Documento" = dd."Documento" AND dd."TipoDoc" = d."TipoDoc"
        LEFT JOIN TIPODOC td ON td."TipoDoc" = d."TipoDoc"
        WHERE dd."Producto" = p_idproducto
        ORDER BY d."Fecha", COALESCE(td."Signo", 1) DESC;
BEGIN
    CREATE TEMP TABLE temp_kardex AS
    SELECT d."Documento", d."TipoDoc", d."Fecha", dd."Cantidad", 0::NUMERIC(9,2) AS Stock, COALESCE(td."Signo", 1) as Signo
    FROM DOCUMENTO d 
    INNER JOIN DETADOC dd ON d."Documento" = dd."Documento" AND dd."TipoDoc" = d."TipoDoc"
    LEFT JOIN TIPODOC td ON td."TipoDoc" = d."TipoDoc"
    WHERE dd."Producto" = p_idproducto
    ORDER BY d."Fecha", COALESCE(td."Signo", 1) DESC;

    OPEN cur;
    LOOP
        FETCH cur INTO v_doc, v_tdoc, v_fecha, v_can, v_signo;
        EXIT WHEN NOT FOUND;
        v_stock := v_stock + (v_can * v_signo);
        UPDATE temp_kardex SET Stock = v_stock WHERE "Documento" = v_doc AND "TipoDoc" = v_tdoc;
    END LOOP;
    CLOSE cur;

    RETURN QUERY SELECT * FROM temp_kardex ORDER BY Fecha, Signo DESC;
    DROP TABLE temp_kardex;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIONES DE GESTIÓN DE PAGOS
-- ============================================

CREATE OR REPLACE FUNCTION Ven_GenerarCronograma(
    p_doc CHAR(9),
    p_tdoc CHAR(1),
    p_cuotas SMALLINT
)
RETURNS VOID AS $$
DECLARE
    v_igv NUMERIC(9,2);
    v_tasai NUMERIC(9,2);
    v_deuda NUMERIC(10,2) := 0;
    v_cta INTEGER := 0;
BEGIN
    SELECT COALESCE("Igv", 18)/100, COALESCE("TasaInt", 0)/100
    INTO v_igv, v_tasai
    FROM PARAMETRO
    WHERE "activo" = TRUE
    LIMIT 1;

    SELECT COALESCE(SUM("Cantidad" * "PrecUnit"), 0)
    INTO v_deuda
    FROM DETADOC
    WHERE "Documento" = p_doc AND "TipoDoc" = p_tdoc;

    WHILE v_cta < p_cuotas LOOP
        v_cta := v_cta + 1;
        INSERT INTO CRONOGRAMA (
            "NroCuota", "Documento", "TipoDoc", "Importe", "Interes", "IgvInteres", "feVence", "estado"
        )
        VALUES (
            v_cta,
            p_doc,
            p_tdoc,
            v_deuda / p_cuotas,
            v_tasai * v_deuda / p_cuotas,
            v_igv * v_tasai * v_deuda / p_cuotas,
            CURRENT_DATE + (v_cta || ' months')::INTERVAL,
            'P'
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIONES DE INDICADORES Y REPORTES
-- ============================================

CREATE OR REPLACE FUNCTION ven_Indicador_Venta(p_anual INTEGER)
RETURNS TABLE(
    Anual INTEGER,
    Mes INTEGER,
    MetaVenta NUMERIC,
    VentaReal NUMERIC
) AS $$
BEGIN
    CREATE TEMP TABLE temp_venta_real AS
    SELECT 
        EXTRACT(YEAR FROM "Fecha")::INTEGER AS Anual,
        EXTRACT(MONTH FROM "Fecha")::INTEGER AS Mes,
        SUM(monto) AS Monto
    FROM v_Documento
    WHERE EXTRACT(YEAR FROM "Fecha") = p_anual AND "TipoDoc" IN ('B', 'F')
    GROUP BY EXTRACT(YEAR FROM "Fecha"), EXTRACT(MONTH FROM "Fecha");

    RETURN QUERY
    SELECT 
        mv."anual"::INTEGER,
        mv."Mes"::INTEGER,
        COALESCE(SUM(mv."Monto"), 0) AS MetaVenta,
        COALESCE(vr.Monto, 0) AS VentaReal
    FROM VENTA_META mv
    LEFT JOIN temp_venta_real vr ON mv."anual" = vr.Anual AND mv."Mes" = vr.Mes
    WHERE mv."anual" = p_anual
    GROUP BY mv."anual", mv."Mes", vr.Monto;
    
    DROP TABLE temp_venta_real;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION ven_Indicador_Venta_P(p_anual INTEGER)
RETURNS TABLE(
    Anual INTEGER,
    Mes INTEGER,
    MetaVenta NUMERIC,
    VentaReal NUMERIC,
    Personal CHAR(2)
) AS $$
BEGIN
    CREATE TEMP TABLE temp_venta_real AS
    SELECT 
        EXTRACT(YEAR FROM "Fecha")::INTEGER AS Anual,
        EXTRACT(MONTH FROM "Fecha")::INTEGER AS Mes,
        SUM(monto) AS Monto,
        "Personal"
    FROM v_Documento
    WHERE EXTRACT(YEAR FROM "Fecha") = p_anual AND "TipoDoc" IN ('B', 'F')
    GROUP BY EXTRACT(YEAR FROM "Fecha"), EXTRACT(MONTH FROM "Fecha"), "Personal";

    RETURN QUERY
    SELECT 
        mv."anual"::INTEGER,
        mv."Mes"::INTEGER,
        SUM(mv."Monto") AS MetaVenta,
        COALESCE(vr.Monto, 0) AS VentaReal,
        mv."personal"
    FROM VENTA_META mv
    LEFT JOIN temp_venta_real vr ON mv."anual" = vr.Anual
                                  AND mv."Mes" = vr.Mes
                                  AND vr."Personal" = mv."personal"
    WHERE mv."anual" = p_anual
    GROUP BY mv."anual", mv."Mes", vr.Monto, mv."personal";
    
    DROP TABLE temp_venta_real;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION Ven_Indicadores(p_anual INTEGER)
RETURNS TABLE(
    Anual INTEGER,
    Mes INTEGER,
    Monto NUMERIC,
    Pagado NUMERIC(9,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(YEAR FROM vd."Fecha")::INTEGER,
        EXTRACT(MONTH FROM vd."Fecha")::INTEGER,
        vd.monto,
        vd."pagado"
    FROM v_Documento vd
    WHERE EXTRACT(YEAR FROM vd."Fecha") = p_anual AND vd."TipoDoc" IN ('B', 'F');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION Ven_ReporteDocumento(
    p_fecha1 TIMESTAMP,
    p_fecha2 TIMESTAMP,
    p_estado CHAR(1),
    p_personal CHAR(2)
)
RETURNS SETOF DOCUMENTO AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM DOCUMENTO
    WHERE "Fecha" >= p_fecha1
      AND "Fecha" < p_fecha2 + INTERVAL '1 day'
      AND "Estado" = p_estado
      AND "Personal" = p_personal;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION Ven_ReporteDocumento_Default(
    p_fecha1 TIMESTAMP,
    p_fecha2 TIMESTAMP,
    p_estado CHAR(1) DEFAULT 'C',
    p_personal CHAR(2) DEFAULT NULL
)
RETURNS SETOF DOCUMENTO AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM DOCUMENTO
    WHERE "Fecha" >= p_fecha1
      AND "Fecha" < p_fecha2 + INTERVAL '1 day'
      AND "Estado" = p_estado
      AND (p_personal IS NULL OR "Personal" = p_personal);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN PRINCIPAL: KARDEX CONSULTA
-- ============================================

CREATE OR REPLACE FUNCTION Kardex_Consulta(
    p_idproducto CHAR(4),
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL
)
RETURNS TABLE(
    documento TEXT,
    tipomov TEXT,
    fecha DATE,
    cantidad NUMERIC(9,2),
    stock NUMERIC(9,2)
) AS $$
DECLARE
    v_stock NUMERIC(9,2) := 0;
    v_doc CHAR(9);
    v_tdoc CHAR(1);
    v_fecha DATE;
    v_cantidad NUMERIC(9,2);
    v_signo INTEGER;
    cur CURSOR FOR 
        SELECT d."Documento", d."TipoDoc", d."Fecha"::DATE, dd."Cantidad", COALESCE(td."Signo", 1)
        FROM DOCUMENTO d 
        INNER JOIN DETADOC dd ON d."Documento" = dd."Documento" AND d."TipoDoc" = dd."TipoDoc"
        LEFT JOIN TIPODOC td ON td."TipoDoc" = d."TipoDoc"
        WHERE dd."Producto" = p_idproducto
            AND (p_fecha_inicio IS NULL OR d."Fecha" >= p_fecha_inicio)
            AND (p_fecha_fin IS NULL OR d."Fecha" <= p_fecha_fin)
        ORDER BY d."Fecha" ASC;
BEGIN
    CREATE TEMP TABLE temp_kardex AS
    SELECT 
        d."Documento",
        d."TipoDoc",
        d."Fecha"::DATE as Fecha,
        dd."Cantidad",
        COALESCE(td."Signo", 1) as Signo,
        0::NUMERIC(9,2) as Stock
    FROM DOCUMENTO d 
    INNER JOIN DETADOC dd ON d."Documento" = dd."Documento" AND d."TipoDoc" = dd."TipoDoc"
    LEFT JOIN TIPODOC td ON td."TipoDoc" = d."TipoDoc"
    WHERE dd."Producto" = p_idproducto
        AND (p_fecha_inicio IS NULL OR d."Fecha" >= p_fecha_inicio)
        AND (p_fecha_fin IS NULL OR d."Fecha" <= p_fecha_fin)
    ORDER BY d."Fecha" ASC;

    OPEN cur;
    LOOP
        FETCH cur INTO v_doc, v_tdoc, v_fecha, v_cantidad, v_signo;
        EXIT WHEN NOT FOUND;
        v_stock := v_stock + (v_cantidad * v_signo);
        UPDATE temp_kardex SET Stock = v_stock WHERE "Documento" = v_doc AND "TipoDoc" = v_tdoc;
    END LOOP;
    CLOSE cur;

    RETURN QUERY
    SELECT 
        k."Documento" || '-' || k."TipoDoc",
        CASE WHEN k.Signo = 1 THEN 'INGRESO' ELSE 'SALIDA' END,
        k.Fecha,
        k."Cantidad",
        k.Stock
    FROM temp_kardex k
    ORDER BY k.Fecha ASC;
    
    DROP TABLE temp_kardex;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIONES DE INVENTARIO
-- ============================================

CREATE OR REPLACE FUNCTION Stock_Resumen(p_marca CHAR(2) DEFAULT NULL)
RETURNS TABLE(
    producto CHAR(4),
    descripcion VARCHAR(200),
    stock_actual INTEGER,
    stock_minimo INTEGER,
    estado TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p."Producto",
        p."Descripcion",
        p."StockAc",
        p."StockMin",
        CASE WHEN p."StockAc" <= p."StockMin" THEN 'STOCK BAJO' ELSE 'NORMAL' END
    FROM PRODUCTO p
    WHERE p_marca IS NULL OR p."Marca" = p_marca
    ORDER BY p."StockAc" ASC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION Productos_StockCritico()
RETURNS TABLE(
    producto CHAR(4),
    descripcion VARCHAR(200),
    stock_actual INTEGER,
    stock_minimo INTEGER,
    faltante INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p."Producto",
        p."Descripcion",
        p."StockAc",
        p."StockMin",
        (p."StockMin" - p."StockAc")::INTEGER
    FROM PRODUCTO p
    WHERE p."StockAc" <= p."StockMin"
    ORDER BY (p."StockMin" - p."StockAc") DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION Top_Productos_Vendidos(p_limite INTEGER DEFAULT 10)
RETURNS TABLE(
    producto CHAR(4),
    descripcion VARCHAR(200),
    total_vendido NUMERIC(12,2),
    cantidad_vendida NUMERIC(12,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dd."Producto",
        p."Descripcion",
        SUM(dd."Cantidad" * dd."PrecUnit"),
        SUM(dd."Cantidad")
    FROM DETADOC dd
    INNER JOIN DOCUMENTO d ON d."Documento" = dd."Documento" AND d."TipoDoc" = dd."TipoDoc"
    INNER JOIN PRODUCTO p ON p."Producto" = dd."Producto"
    WHERE d."TipoDoc" IN ('B', 'F')
    GROUP BY dd."Producto", p."Descripcion"
    ORDER BY SUM(dd."Cantidad" * dd."PrecUnit") DESC
    LIMIT p_limite;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION Consulta_Stock_Rapido(p_producto CHAR(4) DEFAULT NULL)
RETURNS TABLE(
    producto CHAR(4),
    descripcion VARCHAR(200),
    stock_actual INTEGER,
    stock_minimo INTEGER,
    estado TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p."Producto",
        p."Descripcion",
        p."StockAc",
        p."StockMin",
        CASE WHEN p."StockAc" = 0 THEN 'AGOTADO'
             WHEN p."StockAc" <= p."StockMin" THEN 'STOCK BAJO'
             ELSE 'NORMAL'
        END
    FROM PRODUCTO p
    WHERE p_producto IS NULL OR p."Producto" = p_producto
    ORDER BY p."StockAc" ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIONES DE VALORIZACIÓN Y ROTACIÓN
-- ============================================

CREATE OR REPLACE FUNCTION Valorizacion_Inventario()
RETURNS TABLE(
    producto CHAR(4),
    descripcion VARCHAR(200),
    stock_actual INTEGER,
    precio_costo NUMERIC(9,2),
    valor_costo NUMERIC(12,2),
    precio_venta NUMERIC(9,2),
    valor_venta NUMERIC(12,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p."Producto",
        p."Descripcion",
        p."StockAc",
        p."PrecCosto",
        (p."StockAc" * p."PrecCosto")::NUMERIC(12,2),
        p."PrecVenta",
        (p."StockAc" * p."PrecVenta")::NUMERIC(12,2)
    FROM PRODUCTO p
    ORDER BY p."Descripcion";
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION Rotacion_Inventario(
    p_anio INTEGER,
    p_mes INTEGER DEFAULT NULL
)
RETURNS TABLE(
    producto CHAR(4),
    descripcion VARCHAR(200),
    cantidad_vendida NUMERIC(12,2),
    total_ventas NUMERIC(12,2),
    veces_vendido BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p."Producto",
        p."Descripcion",
        COALESCE(SUM(dd."Cantidad"), 0)::NUMERIC(12,2),
        COALESCE(SUM(dd."Cantidad" * dd."PrecUnit"), 0)::NUMERIC(12,2),
        COUNT(dd."Producto")::BIGINT
    FROM PRODUCTO p
    LEFT JOIN DETADOC dd ON p."Producto" = dd."Producto"
    LEFT JOIN DOCUMENTO d ON d."Documento" = dd."Documento" AND d."TipoDoc" = dd."TipoDoc" AND d."TipoDoc" IN ('B', 'F')
    WHERE (p_anio IS NULL OR EXTRACT(YEAR FROM d."Fecha") = p_anio)
      AND (p_mes IS NULL OR EXTRACT(MONTH FROM d."Fecha") = p_mes)
    GROUP BY p."Producto", p."Descripcion"
    ORDER BY COALESCE(SUM(dd."Cantidad" * dd."PrecUnit"), 0) DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION Kardex_Resumido(
    p_idproducto CHAR(4),
    p_anio INTEGER,
    p_mes INTEGER DEFAULT NULL
)
RETURNS TABLE(
    mes_nombre TEXT,
    anio INTEGER,
    mes INTEGER,
    ingresos NUMERIC(12,2),
    salidas NUMERIC(12,2),
    balance NUMERIC(12,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        TO_CHAR(d."Fecha", 'Month') AS mes_nombre,
        EXTRACT(YEAR FROM d."Fecha")::INTEGER AS anio,
        EXTRACT(MONTH FROM d."Fecha")::INTEGER AS mes,
        SUM(CASE WHEN COALESCE(td."Signo", 1) = 1 THEN dd."Cantidad" ELSE 0 END)::NUMERIC(12,2) AS ingresos,
        SUM(CASE WHEN COALESCE(td."Signo", 1) = -1 THEN dd."Cantidad" ELSE 0 END)::NUMERIC(12,2) AS salidas,
        SUM(dd."Cantidad" * COALESCE(td."Signo", 1))::NUMERIC(12,2) AS balance
    FROM DOCUMENTO d
    INNER JOIN DETADOC dd ON d."Documento" = dd."Documento" AND d."TipoDoc" = dd."TipoDoc"
    LEFT JOIN TIPODOC td ON td."TipoDoc" = d."TipoDoc"
    WHERE dd."Producto" = p_idproducto
      AND EXTRACT(YEAR FROM d."Fecha") = p_anio
      AND (p_mes IS NULL OR EXTRACT(MONTH FROM d."Fecha") = p_mes)
    GROUP BY EXTRACT(YEAR FROM d."Fecha"), EXTRACT(MONTH FROM d."Fecha"), TO_CHAR(d."Fecha", 'Month')
    ORDER BY EXTRACT(MONTH FROM d."Fecha") ASC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION Movimientos_PorFecha(
    p_fecha_inicio TIMESTAMP,
    p_fecha_fin TIMESTAMP,
    p_tipo_mov CHAR(1) DEFAULT NULL
)
RETURNS TABLE(
    documento CHAR(9),
    tipo_doc CHAR(1),
    descripcion_tipo TEXT,
    fecha TIMESTAMP,
    producto CHAR(4),
    descripcion_producto VARCHAR(200),
    cantidad NUMERIC(9,2),
    precio_unitario NUMERIC(9,2),
    signo INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d."Documento",
        d."TipoDoc",
        td."Descripcion" AS descripcion_tipo,
        d."Fecha",
        dd."Producto",
        p."Descripcion" AS descripcion_producto,
        dd."Cantidad",
        dd."PrecUnit",
        COALESCE(td."Signo", 1)::INTEGER AS signo
    FROM DOCUMENTO d
    INNER JOIN DETADOC dd ON d."Documento" = dd."Documento" AND d."TipoDoc" = dd."TipoDoc"
    LEFT JOIN TIPODOC td ON td."TipoDoc" = d."TipoDoc"
    INNER JOIN PRODUCTO p ON p."Producto" = dd."Producto"
    WHERE d."Fecha" >= p_fecha_inicio 
      AND d."Fecha" <= p_fecha_fin
      AND (p_tipo_mov IS NULL OR d."TipoDoc" = p_tipo_mov)
    ORDER BY d."Fecha" DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIONES ADICIONALES DE TRANSACCIONES
-- ============================================

-- 1. Registrar Venta
CREATE OR REPLACE FUNCTION Registrar_Venta(
    p_cliente CHAR(4),
    p_documento CHAR(9),
    p_fecha TIMESTAMP,
    p_personal CHAR(2),
    p_forma_pago CHAR(1),
    p_productos_json TEXT,
    p_credito BOOLEAN,
    p_cuotas INTEGER
)
RETURNS VARCHAR AS $$
DECLARE
    v_tipo_doc CHAR(1);
    v_rec RECORD;
    v_total NUMERIC(9,2) := 0;
    v_igv_rate NUMERIC(9,2);
    v_producto CHAR(4);
    v_cantidad NUMERIC(9,2);
    v_precio NUMERIC(9,2);
    v_igv_item NUMERIC(9,2);
BEGIN
    -- Determinar TipoDoc: 'F' para crédito, 'B' para contado
    IF p_credito THEN
        v_tipo_doc := 'F';
    ELSE
        v_tipo_doc := 'B';
    END IF;

    -- Obtener tasa de IGV activa
    SELECT COALESCE("Igv", 18) INTO v_igv_rate FROM PARAMETRO WHERE "activo" = TRUE LIMIT 1;
    IF v_igv_rate IS NULL THEN
        v_igv_rate := 18.00;
    END IF;

    -- Insertar Cabecera del Documento
    -- pagado se inicializará en 0 para crédito, o el total calculado para contado
    INSERT INTO DOCUMENTO ("Documento", "TipoDoc", "Cliente", "Fecha", "Estado", "Personal", "FormaPago", "pagado", "IdTienda")
    VALUES (p_documento, v_tipo_doc, p_cliente, p_fecha, 'P', p_personal, p_forma_pago, 0, '01');

    -- Iterar sobre el JSON de productos
    -- Estructura esperada: [{"producto":"PR01","cantidad":2,"precio":3500}]
    FOR v_rec IN SELECT * FROM json_to_recordset(p_productos_json::json) AS x(producto CHAR(4), cantidad NUMERIC(9,2), precio NUMERIC(9,2))
    LOOP
        v_producto := v_rec.producto;
        v_cantidad := v_rec.cantidad;
        v_precio := v_rec.precio;

        -- Calcular IGV por item
        v_igv_item := (v_precio * v_cantidad) * (v_igv_rate / 100.0);
        v_total := v_total + (v_precio * v_cantidad);

        -- Insertar en DETADOC (esto activará los triggers trg_validar_stock y trg_actualizar_stock)
        INSERT INTO DETADOC ("Documento", "TipoDoc", "Producto", "Cantidad", "Igv", "PrecUnit")
        VALUES (p_documento, v_tipo_doc, v_producto, v_cantidad, v_igv_item, v_precio);
    END LOOP;

    -- Si es al contado (no crédito), se marca como totalmente pagado y estado cancelado 'C'
    IF NOT p_credito THEN
        UPDATE DOCUMENTO 
        SET "pagado" = v_total, "Estado" = 'C' 
        WHERE "Documento" = p_documento AND "TipoDoc" = v_tipo_doc;
    ELSE
        -- Si es crédito, se genera el cronograma de pagos
        PERFORM Ven_GenerarCronograma(p_documento, v_tipo_doc, p_cuotas::SMALLINT);
    END IF;

    RETURN 'Venta registrada con éxito';
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error al registrar venta: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 2. Registrar Compra
CREATE OR REPLACE FUNCTION Registrar_Compra(
    p_proveedor CHAR(4),
    p_documento CHAR(9),
    p_fecha TIMESTAMP,
    p_personal CHAR(2),
    p_productos_json TEXT
)
RETURNS VARCHAR AS $$
DECLARE
    v_tipo_doc CHAR(1) := 'C';
    v_rec RECORD;
    v_total NUMERIC(9,2) := 0;
    v_igv_rate NUMERIC(9,2);
    v_producto CHAR(4);
    v_cantidad NUMERIC(9,2);
    v_precio NUMERIC(9,2);
    v_igv_item NUMERIC(9,2);
BEGIN
    -- Obtener tasa de IGV activa
    SELECT COALESCE("Igv", 18) INTO v_igv_rate FROM PARAMETRO WHERE "activo" = TRUE LIMIT 1;
    IF v_igv_rate IS NULL THEN
        v_igv_rate := 18.00;
    END IF;

    -- Insertar Cabecera de Compra
    INSERT INTO DOCUMENTO ("Documento", "TipoDoc", "Proveedor", "Fecha", "Estado", "Personal", "pagado", "IdTienda")
    VALUES (p_documento, v_tipo_doc, p_proveedor, p_fecha, 'C', p_personal, 0, '01');

    -- Iterar sobre los productos
    FOR v_rec IN SELECT * FROM json_to_recordset(p_productos_json::json) AS x(producto CHAR(4), cantidad NUMERIC(9,2), precio NUMERIC(9,2))
    LOOP
        v_producto := v_rec.producto;
        v_cantidad := v_rec.cantidad;
        v_precio := v_rec.precio;

        -- Calcular IGV por item
        v_igv_item := (v_precio * v_cantidad) * (v_igv_rate / 100.0);
        v_total := v_total + (v_precio * v_cantidad);

        -- Insertar en DETADOC (esto incrementará el stock del producto a través de trg_actualizar_stock)
        INSERT INTO DETADOC ("Documento", "TipoDoc", "Producto", "Cantidad", "Igv", "PrecUnit")
        VALUES (p_documento, v_tipo_doc, v_producto, v_cantidad, v_igv_item, v_precio);
    END LOOP;

    -- Actualizar el total pagado de la compra
    UPDATE DOCUMENTO 
    SET "pagado" = v_total 
    WHERE "Documento" = p_documento AND "TipoDoc" = v_tipo_doc;

    RETURN 'Compra registrada con éxito';
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error al registrar compra: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FIN DE CREACIÓN DE FUNCIONES
-- ============================================


-- ============================================
-- SISTEMA DE CONTROL DE INVENTARIO Y KARDEX
-- FASE 4: CREACIÓN DE FUNCIONES TRIGGERS
-- ============================================

-- ============================================
-- FUNCIÓN PARA ACTUALIZAR STOCK
-- ============================================

CREATE OR REPLACE FUNCTION Actualizar_Stock_Producto()
RETURNS TRIGGER AS $$
DECLARE
    v_signo INTEGER := 1;
    v_nueva_cantidad INTEGER;
BEGIN
    SELECT COALESCE("Signo", 1) INTO v_signo
    FROM TIPODOC
    WHERE "TipoDoc" = NEW."TipoDoc";

    v_nueva_cantidad := (NEW."Cantidad" * v_signo)::INTEGER;

    UPDATE PRODUCTO
    SET "StockAc" = "StockAc" + v_nueva_cantidad
    WHERE "Producto" = NEW."Producto";

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualizar_stock
AFTER INSERT ON DETADOC
FOR EACH ROW
EXECUTE FUNCTION Actualizar_Stock_Producto();

-- ============================================
-- FUNCIÓN PARA VALIDAR STOCK EN VENTAS
-- ============================================

CREATE OR REPLACE FUNCTION Validar_Stock_Venta()
RETURNS TRIGGER AS $$
DECLARE
    v_stock_actual INTEGER;
    v_signo INTEGER;
BEGIN
    SELECT COALESCE("Signo", 1) INTO v_signo
    FROM TIPODOC
    WHERE "TipoDoc" = NEW."TipoDoc";

    IF v_signo = -1 THEN
        SELECT "StockAc" INTO v_stock_actual
        FROM PRODUCTO
        WHERE "Producto" = NEW."Producto";

        IF v_stock_actual < NEW."Cantidad" THEN
            RAISE EXCEPTION 'Stock insuficiente para producto %. Stock disponible: %, solicitado: %',
                NEW."Producto", v_stock_actual, NEW."Cantidad";
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_stock
BEFORE INSERT ON DETADOC
FOR EACH ROW
EXECUTE FUNCTION Validar_Stock_Venta();

-- ============================================
-- FUNCIÓN PARA AUDITORÍA DE CAMBIOS
-- ============================================

CREATE OR REPLACE FUNCTION Auditar_Cambios()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO SEGUIMIENTO_X (
            "Tabla",
            "Campo",
            "ValorActual",
            "ValorNuevo",
            "Fecha",
            "Usuario"
        )
        VALUES (
            TG_TABLE_NAME,
            'UPDATE_GENERAL',
            OLD::TEXT,
            NEW::TEXT,
            CURRENT_TIMESTAMP,
            CURRENT_USER
        );
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO SEGUIMIENTO_X (
            "Tabla",
            "Campo",
            "ValorActual",
            "Fecha",
            "Usuario"
        )
        VALUES (
            TG_TABLE_NAME,
            'DELETE',
            OLD::TEXT,
            CURRENT_TIMESTAMP,
            CURRENT_USER
        );
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FIN DE CREACIÓN DE TRIGGERS
-- ============================================


-- ============================================
-- SISTEMA DE CONTROL DE INVENTARIO Y KARDEX
-- FASE 5: INSERCIÓN DE DATOS BASE
-- ============================================

-- ============================================
-- LIMPIAR DATOS EXISTENTES
-- ============================================

DELETE FROM DETADOC;
DELETE FROM DETAPEDIDO;
DELETE FROM DETALIQUI;
DELETE FROM CRONOGRAMA;
DELETE FROM DOCUMENTO;
DELETE FROM PEDIDO;
DELETE FROM LIQUIDACION;
DELETE FROM VENTA_META;
DELETE FROM META_MARCA_PERSONAL;
DELETE FROM META_PRODUCTO_ZONA;
DELETE FROM METAS_VENTA;
DELETE FROM META_SECTORISTA;
DELETE FROM VENTA_META_Y;
DELETE FROM ZONA_MARCA_TIEMPO;
DELETE FROM PRONOSTICO_CLIENTE_MARCA;
DELETE FROM PRODUCTO;
DELETE FROM CLIENTE;
DELETE FROM PERSONAL;
DELETE FROM PUNTO_PAGO;
DELETE FROM MEDIO_PAGO;
DELETE FROM BANCO;
DELETE FROM FORMA_PAGO;
DELETE FROM PRODUCTO_UNEGOCIO;
DELETE FROM PARAMETRO;
DELETE FROM MARCA;
DELETE FROM LINEA;
DELETE FROM PROVEEDOR;
DELETE FROM UNEGOCIO;
DELETE FROM TIENDA;
DELETE FROM ZONA;
DELETE FROM CIUDAD;
DELETE FROM TIPODOC;
DELETE FROM FERIADOS;

-- ============================================
-- INSERTAR DATOS MAESTROS
-- ============================================

-- TIPODOC: Tipos de documentos
INSERT INTO TIPODOC ("TipoDoc", "Descripcion", "Serie", "Numero", "Signo", "Unegocio")
VALUES
    ('C', 'COMPRA', 'CMP', 1, 1, '01'),
    ('B', 'BOLETA', 'BOL', 1, -1, '01'),
    ('F', 'FACTURA', 'FAC', 1, -1, '01'),
    ('N', 'NOTA CREDITO', 'NCD', 1, 1, '01'),
    ('D', 'NOTA DEBITO', 'NDB', 1, -1, '01'),
    ('P', 'PEDIDO', 'PED', 1, 0, '01');

-- CIUDAD
INSERT INTO CIUDAD ("idCiudad", "Nombre")
VALUES
    (1, 'LIMA'),
    (2, 'CALLAO'),
    (3, 'AREQUIPA');

-- ZONA
INSERT INTO ZONA ("Zona", "Descripcion", "Ciudad")
VALUES
    ('01', 'ZONA NORTE', 'LIMA'),
    ('02', 'ZONA SUR', 'AREQUIPA'),
    ('03', 'ZONA CENTRAL', 'CALLAO');

-- TIENDA
INSERT INTO TIENDA ("idTienda", "Descripcion", "Responsable", "Region", "idCiudad")
VALUES
    ('01', 'TIENDA CENTRAL LIMA', 'JUAN PEREZ', 1, 1),
    ('02', 'TIENDA NORTE CALLAO', 'MARIA LOPEZ', 2, 2),
    ('03', 'TIENDA SUR AREQUIPA', 'CARLOS RODRIGUEZ', 3, 3);

-- UNEGOCIO
INSERT INTO UNEGOCIO ("UNegocio", "Descripcion", "Responsable", "SysUsuario")
VALUES
    ('01', 'UNIDAD DE NEGOCIO CENTRAL', 'ADMIN', 'SYSTEM');

-- PROVEEDOR
INSERT INTO PROVEEDOR ("Proveedor", "RazonSocial", "Ruc", "email", "Local")
VALUES
    ('P001', 'PROV A', '20123456789', 'info@proveedor.com', TRUE),
    ('P002', 'PROV B', '20987654321', 'ventas@distribuidora.com', TRUE),
    ('P003', 'PROV C', '20555666777', 'importaciones@empresa.com', FALSE);

-- LINEA
INSERT INTO LINEA ("Linea", "Descripcion", "ComiMayor")
VALUES
    ('L1', 'ELECTRONICA', 5.00),
    ('L2', 'INFORMATICA', 7.50),
    ('L3', 'ACCESORIOS', 3.50);

-- MARCA
INSERT INTO MARCA ("Marca", "Proveedor", "Linea", "Descripcion", "idLinea", "idSubLinea")
VALUES
    ('M1', 'P001', 'L1', 'SAMSUNG', 'L1', NULL),
    ('M2', 'P002', 'L1', 'LG', 'L1', NULL),
    ('M3', 'P001', 'L2', 'HP', 'L2', NULL),
    ('M4', 'P002', 'L2', 'DELL', 'L2', NULL),
    ('M5', 'P003', 'L3', 'ACCESORIOS', 'L3', NULL);

-- PARAMETRO
INSERT INTO PARAMETRO ("Parametro", "Igv", "TasaInt", "TasaLegal", "TasaDolar", "activo", "Vencidos")
VALUES
    (1, 18.00, 1.50, 2.00, 3.80, TRUE, 30);

-- FORMA_PAGO
INSERT INTO FORMA_PAGO ("FormaPago", "Descripcion", "NroDias")
VALUES
    ('E', 'EFECTIVO', 0),
    ('T', 'TARJETA', 0),
    ('Y', 'YAPE/PLIN', 0),
    ('C', 'CREDITO', 30);

-- BANCO
INSERT INTO BANCO ("idBanco", "nombreBanco")
VALUES
    ('01', 'BANCO DEL CREDITO'),
    ('02', 'INTERBANK'),
    ('03', 'SCOTIABANK'),
    ('04', 'BBVA PERU');

-- MEDIO_PAGO
INSERT INTO MEDIO_PAGO ("idMedioPago", "Descripcion", "Activo")
VALUES
    ('01', 'EFECTIVO', TRUE),
    ('02', 'TRANSFERENCIA BANCARIA', TRUE),
    ('03', 'CHEQUE', TRUE),
    ('04', 'TARJETA CREDITO', TRUE),
    ('05', 'TARJETA DEBITO', TRUE);

-- PUNTO_PAGO
INSERT INTO PUNTO_PAGO ("idPuntoPago", "Descripcion", "Activo", "idTienda")
VALUES
    ('01', 'CAJA PRINCIPAL', TRUE, '01'),
    ('02', 'CAJA SECUNDARIA', TRUE, '01'),
    ('03', 'CAJA TIENDA NORTE', TRUE, '02'),
    ('04', 'CAJA TIENDA SUR', TRUE, '03');

-- ============================================
-- INSERTAR PERSONAL (Con Password Hasheado bcrypt)
-- Contraseña: password123
-- Hash bcrypt: $2a$10$qKiMCsS2UuLSKM6XJIktUO0O1/q/WxFAHSt9WxNekvYIGTSha/5xW
-- ============================================

INSERT INTO PERSONAL (
    "Personal", "Nombre", "Telefono", "Activo", "Basico",
    "idTienda", "Email", "Password", "fechaIngre"
)
VALUES
    ('01', 'JUAN PEREZ RAMOS', '9876543210', TRUE, 2500.00, '01',
     'juan@tenebrosa.com', '$2a$10$qKiMCsS2UuLSKM6XJIktUO0O1/q/WxFAHSt9WxNekvYIGTSha/5xW', CURRENT_DATE),
    ('02', 'MARIA LOPEZ GARCIA', '9876543211', TRUE, 2600.00, '02',
     'maria@tenebrosa.com', '$2a$10$qKiMCsS2UuLSKM6XJIktUO0O1/q/WxFAHSt9WxNekvYIGTSha/5xW', CURRENT_DATE),
    ('03', 'CARLOS RODRIGUEZ SMITH', '9876543212', TRUE, 2550.00, '03',
     'carlos.rodriguez@tenebrosa.com', '$2a$10$qKiMCsS2UuLSKM6XJIktUO0O1/q/WxFAHSt9WxNekvYIGTSha/5xW', CURRENT_DATE),
    ('04', 'SANDRA MARTINEZ TORRES', '9876543213', TRUE, 2400.00, '01',
     'sandra.martinez@tenebrosa.com', '$2a$10$qKiMCsS2UuLSKM6XJIktUO0O1/q/WxFAHSt9WxNekvYIGTSha/5xW', CURRENT_DATE);

-- ============================================
-- INSERTAR CLIENTES - CORREGIDO: idRepresentante ahora referencia PERSONAL (CHAR(2))
-- ============================================

INSERT INTO CLIENTE (
    "Cliente", "Zona", "Nombre", "Ruc",
    "idRepresentante", "genero", "TipoCliente",
    "credito", "topeCredito", "Calificacion"
)
VALUES
    ('CL01', '01', 'EMPRESA EJEMPLO SAC', '20123456789', '01', 'M', 'E', FALSE, 0.00, 'A'),
    ('CL02', '02', 'CLIENTE VIP AREQUIPA', '20987654321', '02', 'F', 'V', TRUE, 50000.00, 'A'),
    ('CL03', '01', 'NEGOCIO CENTRAL LIMA', '20555666777', '03', 'M', 'N', TRUE, 30000.00, 'B'),
    ('CL04', '03', 'TIENDA CALLAO EXPRESS', '20444555666', '04', 'F', 'E', TRUE, 25000.00, 'B');

-- ============================================
-- INSERTAR PRODUCTOS
-- ============================================

INSERT INTO PRODUCTO (
    "Producto", "Marca", "Descripcion",
    "StockAc", "StockMax", "StockMin",
    "PrecVenta", "PrecCosto", "ConIgv", "UniMed"
)
VALUES
    ('PR01', 'M1', 'SAMSUNG GALAXY S23', 100, 500, 10, 3500.00, 2500.00, TRUE, 'UNIDAD'),
    ('PR02', 'M1', 'SAMSUNG TV 55 4K', 50, 200, 5, 2000.00, 1400.00, TRUE, 'UNIDAD'),
    ('PR03', 'M2', 'LG MONITOR 24 FHD', 75, 300, 10, 850.00, 600.00, TRUE, 'UNIDAD'),
    ('PR04', 'M3', 'HP LAPTOP 15.6 I7', 30, 100, 3, 2800.00, 2000.00, TRUE, 'UNIDAD'),
    ('PR05', 'M4', 'DELL DESKTOP GAME', 25, 80, 3, 3200.00, 2300.00, TRUE, 'UNIDAD'),
    ('PR06', 'M5', 'CABLE HDMI 3M', 500, 1000, 50, 35.00, 20.00, TRUE, 'UNIDAD'),
    ('PR07', 'M5', 'MOUSE INALAMBR', 200, 500, 50, 45.00, 25.00, TRUE, 'UNIDAD');

-- ============================================
-- INSERTAR DOCUMENTOS DE PRUEBA (Compras)
-- ============================================

INSERT INTO DOCUMENTO (
    "Documento", "TipoDoc", "Proveedor",
    "Fecha", "Estado", "pagado", "IdTienda", "Personal"
)
VALUES
    ('C00000001', 'C', 'P001', '2026-01-15 10:00:00', 'C', 12000.00, '01', '01'),
    ('C00000002', 'C', 'P002', '2026-03-20 14:30:00', 'C', 8500.00, '01', '01'),
    ('C00000003', 'C', 'P003', '2026-05-05 09:00:00', 'C', 5000.00, '02', '02');

-- ============================================
-- INSERTAR DETALLES DE DOCUMENTOS (Compras)
-- ============================================

INSERT INTO DETADOC ("Documento", "TipoDoc", "Producto", "Cantidad", "Igv", "PrecUnit")
VALUES
    ('C00000001', 'C', 'PR01', 10, 18, 2500.00),
    ('C00000001', 'C', 'PR02', 8, 18, 1400.00),
    ('C00000002', 'C', 'PR04', 5, 18, 2000.00),
    ('C00000002', 'C', 'PR03', 10, 18, 600.00),
    ('C00000003', 'C', 'PR06', 200, 18, 20.00),
    ('C00000003', 'C', 'PR07', 100, 18, 25.00);

-- ============================================
-- INSERTAR DOCUMENTOS DE VENTAS
-- ============================================

INSERT INTO DOCUMENTO (
    "Documento", "TipoDoc", "Cliente",
    "Fecha", "Estado", "pagado", "IdTienda", "Personal", "FormaPago"
)
VALUES
    ('B00000001', 'B', 'CL01', '2026-02-10 10:30:00', 'C', 7000.00, '01', '01', 'E'),
    ('F00000001', 'F', 'CL02', '2026-04-15 15:00:00', 'P', 0.00, '02', '02', 'C'),
    ('B00000002', 'B', 'CL03', '2026-06-02 11:20:00', 'C', 4500.00, '01', '03', 'E');

-- ============================================
-- INSERTAR DETALLES DE VENTAS
-- ============================================

INSERT INTO DETADOC ("Documento", "TipoDoc", "Producto", "Cantidad", "Igv", "PrecUnit")
VALUES
    ('B00000001', 'B', 'PR01', 2, 18, 3500.00),
    ('F00000001', 'F', 'PR02', 1, 18, 2000.00),
    ('F00000001', 'F', 'PR03', 2, 18, 850.00),
    ('B00000002', 'B', 'PR06', 100, 18, 35.00);

-- ============================================
-- INSERTAR METAS DE VENTA
-- ============================================

INSERT INTO VENTA_META ("personal", "anual", "Mes", "zona", "Monto")
VALUES
    ('01', 2026, 1, '01', 50000.00),
    ('01', 2026, 2, '01', 55000.00),
    ('01', 2026, 3, '01', 60000.00),
    ('01', 2026, 4, '01', 62000.00),
    ('01', 2026, 5, '01', 65000.00),
    ('01', 2026, 6, '01', 70000.00),
    ('02', 2026, 1, '02', 45000.00),
    ('02', 2026, 2, '02', 48000.00),
    ('02', 2026, 3, '02', 50000.00),
    ('02', 2026, 4, '02', 52000.00),
    ('02', 2026, 5, '02', 55000.00),
    ('02', 2026, 6, '02', 58000.00);

-- ============================================
-- INSERTAR META SECTORISTA
-- ============================================

INSERT INTO META_SECTORISTA ("personal", "Mes", "Anual", "Meta")
VALUES
    ('01', 1, 2026, 50000.00),
    ('01', 2, 2026, 55000.00),
    ('01', 3, 2026, 60000.00),
    ('01', 4, 2026, 62000.00),
    ('01', 5, 2026, 65000.00),
    ('01', 6, 2026, 70000.00),
    ('02', 1, 2026, 45000.00),
    ('02', 2, 2026, 48000.00),
    ('02', 3, 2026, 50000.00),
    ('02', 4, 2026, 52000.00),
    ('02', 5, 2026, 55000.00),
    ('02', 6, 2026, 58000.00);

-- ============================================
-- VERIFICAR DATOS INSERTADOS
-- ============================================

-- Contar registros por tabla
SELECT 'TIPODOC' as Tabla, COUNT(*) as Registros FROM TIPODOC UNION ALL
SELECT 'CIUDAD', COUNT(*) FROM CIUDAD UNION ALL
SELECT 'ZONA', COUNT(*) FROM ZONA UNION ALL
SELECT 'TIENDA', COUNT(*) FROM TIENDA UNION ALL
SELECT 'PERSONAL', COUNT(*) FROM PERSONAL UNION ALL
SELECT 'CLIENTE', COUNT(*) FROM CLIENTE UNION ALL
SELECT 'PROVEEDOR', COUNT(*) FROM PROVEEDOR UNION ALL
SELECT 'LINEA', COUNT(*) FROM LINEA UNION ALL
SELECT 'MARCA', COUNT(*) FROM MARCA UNION ALL
SELECT 'PRODUCTO', COUNT(*) FROM PRODUCTO UNION ALL
SELECT 'DOCUMENTO', COUNT(*) FROM DOCUMENTO UNION ALL
SELECT 'DETADOC', COUNT(*) FROM DETADOC UNION ALL
SELECT 'VENTA_META', COUNT(*) FROM VENTA_META;

-- ============================================
-- FIN DE INSERCIÓN DE DATOS BASE
-- ============================================


