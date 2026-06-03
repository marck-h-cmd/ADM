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
