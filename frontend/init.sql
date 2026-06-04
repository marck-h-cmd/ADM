-- ============================================
-- SISTEMA DE CONTROL DE INVENTARIO Y KARDEX
-- ARCHIVO CONSOLIDADO DE INICIALIZACIÓN (SQL SERVER)
-- ============================================

SET QUOTED_IDENTIFIER ON;
GO

-- ============================================
-- FASE 1: CREACIÓN DE TABLAS
-- ============================================

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_detadoc_insert')
    DROP TRIGGER trg_detadoc_insert;
GO

IF EXISTS (SELECT * FROM sys.views WHERE name = 'v_VentasDetalladas')
    DROP VIEW v_VentasDetalladas;
IF EXISTS (SELECT * FROM sys.views WHERE name = 'v_dimTiempo')
    DROP VIEW v_dimTiempo;
IF EXISTS (SELECT * FROM sys.views WHERE name = '_Otros')
    DROP VIEW _Otros;
IF EXISTS (SELECT * FROM sys.views WHERE name = 'v_VentasPrevio')
    DROP VIEW v_VentasPrevio;
IF EXISTS (SELECT * FROM sys.views WHERE name = 'v_Ventas')
    DROP VIEW v_Ventas;
IF EXISTS (SELECT * FROM sys.views WHERE name = 'v_cronograma')
    DROP VIEW v_cronograma;
IF EXISTS (SELECT * FROM sys.views WHERE name = 'v_Documento')
    DROP VIEW v_Documento;
GO

DROP TABLE IF EXISTS DETADOC;
DROP TABLE IF EXISTS DETAPEDIDO;
DROP TABLE IF EXISTS DETALIQUI;
DROP TABLE IF EXISTS CRONOGRAMA;
DROP TABLE IF EXISTS DOCUMENTO;
DROP TABLE IF EXISTS PEDIDO;
DROP TABLE IF EXISTS DETALLE_REQUERIMIENTO;
DROP TABLE IF EXISTS REQUERIMIENTO;
DROP TABLE IF EXISTS LIQUIDACION;
DROP TABLE IF EXISTS META_MARCA_PERSONAL;
DROP TABLE IF EXISTS META_PRODUCTO_ZONA;
DROP TABLE IF EXISTS METAS_VENTA;
DROP TABLE IF EXISTS META_SECTORISTA;
DROP TABLE IF EXISTS VENTA_META;
DROP TABLE IF EXISTS VENTA_META_Y;
DROP TABLE IF EXISTS ZONA_MARCA_TIEMPO;
DROP TABLE IF EXISTS PRONOSTICO_CLIENTE_MARCA;
DROP TABLE IF EXISTS PRODUCTO_UNEGOCIO;
DROP TABLE IF EXISTS PRODUCTO;
DROP TABLE IF EXISTS CLIENTE;
DROP TABLE IF EXISTS SEGUIMIENTO_X;
DROP TABLE IF EXISTS SYS_DOCUMENTACION;
DROP TABLE IF EXISTS MULTI_TABLA;
DROP TABLE IF EXISTS PARAMETRO;
DROP TABLE IF EXISTS PUNTO_PAGO;
DROP TABLE IF EXISTS MEDIO_PAGO;
DROP TABLE IF EXISTS BANCO;
DROP TABLE IF EXISTS FORMA_PAGO;
DROP TABLE IF EXISTS PERSONAL;
DROP TABLE IF EXISTS TIENDA;
DROP TABLE IF EXISTS UNEGOCIO;
DROP TABLE IF EXISTS MARCA;
DROP TABLE IF EXISTS LINEA;
DROP TABLE IF EXISTS PROVEEDOR;
DROP TABLE IF EXISTS ZONA;
DROP TABLE IF EXISTS CIUDAD;
DROP TABLE IF EXISTS TIPODOC;
DROP TABLE IF EXISTS FERIADOS;
GO

CREATE TABLE TIPODOC (
    "TipoDoc" CHAR(1) PRIMARY KEY,
    "Descripcion" VARCHAR(30) NOT NULL,
    "Serie" CHAR(3),
    "Numero" INTEGER,
    "Signo" SMALLINT NOT NULL DEFAULT 1,
    "Unegocio" CHAR(2)
);

CREATE TABLE CIUDAD (
    "idCiudad" INTEGER PRIMARY KEY,
    "Nombre" VARCHAR(100) NOT NULL
);

CREATE TABLE ZONA (
    "Zona" CHAR(2) PRIMARY KEY,
    "Descripcion" VARCHAR(50) NOT NULL,
    "Ciudad" VARCHAR(30)
);

CREATE TABLE TIENDA (
    "idTienda" CHAR(2) PRIMARY KEY,
    "Descripcion" VARCHAR(100) NOT NULL,
    "Responsable" VARCHAR(50),
    "Region" INTEGER NOT NULL,
    "idCiudad" INTEGER REFERENCES CIUDAD ("idCiudad") ON DELETE SET NULL
);

CREATE TABLE PROVEEDOR (
    "Proveedor" CHAR(4) PRIMARY KEY,
    "RazonSocial" VARCHAR(100) NOT NULL,
    "Direccion" VARCHAR(100),
    "email" VARCHAR(100),
    "Ruc" CHAR(11),
    "Local" BIT DEFAULT 1
);

CREATE TABLE LINEA (
    "Linea" CHAR(2) PRIMARY KEY,
    "Descripcion" VARCHAR(100) NOT NULL,
    "ComiMayor" NUMERIC(6,2) NOT NULL
);

CREATE TABLE MARCA (
    "Marca" CHAR(2) PRIMARY KEY,
    "Proveedor" CHAR(4) REFERENCES PROVEEDOR ("Proveedor") ON DELETE SET NULL,
    "Linea" CHAR(2) REFERENCES LINEA ("Linea") ON DELETE SET NULL,
    "Descripcion" VARCHAR(100) NOT NULL,
    "idLinea" CHAR(2),
    "idSubLinea" CHAR(2)
);

CREATE TABLE UNEGOCIO (
    "UNegocio" CHAR(2) PRIMARY KEY,
    "Descripcion" VARCHAR(100) NOT NULL,
    "Responsable" VARCHAR(100),
    "sysEquipo" VARCHAR(100),
    "SysFecha" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "SysUsuario" VARCHAR(100)
);

CREATE TABLE PERSONAL (
    "Personal" CHAR(2) PRIMARY KEY,
    "Nombre" VARCHAR(100) NOT NULL,
    "Telefono" CHAR(11),
    "Activo" BIT DEFAULT 1,
    "Basico" NUMERIC(9,2) DEFAULT 0,
    "idTienda" CHAR(2) REFERENCES TIENDA ("idTienda") ON DELETE SET NULL,
    "fechaNac" DATETIME,
    "Masculino" BIT DEFAULT 1,
    "idOficina" INTEGER,
    "fechaIngre" DATETIME,
    "formato" CHAR(5),
    "Email" VARCHAR(100) UNIQUE,
    "Password" VARCHAR(255) NOT NULL
);

CREATE TABLE CLIENTE (
    "Cliente" CHAR(4) PRIMARY KEY,
    "Zona" CHAR(2) REFERENCES ZONA ("Zona") ON DELETE SET NULL,
    "Ruc" CHAR(11),
    "Nombre" VARCHAR(100) NOT NULL,
    "Direccion" VARCHAR(100),
    "Saldo" NUMERIC(9,2) DEFAULT 0,
    "credito" BIT DEFAULT 0,
    "topeCredito" NUMERIC(9,2) DEFAULT 0,
    "TipoCliente" CHAR(1) NOT NULL,
    "Calificacion" CHAR(1),
    "idRepresentante" CHAR(2) REFERENCES PERSONAL ("Personal") ON DELETE NO ACTION,
    "genero" CHAR(1) NOT NULL,
    "idCliente" INT IDENTITY(1,1) NOT NULL UNIQUE
);

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
    "ConIgv" BIT DEFAULT 1,
    "UniMed" VARCHAR(20) DEFAULT 'UNIDAD',
    "idProducto" INTEGER,
    "idProd" INT IDENTITY(1,1) NOT NULL UNIQUE
);

