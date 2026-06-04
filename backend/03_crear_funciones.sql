-- ============================================
-- SISTEMA DE CONTROL DE INVENTARIO Y KARDEX
-- FASE 3: CREACIÓN DE FUNCIONES Y PROCEDIMIENTOS (SQL SERVER)
-- ============================================

SET QUOTED_IDENTIFIER ON;
GO

-- ============================================
-- LIMPIAR OBJETOS EXISTENTES
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

-- ============================================
-- FUNCIONES DE ANÁLISIS DE VENTAS
-- ============================================

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

-- ============================================
-- PROCEDIMIENTOS DE GESTIÓN DE PAGOS
-- ============================================

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

-- ============================================
-- FUNCIONES DE INDICADORES Y REPORTES
-- ============================================

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

-- ============================================
-- FUNCIÓN PRINCIPAL: KARDEX CONSULTA
-- ============================================

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

-- ============================================
-- FUNCIONES DE INVENTARIO
-- ============================================

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

-- ============================================
-- FUNCIONES DE VALORIZACIÓN Y ROTACIÓN
-- ============================================

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

-- ============================================
-- PROCEDIMIENTOS ADICIONALES DE TRANSACCIONES
-- ============================================

-- 1. Registrar Venta
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

-- 2. Registrar Compra
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
