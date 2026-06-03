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
    ('1', 'CONTADO', 0),
    ('2', 'CREDITO 30 DIAS', 30),
    ('3', 'CREDITO 60 DIAS', 60),
    ('4', 'CREDITO 90 DIAS', 90);

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
     'juan.perez@tenebrosa.com', '$2a$10$qKiMCsS2UuLSKM6XJIktUO0O1/q/WxFAHSt9WxNekvYIGTSha/5xW', CURRENT_DATE),
    ('02', 'MARIA LOPEZ GARCIA', '9876543211', TRUE, 2600.00, '02',
     'maria.lopez@tenebrosa.com', '$2a$10$qKiMCsS2UuLSKM6XJIktUO0O1/q/WxFAHSt9WxNekvYIGTSha/5xW', CURRENT_DATE),
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
    ('C00000001', 'C', 'PROV', '2024-01-15 10:00:00', 'C', 12000.00, '01', '01'),
    ('C00000002', 'C', 'PROV2', '2024-01-20 14:30:00', 'C', 8500.00, '01', '01'),
    ('C00000003', 'C', 'PROV3', '2024-02-05 09:00:00', 'C', 5000.00, '02', '02');

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
    ('B00000001', 'B', 'CL01', '2024-02-10 10:30:00', 'C', 7000.00, '01', '01', '1'),
    ('F00000001', 'F', 'CL02', '2024-02-15 15:00:00', 'P', 0.00, '02', '02', '2'),
    ('B00000002', 'B', 'CL03', '2024-02-18 11:20:00', 'C', 4500.00, '01', '03', '1');

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
    ('01', 2024, 1, '01', 50000.00),
    ('01', 2024, 2, '01', 55000.00),
    ('02', 2024, 1, '02', 45000.00),
    ('02', 2024, 2, '02', 48000.00),
    ('03', 2024, 1, '03', 40000.00),
    ('03', 2024, 2, '03', 42000.00);

-- ============================================
-- INSERTAR META SECTORISTA
-- ============================================

INSERT INTO META_SECTORISTA ("personal", "Mes", "Anual", "Meta")
VALUES
    ('01', 1, 2024, 50000.00),
    ('01', 2, 2024, 55000.00),
    ('02', 1, 2024, 45000.00),
    ('02', 2, 2024, 48000.00);

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
