-- ============================================
-- SISTEMA DE CONTROL DE INVENTARIO Y KARDEX
-- FASE 4: CREACIÓN DE TRIGGERS (SQL SERVER)
-- ============================================

SET QUOTED_IDENTIFIER ON;
GO

-- ============================================
-- TRIGGER COMBINADO PARA DETADOC: VALIDAR Y ACTUALIZAR STOCK
-- ============================================
CREATE OR ALTER TRIGGER trg_detadoc_insert
ON DETADOC
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Validar stock para salidas (donde Signo = -1)
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

    -- 2. Actualizar stock de los productos insertados
    UPDATE p
    SET p.StockAc = p.StockAc + CAST(i.Cantidad * COALESCE(td.Signo, 1) AS INT)
    FROM PRODUCTO p
    INNER JOIN inserted i ON p.Producto = i.Producto
    LEFT JOIN TIPODOC td ON td.TipoDoc = i.TipoDoc;
END;
GO
