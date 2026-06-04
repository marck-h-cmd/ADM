-- ============================================
-- SISTEMA DE CONTROL DE INVENTARIO Y KARDEX
-- FASE 2: CREACIÓN DE VISTAS (SQL SERVER)
-- ============================================

SET QUOTED_IDENTIFIER ON;

-- ============================================
-- VISTAS DE ANÁLISIS
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
-- FIN DE CREACIÓN DE VISTAS
-- ============================================