CREATE TABLE PARAMETRO (
    "Parametro" INTEGER PRIMARY KEY,
    "Igv" NUMERIC(8,2) DEFAULT 18,
    "TasaInt" NUMERIC(8,2) DEFAULT 0,
    "TasaLegal" NUMERIC(8,2) DEFAULT 0,
    "Fecha" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "TasaDolar" NUMERIC(9,2) DEFAULT 0,
    "activo" BIT DEFAULT 1,
    "Vencidos" SMALLINT DEFAULT 0
);

CREATE TABLE FORMA_PAGO (
    "FormaPago" CHAR(1) PRIMARY KEY,
    "Descripcion" VARCHAR(30) NOT NULL,
    "NroDias" INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE BANCO (
    "idBanco" CHAR(2) PRIMARY KEY,
    "nombreBanco" VARCHAR(100) NOT NULL
);

CREATE TABLE MEDIO_PAGO (
    "idMedioPago" CHAR(2) PRIMARY KEY,
    "Descripcion" VARCHAR(100) NOT NULL,
    "Activo" BIT NOT NULL DEFAULT 1
);

CREATE TABLE PUNTO_PAGO (
    "idPuntoPago" CHAR(2) PRIMARY KEY,
    "Descripcion" VARCHAR(100) NOT NULL,
    "Activo" BIT NOT NULL DEFAULT 1,
    "idTienda" CHAR(2) REFERENCES TIENDA ("idTienda") ON DELETE CASCADE
);

CREATE TABLE DOCUMENTO (
    "Documento" CHAR(9) NOT NULL,
    "TipoDoc" CHAR(1) NOT NULL REFERENCES TIPODOC ("TipoDoc") ON DELETE NO ACTION,
    "Proveedor" CHAR(4) REFERENCES PROVEEDOR ("Proveedor") ON DELETE SET NULL,
    "Pedido" CHAR(9),
    "Cliente" CHAR(4) REFERENCES CLIENTE ("Cliente") ON DELETE SET NULL,
    "Fecha" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "Estado" CHAR(1) DEFAULT 'P',
    "DocRefer" CHAR(9),
    "Personal" CHAR(2) REFERENCES PERSONAL ("Personal") ON DELETE SET NULL,
    "pagado" NUMERIC(9,2) DEFAULT 0,
    "IdTienda" CHAR(2) DEFAULT '01' REFERENCES TIENDA ("idTienda") ON DELETE SET NULL,
    "FormaPago" CHAR(1) REFERENCES FORMA_PAGO ("FormaPago") ON DELETE SET NULL,
    "Hora" DATETIME,
    PRIMARY KEY ("Documento", "TipoDoc")
);

CREATE TABLE DETADOC (
    "Documento" CHAR(9) NOT NULL,
    "TipoDoc" CHAR(1) NOT NULL,
    "Producto" CHAR(4) NOT NULL REFERENCES PRODUCTO ("Producto") ON DELETE NO ACTION,
    "Cantidad" NUMERIC(9,2) DEFAULT 0 CHECK ("Cantidad" > 0),
    "Igv" NUMERIC(9,2) DEFAULT 0,
    "PrecUnit" NUMERIC(9,2) DEFAULT 0,
    PRIMARY KEY ("Documento", "TipoDoc", "Producto"),
    FOREIGN KEY ("Documento", "TipoDoc") REFERENCES DOCUMENTO ("Documento", "TipoDoc") ON DELETE CASCADE
);

CREATE TABLE CRONOGRAMA (
    "NroCuota" INTEGER NOT NULL,
    "Documento" CHAR(9) NOT NULL,
    "TipoDoc" CHAR(1) NOT NULL,
    "Importe" NUMERIC(9,2) DEFAULT 0,
    "Interes" NUMERIC(9,2) DEFAULT 0,
    "IgvInteres" NUMERIC(9,2) DEFAULT 0,
    "feVence" DATETIME NOT NULL,
    "Fepago" DATETIME,
    "estado" CHAR(1) DEFAULT 'P',
    "idMedioPago" CHAR(2) REFERENCES MEDIO_PAGO ("idMedioPago") ON DELETE SET NULL,
    "idPuntoPago" CHAR(2) REFERENCES PUNTO_PAGO ("idPuntoPago") ON DELETE SET NULL,
    "idBanco" CHAR(2) REFERENCES BANCO ("idBanco") ON DELETE SET NULL,
    PRIMARY KEY ("NroCuota", "Documento", "TipoDoc"),
    FOREIGN KEY ("Documento", "TipoDoc") REFERENCES DOCUMENTO ("Documento", "TipoDoc") ON DELETE CASCADE
);

CREATE TABLE PEDIDO (
    "Pedido" CHAR(9) PRIMARY KEY,
    "FormaPago" CHAR(1) REFERENCES FORMA_PAGO ("FormaPago") ON DELETE SET NULL,
    "Personal" CHAR(2) REFERENCES PERSONAL ("Personal") ON DELETE SET NULL,
    "Cliente" CHAR(4) REFERENCES CLIENTE ("Cliente") ON DELETE SET NULL,
    "Fecha" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "Estado" CHAR(1) DEFAULT 'P',
    "idTienda" CHAR(2) REFERENCES TIENDA ("idTienda") ON DELETE SET NULL
);

CREATE TABLE DETAPEDIDO (
    "Pedido" CHAR(9) NOT NULL REFERENCES PEDIDO ("Pedido") ON DELETE CASCADE,
    "Producto" CHAR(4) NOT NULL REFERENCES PRODUCTO ("Producto") ON DELETE NO ACTION,
    "Cantidad" NUMERIC(9,2) NOT NULL,
    "PrecUnit" NUMERIC(9,2),
    "FAB" INTEGER
);

CREATE TABLE VENTA_META (
    "idcodigo" INT IDENTITY(1,1) PRIMARY KEY,
    "personal" CHAR(2) REFERENCES PERSONAL ("Personal") ON DELETE CASCADE,
    "anual" INTEGER NOT NULL,
    "Mes" INTEGER NOT NULL,
    "zona" CHAR(2) REFERENCES ZONA ("Zona") ON DELETE SET NULL,
    "Monto" NUMERIC(38,6) DEFAULT 0
);

CREATE TABLE META_MARCA_PERSONAL (
    "personal" CHAR(2) NOT NULL REFERENCES PERSONAL ("Personal") ON DELETE CASCADE,
    "marca" CHAR(2) NOT NULL REFERENCES MARCA ("Marca") ON DELETE CASCADE,
    "Anualidad" INTEGER NOT NULL,
    "Mensualidad" INTEGER NOT NULL,
    "MontoPresupuesto" NUMERIC(38,2),
    PRIMARY KEY ("personal", "marca", "Anualidad", "Mensualidad")
);

CREATE TABLE META_PRODUCTO_ZONA (
    "zona" CHAR(2) NOT NULL REFERENCES ZONA ("Zona") ON DELETE CASCADE,
    "producto" CHAR(4) NOT NULL REFERENCES PRODUCTO ("Producto") ON DELETE CASCADE,
    "Anualidad" INTEGER NOT NULL,
    "Mensualidad" INTEGER NOT NULL,
    "MontoPresupuesto" NUMERIC(38,2),
    PRIMARY KEY ("zona", "producto", "Anualidad", "Mensualidad")
);

CREATE TABLE METAS_VENTA (
    "idMeta" INTEGER PRIMARY KEY,
    "Anual" INTEGER NOT NULL,
    "Mes" SMALLINT NOT NULL,
    "idSucursal" CHAR(2) REFERENCES TIENDA ("idTienda") ON DELETE SET NULL,
    "TipoCliente" CHAR(1),
    "MontoProy" NUMERIC(12,2)
);

CREATE TABLE META_SECTORISTA (
    "personal" CHAR(2) NOT NULL REFERENCES PERSONAL ("Personal") ON DELETE CASCADE,
    "Mes" INTEGER NOT NULL,
    "Anual" INTEGER NOT NULL,
    "Meta" NUMERIC(38,4),
    PRIMARY KEY ("personal", "Mes", "Anual")
);

CREATE TABLE VENTA_META_Y (
    "zona" CHAR(2) NOT NULL REFERENCES ZONA ("Zona") ON DELETE CASCADE,
    "Anual" INTEGER NOT NULL,
    "Mensual" INTEGER NOT NULL,
    "MetaVenta" NUMERIC(38,4),
    PRIMARY KEY ("zona", "Anual", "Mensual")
);

CREATE TABLE ZONA_MARCA_TIEMPO (
    "zona" CHAR(2) NOT NULL REFERENCES ZONA ("Zona") ON DELETE CASCADE,
    "linea" CHAR(2) NOT NULL REFERENCES LINEA ("Linea") ON DELETE CASCADE,
    "Anualidad" INTEGER NOT NULL,
    "trimestre" INTEGER NOT NULL,
    "MontoProyectado" NUMERIC(38,2),
    PRIMARY KEY ("zona", "linea", "Anualidad", "trimestre")
);

CREATE TABLE LIQUIDACION (
    "liquidacion" CHAR(9) PRIMARY KEY,
    "Personal" CHAR(2) REFERENCES PERSONAL ("Personal") ON DELETE SET NULL,
    "Fecha" DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE DETALIQUI (
    "liquidacion" CHAR(9) NOT NULL REFERENCES LIQUIDACION ("liquidacion") ON DELETE CASCADE,
    "Documento" CHAR(9) NOT NULL,
    "TipoDoc" CHAR(1) NOT NULL,
    "TipoPago" CHAR(1),
    "Importe" NUMERIC(9,2),
    "Estado" CHAR(1)
);

CREATE TABLE FERIADOS (
    "fecha" DATETIME PRIMARY KEY
);

CREATE TABLE MULTI_TABLA (
    "Tipo" CHAR(2) NOT NULL,
    "Valor" CHAR(3) NOT NULL,
    "Descripcion" VARCHAR(100),
    PRIMARY KEY ("Tipo", "Valor")
);

CREATE TABLE PRONOSTICO_CLIENTE_MARCA (
    "idPronostico" INT IDENTITY(1,1) PRIMARY KEY,
    "marca" CHAR(2) NOT NULL REFERENCES MARCA ("Marca") ON DELETE CASCADE,
    "Anual" INTEGER NOT NULL,
    "TRIMEStre" INTEGER NOT NULL,
    "cliente" CHAR(4) NOT NULL REFERENCES CLIENTE ("Cliente") ON DELETE CASCADE,
    "Monto" NUMERIC(38,4)
);

CREATE TABLE PRODUCTO_UNEGOCIO (
    "UNegocio" CHAR(2) REFERENCES UNEGOCIO ("UNegocio") ON DELETE CASCADE,
    "Producto" CHAR(4) REFERENCES PRODUCTO ("Producto") ON DELETE CASCADE,
    "Stockac" NUMERIC(9,2),
    PRIMARY KEY ("UNegocio", "Producto")
);

CREATE TABLE REQUERIMIENTO (
    "item" INTEGER PRIMARY KEY,
    "descripcion" VARCHAR(100) NOT NULL,
    "Cubo" VARCHAR(50),
    "Proyecto" VARCHAR(100)
);

CREATE TABLE DETALLE_REQUERIMIENTO (
    "Item" INTEGER PRIMARY KEY,
    "Tipo" VARCHAR(30),
    "Descripcion" VARCHAR(100) NOT NULL
);

CREATE TABLE SEGUIMIENTO_X (
    "Item" INT IDENTITY(1,1) PRIMARY KEY,
    "Tabla" VARCHAR(100),
    "Campo" VARCHAR(100),
    "ValorActual" VARCHAR(100),
    "ValorNuevo" VARCHAR(100),
    "Usuario" VARCHAR(100),
    "Equipo" VARCHAR(100),
    "Fecha" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "Aplicacion" VARCHAR(100),
    "Codigo" VARCHAR(100)
);

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

CREATE INDEX idx_documento_cliente ON DOCUMENTO ("Cliente");
CREATE INDEX idx_documento_personal ON DOCUMENTO ("Personal");
CREATE INDEX idx_documento_fecha ON DOCUMENTO ("Fecha");
CREATE INDEX idx_documento_tipodoc ON DOCUMENTO ("TipoDoc");
CREATE INDEX idx_detadoc_producto ON DETADOC ("Producto");
CREATE INDEX idx_detadoc_documento ON DETADOC ("Documento", "TipoDoc");
CREATE INDEX idx_cliente_zona ON CLIENTE ("Zona");
CREATE INDEX idx_producto_marca ON PRODUCTO ("Marca");
CREATE INDEX idx_cronograma_documento ON CRONOGRAMA ("Documento", "TipoDoc");
GO

-- ============================================
-- FASE 2: CREACIÓN DE VISTAS
-- ============================================

CREATE OR ALTER VIEW v_Documento AS
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
GO

CREATE OR ALTER VIEW v_cronograma AS
SELECT 
    "Documento",
    "TipoDoc",
    SUM("Importe") AS Programado,
    SUM(CASE WHEN "estado" = 'C' THEN "Importe" ELSE 0 END) AS cancelado
FROM CRONOGRAMA 
GROUP BY "Documento", "TipoDoc";
GO

CREATE OR ALTER VIEW v_Ventas AS
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
GO

CREATE OR ALTER VIEW v_VentasPrevio AS
SELECT 
    YEAR(vd."Fecha") AS anual,
    MONTH(vd."Fecha") AS Mes,
    DAY(vd."Fecha") AS Dia,
    vd."Cliente",
    c."Nombre" AS NomCliente,
    c."Zona",
    vd.monto,
    vd."pagado",
    vd."Fecha"
FROM v_Documento vd 
INNER JOIN CLIENTE c ON vd."Cliente" = c."Cliente"
WHERE vd."TipoDoc" IN ('B', 'F');
GO

CREATE OR ALTER VIEW _Otros AS
SELECT DISTINCT 
    YEAR(d."Fecha") AS anual,
    MONTH(d."Fecha") AS mes,
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
GROUP BY YEAR(d."Fecha"), MONTH(d."Fecha"), d."Personal",
         p."Descripcion", m."Descripcion", l."Descripcion";
GO

CREATE OR ALTER VIEW v_dimTiempo AS
SELECT DISTINCT 
    YEAR(d."Fecha") AS Anual,
    CAST(YEAR(d."Fecha") AS VARCHAR(10)) + CASE WHEN MONTH(d."Fecha") < 7 THEN '-S1' ELSE '-S2' END AS Semestre,
    DATEPART(quarter, d."Fecha") AS Trimestre,
    DATENAME(month, d."Fecha") AS Mes,
    DATENAME(weekday, d."Fecha") AS DiaSemana,
    MONTH(d."Fecha") AS NroMes,
    CONVERT(VARCHAR(10), d."Fecha", 103) AS idFecha
FROM DOCUMENTO d;
GO

CREATE OR ALTER VIEW v_VentasDetalladas AS
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
GO

-- ============================================
-- FASE 3: CREACIÓN DE FUNCIONES Y PROCEDIMIENTOS
-- ============================================

DROP FUNCTION IF EXISTS ven_AnalisisVenta;
DROP FUNCTION IF EXISTS Ven_GeneraKardex;
DROP FUNCTION IF EXISTS ven_Indicador_Venta;
DROP FUNCTION IF EXISTS ven_Indicador_Venta_P;
DROP FUNCTION IF EXISTS Ven_Indicadores;
DROP FUNCTION IF EXISTS Ven_ReporteDocumento;
DROP FUNCTION IF EXISTS Ven_ReporteDocumento_Default;
DROP FUNCTION IF EXISTS Kardex_Consulta;
DROP FUNCTION IF EXISTS Stock_Resumen;
DROP FUNCTION IF EXISTS Productos_StockCritico;
DROP FUNCTION IF EXISTS Top_Productos_Vendidos;
DROP FUNCTION IF EXISTS Consulta_Stock_Rapido;
DROP FUNCTION IF EXISTS Valorizacion_Inventario;
DROP FUNCTION IF EXISTS Rotacion_Inventario;
DROP FUNCTION IF EXISTS Kardex_Resumido;
DROP FUNCTION IF EXISTS Movimientos_PorFecha;
DROP PROCEDURE IF EXISTS Ven_GenerarCronograma;
DROP PROCEDURE IF EXISTS Registrar_Venta;
DROP PROCEDURE IF EXISTS Registrar_Compra;
GO

CREATE OR ALTER FUNCTION ven_AnalisisVenta(
    @p_anual INT,
    @p_mes SMALLINT
)
RETURNS TABLE
AS
RETURN
(
    SELECT 
        YEAR(v.[Fecha]) AS Anual,
        MONTH(v.[Fecha]) AS Mes,
        DAY(v.[Fecha]) AS Dia,
        v.[Cliente],
        v.[Zona],
        v.[Nombre] AS CliNombre,
        v.[Fecha],
        v.[pagado],
        v.[Personal],
        v.[Marca],
        v.[Descripcion] AS NomProducto,
        v.[TotCantidad] AS totcantidad,
        v.[TotMonto] AS totMonto
    FROM v_Ventas v
    WHERE YEAR(v.[Fecha]) = @p_anual
      AND MONTH(v.[Fecha]) = @p_mes
);
GO

CREATE OR ALTER FUNCTION Ven_GeneraKardex(@p_idproducto CHAR(4))
RETURNS TABLE
AS
RETURN
(
    SELECT 
        d.Documento,
        d.TipoDoc,
        d.Fecha,
        dd.Cantidad,
        SUM(dd.Cantidad * COALESCE(td.Signo, 1)) OVER (
            ORDER BY d.Fecha, COALESCE(td.Signo, 1) DESC 
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS Stock,
        COALESCE(td.Signo, 1) as Signo
    FROM DOCUMENTO d 
    INNER JOIN DETADOC dd ON d.Documento = dd.Documento AND dd.TipoDoc = d.TipoDoc
    LEFT JOIN TIPODOC td ON td.TipoDoc = d.TipoDoc
    WHERE dd.Producto = @p_idproducto
);
GO

CREATE OR ALTER PROCEDURE Ven_GenerarCronograma
    @p_doc CHAR(9),
    @p_tdoc CHAR(1),
    @p_cuotas INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @v_igv NUMERIC(9,2);
    DECLARE @v_tasai NUMERIC(9,2);
    DECLARE @v_deuda NUMERIC(10,2) = 0;
    DECLARE @v_cta INT = 0;

    SELECT TOP 1 @v_igv = COALESCE(Igv, 18)/100.0, @v_tasai = COALESCE(TasaInt, 0)/100.0
    FROM PARAMETRO
    WHERE activo = 1;

    SELECT @v_deuda = COALESCE(SUM(Cantidad * PrecUnit), 0)
    FROM DETADOC
    WHERE Documento = @p_doc AND TipoDoc = @p_tdoc;

    WHILE @v_cta < @p_cuotas
    BEGIN
        SET @v_cta = @v_cta + 1;
        INSERT INTO CRONOGRAMA (
            NroCuota, Documento, TipoDoc, Importe, Interes, IgvInteres, feVence, estado
        )
        VALUES (
            @v_cta,
            @p_doc,
            @p_tdoc,
            @v_deuda / @p_cuotas,
            @v_tasai * @v_deuda / @p_cuotas,
            @v_igv * @v_tasai * @v_deuda / @p_cuotas,
            DATEADD(month, @v_cta, CAST(GETDATE() AS DATE)),
            'P'
        );
    END
END;
GO

CREATE OR ALTER FUNCTION ven_Indicador_Venta(@p_anual INT)
RETURNS TABLE
AS
RETURN
(
    WITH temp_venta_real AS (
        SELECT 
            YEAR(Fecha) AS Anual,
            MONTH(Fecha) AS Mes,
            SUM(monto) AS Monto
        FROM v_Documento
        WHERE YEAR(Fecha) = @p_anual AND TipoDoc IN ('B', 'F')
        GROUP BY YEAR(Fecha), MONTH(Fecha)
    )
    SELECT 
        mv.anual,
        mv.Mes,
        COALESCE(SUM(mv.Monto), 0) AS MetaVenta,
        COALESCE(vr.Monto, 0) AS VentaReal
    FROM VENTA_META mv
    LEFT JOIN temp_venta_real vr ON mv.anual = vr.Anual AND mv.Mes = vr.Mes
    WHERE mv.anual = @p_anual
    GROUP BY mv.anual, mv.Mes, vr.Monto
);
GO

CREATE OR ALTER FUNCTION ven_Indicador_Venta_P(@p_anual INT)
RETURNS TABLE
AS
RETURN
(
    WITH temp_venta_real AS (
        SELECT 
            YEAR(Fecha) AS Anual,
            MONTH(Fecha) AS Mes,
            SUM(monto) AS Monto,
            Personal
        FROM v_Documento
        WHERE YEAR(Fecha) = @p_anual AND TipoDoc IN ('B', 'F')
        GROUP BY YEAR(Fecha), MONTH(Fecha), Personal
    )
    SELECT 
        mv.anual,
        mv.Mes,
        COALESCE(SUM(mv.Monto), 0) AS MetaVenta,
        COALESCE(vr.Monto, 0) AS VentaReal,
        mv.personal
    FROM VENTA_META mv
    LEFT JOIN temp_venta_real vr ON mv.anual = vr.Anual
                                  AND mv.Mes = vr.Mes
                                  AND vr.Personal = mv.personal
    WHERE mv.anual = @p_anual
    GROUP BY mv.anual, mv.Mes, vr.Monto, mv.personal
);
GO

CREATE OR ALTER FUNCTION Ven_Indicadores(@p_anual INT)
RETURNS TABLE
AS
RETURN
(
    SELECT 
        YEAR(vd.Fecha) AS Anual,
        MONTH(vd.Fecha) AS Mes,
        vd.monto,
        vd.pagado
    FROM v_Documento vd
    WHERE YEAR(vd.Fecha) = @p_anual AND vd.TipoDoc IN ('B', 'F')
);
GO

CREATE OR ALTER FUNCTION Ven_ReporteDocumento(
    @p_fecha1 DATETIME,
    @p_fecha2 DATETIME,
    @p_estado CHAR(1),
    @p_personal CHAR(2)
)
RETURNS TABLE
AS
RETURN
(
    SELECT *
    FROM DOCUMENTO
    WHERE Fecha >= @p_fecha1
      AND Fecha < DATEADD(day, 1, @p_fecha2)
      AND Estado = @p_estado
      AND Personal = @p_personal
);
GO

CREATE OR ALTER FUNCTION Ven_ReporteDocumento_Default(
    @p_fecha1 DATETIME,
    @p_fecha2 DATETIME,
    @p_estado CHAR(1) = 'C',
    @p_personal CHAR(2) = NULL
)
RETURNS TABLE
AS
RETURN
(
    SELECT *
    FROM DOCUMENTO
    WHERE Fecha >= @p_fecha1
      AND Fecha < DATEADD(day, 1, @p_fecha2)
      AND Estado = @p_estado
      AND (@p_personal IS NULL OR Personal = @p_personal)
);
GO

CREATE OR ALTER FUNCTION Kardex_Consulta(
    @p_idproducto CHAR(4),
    @p_fecha_inicio DATETIME = NULL,
    @p_fecha_fin DATETIME = NULL
)
RETURNS TABLE
AS
RETURN
(
    WITH base AS (
        SELECT 
            d.Documento,
            d.TipoDoc,
            d.Fecha,
            dd.Cantidad,
            COALESCE(td.Signo, 1) AS Signo,
            prov.RazonSocial AS proveedor,
            pers.Nombre AS personal,
            d.DocRefer AS documento_ref
        FROM DOCUMENTO d 
        INNER JOIN DETADOC dd ON d.Documento = dd.Documento AND d.TipoDoc = dd.TipoDoc
        LEFT JOIN TIPODOC td ON td.TipoDoc = d.TipoDoc
        LEFT JOIN PROVEEDOR prov ON prov.Proveedor = d.Proveedor
        LEFT JOIN PERSONAL pers ON pers.Personal = d.Personal
        WHERE dd.Producto = @p_idproducto
          AND (@p_fecha_inicio IS NULL OR d.Fecha >= @p_fecha_inicio)
          AND (@p_fecha_fin IS NULL OR d.Fecha <= @p_fecha_fin)
    ),
    ordered AS (
        SELECT 
            CONCAT(Documento, '-', TipoDoc) AS documento,
            CASE WHEN Signo = 1 THEN 'INGRESO' ELSE 'SALIDA' END AS tipomov,
            Fecha AS fecha,
            Cantidad AS cantidad,
            SUM(Cantidad * Signo) OVER (
                ORDER BY Fecha ASC, Signo DESC 
                ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
            ) AS stock,
            documento_ref,
            proveedor,
            personal
        FROM base
    )
    SELECT * FROM ordered
);
GO

CREATE OR ALTER FUNCTION Stock_Resumen(@p_marca CHAR(2) = NULL)
RETURNS TABLE
AS
RETURN
(
    SELECT 
        p.Producto,
        p.Descripcion,
        p.StockAc AS stock_actual,
        p.StockMin AS stock_minimo,
        CASE WHEN p.StockAc <= p.StockMin THEN 'STOCK BAJO' ELSE 'NORMAL' END AS estado
    FROM PRODUCTO p
    WHERE @p_marca IS NULL OR p.Marca = @p_marca
);
GO

CREATE OR ALTER FUNCTION Productos_StockCritico()
RETURNS TABLE
AS
RETURN
(
    SELECT 
        p.Producto AS producto,
        p.Descripcion AS descripcion,
        p.StockAc AS stock_actual,
        p.StockMin AS stock_minimo,
        (p.StockMin - p.StockAc) AS faltante
    FROM PRODUCTO p
    WHERE p.StockAc <= p.StockMin
);
GO

CREATE OR ALTER FUNCTION Top_Productos_Vendidos(@p_limite INT = 10)
RETURNS TABLE
AS
RETURN
(
    SELECT TOP (@p_limite)
        dd.Producto,
        p.Descripcion AS descripcion,
        SUM(dd.Cantidad * dd.PrecUnit) AS total_vendido,
        SUM(dd.Cantidad) AS cantidad_vendida
    FROM DETADOC dd
    INNER JOIN DOCUMENTO d ON d.Documento = dd.Documento AND d.TipoDoc = dd.TipoDoc
    INNER JOIN PRODUCTO p ON p.Producto = dd.Producto
    WHERE d.TipoDoc IN ('B', 'F')
    GROUP BY dd.Producto, p.Descripcion
    ORDER BY SUM(dd.Cantidad * dd.PrecUnit) DESC
);
GO

CREATE OR ALTER FUNCTION Consulta_Stock_Rapido(@p_producto CHAR(4) = NULL)
RETURNS TABLE
AS
RETURN
(
    SELECT 
        p.Producto,
        p.Descripcion,
        p.StockAc AS stock_actual,
        p.StockMin AS stock_minimo,
        CASE WHEN p.StockAc = 0 THEN 'AGOTADO'
             WHEN p.StockAc <= p.StockMin THEN 'STOCK BAJO'
             ELSE 'NORMAL'
        END AS estado
    FROM PRODUCTO p
    WHERE @p_producto IS NULL OR p.Producto = @p_producto
);
GO

CREATE OR ALTER FUNCTION Valorizacion_Inventario()
RETURNS TABLE
AS
RETURN
(
    SELECT 
        p.Producto AS producto,
        p.Descripcion AS descripcion,
        p.StockAc AS stock_actual,
        p.PrecCosto AS precio_costo,
        CAST((p.StockAc * p.PrecCosto) AS NUMERIC(12,2)) AS valor_costo,
        p.PrecVenta AS precio_venta,
        CAST((p.StockAc * p.PrecVenta) AS NUMERIC(12,2)) AS valor_venta,
        CAST((p.StockAc * p.PrecVenta) AS NUMERIC(12,2)) AS valorTotal
    FROM PRODUCTO p
);
GO

CREATE OR ALTER FUNCTION Rotacion_Inventario(
    @p_anio INT,
    @p_mes INT = NULL
)
RETURNS TABLE
AS
RETURN
(
    SELECT 
        p.Producto,
        p.Descripcion,
        p.Marca,
        p.StockAc AS StockActual,
        CAST(COALESCE(SUM(dd.Cantidad), 0) AS NUMERIC(12,2)) AS CantidadVendida,
        CAST(COALESCE(SUM(dd.Cantidad * dd.PrecUnit), 0) AS NUMERIC(12,2)) AS TotalVentas,
        CAST(COUNT(dd.Producto) AS BIGINT) AS VecesVendido
    FROM PRODUCTO p
    LEFT JOIN DETADOC dd ON p.Producto = dd.Producto
    LEFT JOIN DOCUMENTO d ON d.Documento = dd.Documento AND d.TipoDoc = dd.TipoDoc AND d.TipoDoc IN ('B', 'F')
    WHERE (@p_anio IS NULL OR YEAR(d.Fecha) = @p_anio)
      AND (@p_mes IS NULL OR MONTH(d.Fecha) = @p_mes)
    GROUP BY p.Producto, p.Descripcion, p.Marca, p.StockAc
);
GO

CREATE OR ALTER FUNCTION Kardex_Resumido(
    @p_idproducto CHAR(4),
    @p_anio INT,
    @p_mes INT = NULL
)
RETURNS TABLE
AS
RETURN
(
    SELECT 
        DATENAME(month, d.Fecha) AS mes_nombre,
        YEAR(d.Fecha) AS anio,
        MONTH(d.Fecha) AS mes,
        CAST(SUM(CASE WHEN COALESCE(td.Signo, 1) = 1 THEN dd.Cantidad ELSE 0 END) AS NUMERIC(12,2)) AS ingresos,
        CAST(SUM(CASE WHEN COALESCE(td.Signo, 1) = -1 THEN dd.Cantidad ELSE 0 END) AS NUMERIC(12,2)) AS salidas,
        CAST(SUM(dd.Cantidad * COALESCE(td.Signo, 1)) AS NUMERIC(12,2)) AS balance
    FROM DOCUMENTO d
    INNER JOIN DETADOC dd ON d.Documento = dd.Documento AND d.TipoDoc = dd.TipoDoc
    LEFT JOIN TIPODOC td ON td.TipoDoc = d.TipoDoc
    WHERE dd.Producto = @p_idproducto
      AND YEAR(d.Fecha) = @p_anio
      AND (@p_mes IS NULL OR MONTH(d.Fecha) = @p_mes)
    GROUP BY YEAR(d.Fecha), MONTH(d.Fecha), DATENAME(month, d.Fecha)
);
GO

CREATE OR ALTER FUNCTION Movimientos_PorFecha(
    @p_fecha_inicio DATETIME,
    @p_fecha_fin DATETIME,
    @p_tipo_mov CHAR(1) = NULL
)
RETURNS TABLE
AS
RETURN
(
    SELECT 
        d.Documento,
        d.TipoDoc AS tipo_doc,
        td.Descripcion AS descripcion_tipo,
        d.Fecha,
        dd.Producto,
        p.Descripcion AS descripcion_producto,
        dd.Cantidad,
        dd.PrecUnit AS precio_unitario,
        CAST(COALESCE(td.Signo, 1) AS INT) AS signo
    FROM DOCUMENTO d
    INNER JOIN DETADOC dd ON d.Documento = dd.Documento AND d.TipoDoc = dd.TipoDoc
    LEFT JOIN TIPODOC td ON td.TipoDoc = d.TipoDoc
    INNER JOIN PRODUCTO p ON p.Producto = dd.Producto
    WHERE d.Fecha >= @p_fecha_inicio 
      AND d.Fecha <= @p_fecha_fin
      AND (@p_tipo_mov IS NULL OR d.TipoDoc = @p_tipo_mov)
);
GO

CREATE OR ALTER PROCEDURE Registrar_Venta
    @p_cliente CHAR(4),
    @p_documento CHAR(9),
    @p_fecha DATETIME,
    @p_personal CHAR(2),
    @p_forma_pago CHAR(1),
    @p_productos_json NVARCHAR(MAX),
    @p_credito BIT,
    @p_cuotas INT,
    @mensaje VARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @v_tipo_doc CHAR(1);
        DECLARE @v_total NUMERIC(9,2) = 0;
        DECLARE @v_igv_rate NUMERIC(9,2);

        IF @p_credito = 1
            SET @v_tipo_doc = 'F';
        ELSE
            SET @v_tipo_doc = 'B';

        SELECT TOP 1 @v_igv_rate = COALESCE(Igv, 18) FROM PARAMETRO WHERE activo = 1;
        IF @v_igv_rate IS NULL
            SET @v_igv_rate = 18.00;

        INSERT INTO DOCUMENTO (Documento, TipoDoc, Cliente, Fecha, Estado, Personal, FormaPago, pagado, IdTienda)
        VALUES (@p_documento, @v_tipo_doc, @p_cliente, @p_fecha, 'P', @p_personal, @p_forma_pago, 0, '01');

        DECLARE @temp_items TABLE (
            producto CHAR(4),
            cantidad NUMERIC(9,2),
            precio NUMERIC(9,2)
        );

        INSERT INTO @temp_items (producto, cantidad, precio)
        SELECT producto, cantidad, precio
        FROM OPENJSON(@p_productos_json)
        WITH (
            producto CHAR(4) '$.producto',
            cantidad NUMERIC(9,2) '$.cantidad',
            precio NUMERIC(9,2) '$.precio'
        );

        INSERT INTO DETADOC (Documento, TipoDoc, Producto, Cantidad, Igv, PrecUnit)
        SELECT 
            @p_documento, 
            @v_tipo_doc, 
            producto, 
            cantidad, 
            (precio * cantidad) * (@v_igv_rate / 100.0), 
            precio
        FROM @temp_items;

        SELECT @v_total = SUM(precio * cantidad) FROM @temp_items;

        IF @p_credito = 0
        BEGIN
            UPDATE DOCUMENTO 
            SET pagado = @v_total, Estado = 'C' 
            WHERE Documento = @p_documento AND TipoDoc = @v_tipo_doc;
        END
        ELSE
        BEGIN
            EXEC Ven_GenerarCronograma @p_documento, @v_tipo_doc, @p_cuotas;
        END

        COMMIT TRANSACTION;
        SET @mensaje = 'Venta registrada con éxito';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR('Error al registrar venta: %s', 16, 1, @ErrorMessage);
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE Registrar_Compra
    @p_proveedor CHAR(4),
    @p_documento CHAR(9),
    @p_fecha DATETIME,
    @p_personal CHAR(2),
    @p_productos_json NVARCHAR(MAX),
    @mensaje VARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @v_tipo_doc CHAR(1) = 'C';
        DECLARE @v_total NUMERIC(9,2) = 0;
        DECLARE @v_igv_rate NUMERIC(9,2);

        SELECT TOP 1 @v_igv_rate = COALESCE(Igv, 18) FROM PARAMETRO WHERE activo = 1;
        IF @v_igv_rate IS NULL
            SET @v_igv_rate = 18.00;

        INSERT INTO DOCUMENTO (Documento, TipoDoc, Proveedor, Fecha, Estado, Personal, pagado, IdTienda)
        VALUES (@p_documento, @v_tipo_doc, @p_proveedor, @p_fecha, 'C', @p_personal, 0, '01');

        DECLARE @temp_items TABLE (
            producto CHAR(4),
            cantidad NUMERIC(9,2),
            precio NUMERIC(9,2)
        );

        INSERT INTO @temp_items (producto, cantidad, precio)
        SELECT producto, cantidad, precio
        FROM OPENJSON(@p_productos_json)
        WITH (
            producto CHAR(4) '$.producto',
            cantidad NUMERIC(9,2) '$.cantidad',
            precio NUMERIC(9,2) '$.precio'
        );

        INSERT INTO DETADOC (Documento, TipoDoc, Producto, Cantidad, Igv, PrecUnit)
        SELECT 
            @p_documento, 
            @v_tipo_doc, 
            producto, 
            cantidad, 
            (precio * cantidad) * (@v_igv_rate / 100.0), 
            precio
        FROM @temp_items;

        SELECT @v_total = SUM(precio * cantidad) FROM @temp_items;

        UPDATE DOCUMENTO 
        SET pagado = @v_total 
        WHERE Documento = @p_documento AND TipoDoc = @v_tipo_doc;

        COMMIT TRANSACTION;
        SET @mensaje = 'Compra registrada con éxito';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR('Error al registrar compra: %s', 16, 1, @ErrorMessage);
    END CATCH
END;
GO

-- ============================================
-- FASE 4: CREACIÓN DE TRIGGERS
-- ============================================

CREATE OR ALTER TRIGGER trg_detadoc_insert
ON DETADOC
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted i
        INNER JOIN TIPODOC td ON td.TipoDoc = i.TipoDoc
        INNER JOIN PRODUCTO p ON p.Producto = i.Producto
        WHERE td.Signo = -1 AND p.StockAc < i.Cantidad
    )
    BEGIN
        DECLARE @msg NVARCHAR(500);
        SELECT TOP 1 @msg = 'Stock insuficiente para producto ' + p.Producto + '. Stock disponible: ' + CAST(p.StockAc AS VARCHAR) + ', solicitado: ' + CAST(CAST(i.Cantidad AS INT) AS VARCHAR)
        FROM inserted i
        INNER JOIN TIPODOC td ON td.TipoDoc = i.TipoDoc
        INNER JOIN PRODUCTO p ON p.Producto = i.Producto
        WHERE td.Signo = -1 AND p.StockAc < i.Cantidad;

        RAISERROR(@msg, 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    UPDATE p
    SET p.StockAc = p.StockAc + CAST(i.Cantidad * COALESCE(td.Signo, 1) AS INT)
    FROM PRODUCTO p
    INNER JOIN inserted i ON p.Producto = i.Producto
    LEFT JOIN TIPODOC td ON td.TipoDoc = i.TipoDoc;
END;
GO

-- ============================================
-- FASE 5: INSERCIÓN DE DATOS BASE
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
GO

INSERT INTO TIPODOC ("TipoDoc", "Descripcion", "Serie", "Numero", "Signo", "Unegocio")
VALUES
    ('C', 'COMPRA', 'CMP', 1, 1, '01'),
    ('B', 'BOLETA', 'BOL', 1, -1, '01'),
    ('F', 'FACTURA', 'FAC', 1, -1, '01'),
    ('N', 'NOTA CREDITO', 'NCD', 1, 1, '01'),
    ('D', 'NOTA DEBITO', 'NDB', 1, -1, '01'),
    ('P', 'PEDIDO', 'PED', 1, 0, '01');

INSERT INTO CIUDAD ("idCiudad", "Nombre")
VALUES
    (1, 'LIMA'),
    (2, 'CALLAO'),
    (3, 'AREQUIPA');

INSERT INTO ZONA ("Zona", "Descripcion", "Ciudad")
VALUES
    ('01', 'ZONA NORTE', 'LIMA'),
    ('02', 'ZONA SUR', 'AREQUIPA'),
    ('03', 'ZONA CENTRAL', 'CALLAO');

INSERT INTO TIENDA ("idTienda", "Descripcion", "Responsable", "Region", "idCiudad")
VALUES
    ('01', 'TIENDA CENTRAL LIMA', 'JUAN PEREZ', 1, 1),
    ('02', 'TIENDA NORTE CALLAO', 'MARIA LOPEZ', 2, 2),
    ('03', 'TIENDA SUR AREQUIPA', 'CARLOS RODRIGUEZ', 3, 3);

INSERT INTO UNEGOCIO ("UNegocio", "Descripcion", "Responsable", "SysUsuario")
VALUES
    ('01', 'UNIDAD DE NEGOCIO CENTRAL', 'ADMIN', 'SYSTEM');

INSERT INTO PROVEEDOR ("Proveedor", "RazonSocial", "Ruc", "email", "Local")
VALUES
    ('P001', 'PROV A', '20123456789', 'info@proveedor.com', 1),
    ('P002', 'PROV B', '20987654321', 'ventas@distribuidora.com', 1),
    ('P003', 'PROV C', '20555666777', 'importaciones@empresa.com', 0);

INSERT INTO LINEA ("Linea", "Descripcion", "ComiMayor")
VALUES
    ('L1', 'ELECTRONICA', 5.00),
    ('L2', 'INFORMATICA', 7.50),
    ('L3', 'ACCESORIOS', 3.50);

INSERT INTO MARCA ("Marca", "Proveedor", "Linea", "Descripcion", "idLinea", "idSubLinea")
VALUES
    ('M1', 'P001', 'L1', 'SAMSUNG', 'L1', NULL),
    ('M2', 'P002', 'L1', 'LG', 'L1', NULL),
    ('M3', 'P001', 'L2', 'HP', 'L2', NULL),
    ('M4', 'P002', 'L2', 'DELL', 'L2', NULL),
    ('M5', 'P003', 'L3', 'ACCESORIOS', 'L3', NULL);

INSERT INTO PARAMETRO ("Parametro", "Igv", "TasaInt", "TasaLegal", "TasaDolar", "activo", "Vencidos")
VALUES
    (1, 18.00, 1.50, 2.00, 3.80, 1, 30);

INSERT INTO FORMA_PAGO ("FormaPago", "Descripcion", "NroDias")
VALUES
    ('E', 'EFECTIVO', 0),
    ('T', 'TARJETA', 0),
    ('Y', 'YAPE/PLIN', 0),
    ('C', 'CREDITO', 30);

INSERT INTO BANCO ("idBanco", "nombreBanco")
VALUES
    ('01', 'BANCO DEL CREDITO'),
    ('02', 'INTERBANK'),
    ('03', 'SCOTIABANK'),
    ('04', 'BBVA PERU');

INSERT INTO MEDIO_PAGO ("idMedioPago", "Descripcion", "Activo")
VALUES
    ('01', 'EFECTIVO', 1),
    ('02', 'TRANSFERENCIA BANCARIA', 1),
    ('03', 'CHEQUE', 1),
    ('04', 'TARJETA CREDITO', 1),
    ('05', 'TARJETA DEBITO', 1);

INSERT INTO PUNTO_PAGO ("idPuntoPago", "Descripcion", "Activo", "idTienda")
VALUES
    ('01', 'CAJA PRINCIPAL', 1, '01'),
    ('02', 'CAJA SECUNDARIA', 1, '01'),
    ('03', 'CAJA TIENDA NORTE', 1, '02'),
    ('04', 'CAJA TIENDA SUR', 1, '03');

INSERT INTO PERSONAL (
    "Personal", "Nombre", "Telefono", "Activo", "Basico",
    "idTienda", "Email", "Password", "fechaIngre"
)
VALUES
    ('01', 'JUAN PEREZ RAMOS', '9876543210', 1, 2500.00, '01',
     'juan@tenebrosa.com', '$2a$10$qKiMCsS2UuLSKM6XJIktUO0O1/q/WxFAHSt9WxNekvYIGTSha/5xW', CAST(GETDATE() AS DATE)),
    ('02', 'MARIA LOPEZ GARCIA', '9876543211', 1, 2600.00, '02',
     'maria@tenebrosa.com', '$2a$10$qKiMCsS2UuLSKM6XJIktUO0O1/q/WxFAHSt9WxNekvYIGTSha/5xW', CAST(GETDATE() AS DATE)),
    ('03', 'CARLOS RODRIGUEZ SMITH', '9876543212', 1, 2550.00, '03',
     'carlos.rodriguez@tenebrosa.com', '$2a$10$qKiMCsS2UuLSKM6XJIktUO0O1/q/WxFAHSt9WxNekvYIGTSha/5xW', CAST(GETDATE() AS DATE)),
    ('04', 'SANDRA MARTINEZ TORRES', '9876543213', 1, 2400.00, '01',
     'sandra.martinez@tenebrosa.com', '$2a$10$qKiMCsS2UuLSKM6XJIktUO0O1/q/WxFAHSt9WxNekvYIGTSha/5xW', CAST(GETDATE() AS DATE));

INSERT INTO CLIENTE (
    "Cliente", "Zona", "Nombre", "Ruc",
    "idRepresentante", "genero", "TipoCliente",
    "credito", "topeCredito", "Calificacion"
)
VALUES
    ('CL01', '01', 'EMPRESA EJEMPLO SAC', '20123456789', '01', 'M', 'E', 0, 0.00, 'A'),
    ('CL02', '02', 'CLIENTE VIP AREQUIPA', '20987654321', '02', 'F', 'V', 1, 50000.00, 'A'),
    ('CL03', '01', 'NEGOCIO CENTRAL LIMA', '20555666777', '03', 'M', 'N', 1, 30000.00, 'B'),
    ('CL04', '03', 'TIENDA CALLAO EXPRESS', '20444555666', '04', 'F', 'E', 1, 25000.00, 'B');

INSERT INTO PRODUCTO (
    "Producto", "Marca", "Descripcion",
    "StockAc", "StockMax", "StockMin",
    "PrecVenta", "PrecCosto", "ConIgv", "UniMed"
)
VALUES
    ('PR01', 'M1', 'SAMSUNG GALAXY S23', 100, 500, 10, 3500.00, 2500.00, 1, 'UNIDAD'),
    ('PR02', 'M1', 'SAMSUNG TV 55 4K', 50, 200, 5, 2000.00, 1400.00, 1, 'UNIDAD'),
    ('PR03', 'M2', 'LG MONITOR 24 FHD', 75, 300, 10, 850.00, 600.00, 1, 'UNIDAD'),
    ('PR04', 'M3', 'HP LAPTOP 15.6 I7', 30, 100, 3, 2800.00, 2000.00, 1, 'UNIDAD'),
    ('PR05', 'M4', 'DELL DESKTOP GAME', 25, 80, 3, 3200.00, 2300.00, 1, 'UNIDAD'),
    ('PR06', 'M5', 'CABLE HDMI 3M', 500, 1000, 50, 35.00, 20.00, 1, 'UNIDAD'),
    ('PR07', 'M5', 'MOUSE INALAMBR', 200, 500, 50, 45.00, 25.00, 1, 'UNIDAD');

DISABLE TRIGGER trg_detadoc_insert ON DETADOC;
GO

INSERT INTO DOCUMENTO (
    "Documento", "TipoDoc", "Proveedor",
    "Fecha", "Estado", "pagado", "IdTienda", "Personal"
)
VALUES
    ('C00000001', 'C', 'P001', '2026-01-15 10:00:00', 'C', 12000.00, '01', '01'),
    ('C00000002', 'C', 'P002', '2026-03-20 14:30:00', 'C', 8500.00, '01', '01'),
    ('C00000003', 'C', 'P003', '2026-05-05 09:00:00', 'C', 5000.00, '02', '02'),
    ('C00000004', 'C', 'P001', '2026-01-20 08:30:00', 'C', 25000.00, '01', '01'),
    ('C00000005', 'C', 'P002', '2026-02-02 11:00:00', 'C', 14000.00, '01', '02'),
    ('C00000006', 'C', 'P003', '2026-02-18 16:45:00', 'C', 7000.00, '02', '03'),
    ('C00000007', 'C', 'P001', '2026-03-05 13:15:00', 'C', 35000.00, '03', '04'),
    ('C00000008', 'C', 'P002', '2026-03-25 10:00:00', 'C', 6000.00, '01', '01'),
    ('C00000009', 'C', 'P003', '2026-04-02 09:30:00', 'C', 4000.00, '02', '02'),
    ('C00000010', 'C', 'P001', '2026-04-18 14:00:00', 'C', 17500.00, '03', '03'),
    ('C00000011', 'C', 'P002', '2026-04-28 11:30:00', 'C', 9000.00, '01', '04'),
    ('C00000012', 'C', 'P003', '2026-05-12 15:45:00', 'C', 2000.00, '02', '01'),
    ('C00000013', 'C', 'P001', '2026-05-22 10:15:00', 'C', 10500.00, '03', '02'),
    ('C00000014', 'C', 'P002', '2026-05-30 08:00:00', 'C', 16000.00, '01', '03'),
    ('C00000015', 'C', 'P003', '2026-06-01 09:00:00', 'C', 4500.00, '02', '04'),
    ('C00000016', 'C', 'P001', '2026-06-02 14:30:00', 'C', 7000.00, '03', '01'),
    ('C00000017', 'C', 'P002', '2026-06-03 12:00:00', 'C', 10000.00, '01', '02');

INSERT INTO DETADOC ("Documento", "TipoDoc", "Producto", "Cantidad", "Igv", "PrecUnit")
VALUES
    ('C00000001', 'C', 'PR01', 10, 18, 2500.00),
    ('C00000001', 'C', 'PR02', 8, 18, 1400.00),
    ('C00000002', 'C', 'PR04', 5, 18, 2000.00),
    ('C00000002', 'C', 'PR03', 10, 18, 600.00),
    ('C00000003', 'C', 'PR06', 200, 18, 20.00),
    ('C00000003', 'C', 'PR07', 100, 18, 25.00),
    ('C00000004', 'C', 'PR01', 10, 18, 2500.00),
    ('C00000005', 'C', 'PR02', 10, 18, 1400.00),
    ('C00000006', 'C', 'PR03', 10, 18, 600.00),
    ('C00000006', 'C', 'PR07', 40, 18, 25.00),
    ('C00000007', 'C', 'PR01', 10, 18, 2500.00),
    ('C00000007', 'C', 'PR02', 5, 18, 1400.00),
    ('C00000007', 'C', 'PR03', 5, 18, 600.00),
    ('C00000008', 'C', 'PR04', 3, 18, 2000.00),
    ('C00000009', 'C', 'PR06', 200, 18, 20.00),
    ('C00000010', 'C', 'PR01', 5, 18, 2500.00),
    ('C00000010', 'C', 'PR02', 2, 18, 1400.00),
    ('C00000010', 'C', 'PR03', 2, 18, 600.00),
    ('C00000010', 'C', 'PR04', 1, 18, 2000.00),
    ('C00000011', 'C', 'PR05', 3, 18, 2300.00),
    ('C00000011', 'C', 'PR07', 84, 18, 25.00),
    ('C00000012', 'C', 'PR06', 100, 18, 20.00),
    ('C00000013', 'C', 'PR04', 4, 18, 2000.00),
    ('C00000013', 'C', 'PR07', 100, 18, 25.00),
    ('C00000014', 'C', 'PR02', 10, 18, 1400.00),
    ('C00000014', 'C', 'PR03', 3, 18, 600.00),
    ('C00000015', 'C', 'PR06', 200, 18, 20.00),
    ('C00000015', 'C', 'PR07', 20, 18, 25.00),
    ('C00000016', 'C', 'PR01', 2, 18, 2500.00),
    ('C00000016', 'C', 'PR02', 1, 18, 1400.00),
    ('C00000016', 'C', 'PR03', 1, 18, 600.00),
    ('C00000017', 'C', 'PR05', 4, 18, 2300.00),
    ('C00000017', 'C', 'PR07', 32, 18, 25.00);

INSERT INTO DOCUMENTO (
    "Documento", "TipoDoc", "Cliente",
    "Fecha", "Estado", "pagado", "IdTienda", "Personal", "FormaPago"
)
VALUES
    ('B00000001', 'B', 'CL01', '2026-02-10 10:30:00', 'C', 7000.00, '01', '01', 'E'),
    ('F00000001', 'F', 'CL02', '2026-04-15 15:00:00', 'P', 0.00, '02', '02', 'C'),
    ('B00000002', 'B', 'CL03', '2026-06-02 11:20:00', 'C', 4500.00, '01', '03', 'E'),
    ('B00000003', 'B', 'CL04', '2026-01-18 16:30:00', 'C', 35.00, '01', '04', 'E'),
    ('F00000002', 'F', 'CL01', '2026-01-25 14:15:00', 'C', 10500.00, '02', '01', 'E'),
    ('B00000004', 'B', 'CL02', '2026-02-05 09:45:00', 'C', 4000.00, '03', '02', 'E'),
    ('F00000003', 'F', 'CL03', '2026-02-15 11:00:00', 'C', 850.00, '01', '03', 'E'),
    ('B00000005', 'B', 'CL04', '2026-02-28 17:30:00', 'C', 105.00, '02', '04', 'E'),
    ('B00000006', 'B', 'CL01', '2026-03-10 13:00:00', 'C', 3500.00, '03', '01', 'E'),
    ('F00000004', 'F', 'CL02', '2026-03-22 16:00:00', 'C', 6000.00, '01', '02', 'E'),
    ('B00000007', 'B', 'CL03', '2026-03-30 10:15:00', 'C', 3700.00, '02', '03', 'E'),
    ('B00000008', 'B', 'CL04', '2026-04-05 11:45:00', 'C', 2000.00, '03', '04', 'E'),
    ('F00000005', 'F', 'CL01', '2026-04-20 14:30:00', 'C', 2850.00, '01', '01', 'E'),
    ('B00000009', 'B', 'CL02', '2026-04-29 16:15:00', 'C', 70.00, '02', '02', 'E'),
    ('B00000010', 'B', 'CL03', '2026-05-02 12:00:00', 'C', 3200.00, '03', '03', 'E'),
    ('F00000006', 'F', 'CL04', '2026-05-15 10:30:00', 'C', 5700.00, '01', '04', 'E'),
    ('B00000011', 'B', 'CL01', '2026-05-25 15:00:00', 'C', 90.00, '02', '01', 'E'),
    ('B00000012', 'B', 'CL02', '2026-06-01 10:00:00', 'C', 3500.00, '03', '02', 'E'),
    ('F00000007', 'F', 'CL03', '2026-06-02 16:45:00', 'C', 5450.00, '01', '03', 'E'),
    ('B00000013', 'B', 'CL04', '2026-06-03 15:30:00', 'C', 2000.00, '02', '04', 'E');

INSERT INTO DETADOC ("Documento", "TipoDoc", "Producto", "Cantidad", "Igv", "PrecUnit")
VALUES
    ('B00000001', 'B', 'PR01', 2, 18, 3500.00),
    ('F00000001', 'F', 'PR02', 1, 18, 2000.00),
    ('F00000001', 'F', 'PR03', 2, 18, 850.00),
    ('B00000002', 'B', 'PR06', 100, 18, 35.00),
    ('B00000002', 'B', 'PR07', 40, 18, 25.00),
    ('B00000003', 'B', 'PR06', 1, 18, 35.00),
    ('F00000002', 'F', 'PR01', 3, 18, 3500.00),
    ('B00000004', 'B', 'PR02', 2, 18, 2000.00),
    ('F00000003', 'F', 'PR03', 1, 18, 850.00),
    ('B00000005', 'B', 'PR06', 3, 18, 35.00),
    ('B00000006', 'B', 'PR01', 1, 18, 3500.00),
    ('F00000004', 'F', 'PR02', 3, 18, 2000.00),
    ('B00000007', 'B', 'PR03', 2, 18, 850.00),
    ('B00000007', 'B', 'PR02', 1, 18, 2000.00),
    ('B00000008', 'B', 'PR02', 1, 18, 2000.00),
    ('F00000005', 'F', 'PR03', 1, 18, 850.00),
    ('F00000005', 'F', 'PR02', 1, 18, 2000.00),
    ('B00000009', 'B', 'PR06', 2, 18, 35.00),
    ('B00000010', 'B', 'PR05', 1, 18, 3200.00),
    ('F00000006', 'F', 'PR04', 1, 18, 2800.00),
    ('F00000006', 'F', 'PR03', 1, 18, 850.00),
    ('F00000006', 'F', 'PR02', 1, 18, 2000.00),
    ('B00000011', 'B', 'PR07', 2, 18, 45.00),
    ('B00000012', 'B', 'PR01', 1, 18, 3500.00),
    ('F00000007', 'F', 'PR02', 2, 18, 2000.00),
    ('F00000007', 'F', 'PR03', 1, 18, 850.00),
    ('F00000007', 'F', 'PR06', 10, 18, 35.00),
    ('F00000007', 'F', 'PR07', 10, 18, 25.00),
    ('B00000013', 'B', 'PR02', 1, 18, 2000.00);
GO

ENABLE TRIGGER trg_detadoc_insert ON DETADOC;
GO

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
GO
