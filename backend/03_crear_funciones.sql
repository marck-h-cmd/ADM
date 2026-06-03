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
-- FIN DE CREACIÓN DE FUNCIONES
-- ============================================
