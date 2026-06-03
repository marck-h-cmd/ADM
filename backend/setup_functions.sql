-- ============================================
-- FUNCIONES ADICIONALES REQUERIDAS POR EL BACKEND
-- ============================================

-- Conectar a la base de datos (descomenta si ejecutas desde terminal directamente)
-- \c tenebrosa;

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


-- 3. Valorización de Inventario
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
        (p."StockAc" * p."PrecCosto")::NUMERIC(12,2) as valor_costo,
        p."PrecVenta",
        (p."StockAc" * p."PrecVenta")::NUMERIC(12,2) as valor_venta
    FROM PRODUCTO p
    ORDER BY p."Descripcion";
END; $$ LANGUAGE plpgsql;


-- 4. Rotación de Inventario
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
        COALESCE(SUM(dd."Cantidad"), 0)::NUMERIC(12,2) as cantidad_vendida,
        COALESCE(SUM(dd."Cantidad" * dd."PrecUnit"), 0)::NUMERIC(12,2) as total_ventas,
        COUNT(dd."Producto")::BIGINT as veces_vendido
    FROM PRODUCTO p
    LEFT JOIN DETADOC dd ON p."Producto" = dd."Producto"
    LEFT JOIN DOCUMENTO d ON d."Documento" = dd."Documento" AND d."TipoDoc" = dd."TipoDoc" AND d."TipoDoc" IN ('B', 'F')
    WHERE (p_anio IS NULL OR EXTRACT(YEAR FROM d."Fecha") = p_anio)
      AND (p_mes IS NULL OR EXTRACT(MONTH FROM d."Fecha") = p_mes)
    GROUP BY p."Producto", p."Descripcion"
    ORDER BY total_ventas DESC;
END; $$ LANGUAGE plpgsql;


-- 5. Kardex Resumido
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
        TO_CHAR(d."Fecha", 'Month') as mes_nombre,
        EXTRACT(YEAR FROM d."Fecha")::INTEGER as anio,
        EXTRACT(MONTH FROM d."Fecha")::INTEGER as mes,
        SUM(CASE WHEN COALESCE(td."Signo", 1) = 1 THEN dd."Cantidad" ELSE 0 END)::NUMERIC(12,2) as ingresos,
        SUM(CASE WHEN COALESCE(td."Signo", 1) = -1 THEN dd."Cantidad" ELSE 0 END)::NUMERIC(12,2) as salidas,
        SUM(dd."Cantidad" * COALESCE(td."Signo", 1))::NUMERIC(12,2) as balance
    FROM DOCUMENTO d
    INNER JOIN DETADOC dd ON d."Documento" = dd."Documento" AND d."TipoDoc" = dd."TipoDoc"
    LEFT JOIN TIPODOC td ON td."TipoDoc" = d."TipoDoc"
    WHERE dd."Producto" = p_idproducto
      AND EXTRACT(YEAR FROM d."Fecha") = p_anio
      AND (p_mes IS NULL OR EXTRACT(MONTH FROM d."Fecha") = p_mes)
    GROUP BY EXTRACT(YEAR FROM d."Fecha"), EXTRACT(MONTH FROM d."Fecha"), TO_CHAR(d."Fecha", 'Month')
    ORDER BY mes ASC;
END; $$ LANGUAGE plpgsql;


-- 6. Movimientos por Fecha
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
        td."Descripcion" as descripcion_tipo,
        d."Fecha",
        dd."Producto",
        p."Descripcion" as descripcion_producto,
        dd."Cantidad",
        dd."PrecUnit",
        COALESCE(td."Signo", 1)::INTEGER as signo
    FROM DOCUMENTO d
    INNER JOIN DETADOC dd ON d."Documento" = dd."Documento" AND d."TipoDoc" = dd."TipoDoc"
    LEFT JOIN TIPODOC td ON td."TipoDoc" = d."TipoDoc"
    INNER JOIN PRODUCTO p ON p."Producto" = dd."Producto"
    WHERE d."Fecha" >= p_fecha_inicio 
      AND d."Fecha" <= p_fecha_fin
      AND (p_tipo_mov IS NULL OR d."TipoDoc" = p_tipo_mov)
    ORDER BY d."Fecha" DESC;
END; $$ LANGUAGE plpgsql;
