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
    ('C00000017', 'C', 'P002', '2026-06-03 12:00:00', 'C', 10000.00, '01', '02'),
    ('C00000018', 'C', 'P003', '2026-01-25 10:00:00', 'C', 15000.00, '02', '03'),
    ('C00000019', 'C', 'P001', '2026-02-14 11:30:00', 'C', 8000.00, '01', '04'),
    ('C00000020', 'C', 'P002', '2026-03-18 14:45:00', 'C', 12000.00, '03', '01'),
    ('C00000021', 'C', 'P003', '2026-04-10 09:15:00', 'C', 22000.00, '02', '02'),
    ('C00000022', 'C', 'P001', '2026-05-08 16:20:00', 'C', 14500.00, '01', '03'),
    ('C00000023', 'C', 'P002', '2026-05-25 13:00:00', 'C', 18000.00, '03', '04'),
    ('C00000024', 'C', 'P003', '2026-06-05 10:30:00', 'C', 25000.00, '02', '01'),
    ('C00000025', 'C', 'P001', '2026-06-10 11:00:00', 'C', 9500.00, '01', '02');

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
    ('C00000017', 'C', 'PR07', 32, 18, 25.00),
    ('C00000018', 'C', 'PR01', 5, 18, 2500.00),
    ('C00000018', 'C', 'PR02', 1, 18, 1400.00),
    ('C00000019', 'C', 'PR04', 4, 18, 2000.00),
    ('C00000020', 'C', 'PR06', 500, 18, 20.00),
    ('C00000020', 'C', 'PR07', 80, 18, 25.00),
    ('C00000021', 'C', 'PR01', 5, 18, 2500.00),
    ('C00000021', 'C', 'PR05', 4, 18, 2300.00),
    ('C00000022', 'C', 'PR03', 15, 18, 600.00),
    ('C00000022', 'C', 'PR02', 3, 18, 1400.00),
    ('C00000023', 'C', 'PR04', 5, 18, 2000.00),
    ('C00000023', 'C', 'PR06', 400, 18, 20.00),
    ('C00000024', 'C', 'PR01', 10, 18, 2500.00),
    ('C00000025', 'C', 'PR05', 2, 18, 2300.00),
    ('C00000025', 'C', 'PR07', 100, 18, 25.00);

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
    ('B00000013', 'B', 'CL04', '2026-06-03 15:30:00', 'C', 2000.00, '02', '04', 'E'),
    ('B00000014', 'B', 'CL01', '2026-01-28 10:00:00', 'C', 850.00, '01', '01', 'E'),
    ('F00000008', 'F', 'CL02', '2026-02-12 11:30:00', 'C', 7000.00, '03', '02', 'E'),
    ('B00000015', 'B', 'CL03', '2026-03-05 14:45:00', 'C', 1400.00, '02', '03', 'E'),
    ('F00000009', 'F', 'CL04', '2026-03-18 09:15:00', 'C', 11500.00, '01', '04', 'E'),
    ('B00000016', 'B', 'CL01', '2026-04-12 16:20:00', 'C', 2850.00, '01', '01', 'E'),
    ('B00000017', 'B', 'CL02', '2026-04-25 13:00:00', 'C', 3200.00, '03', '02', 'E'),
    ('F00000010', 'F', 'CL03', '2026-05-08 10:30:00', 'C', 8600.00, '02', '03', 'E'),
    ('B00000018', 'B', 'CL04', '2026-05-20 11:00:00', 'C', 170.00, '01', '04', 'E'),
    ('B00000019', 'B', 'CL01', '2026-06-05 14:00:00', 'C', 3500.00, '02', '01', 'E'),
    ('F00000011', 'F', 'CL02', '2026-06-08 12:30:00', 'C', 4600.00, '03', '02', 'E'),
    ('B00000020', 'B', 'CL03', '2026-06-10 09:45:00', 'C', 225.00, '01', '03', 'E');

-- ============================================
-- INSERTAR DETALLES DE VENTAS
-- ============================================

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
    ('B00000013', 'B', 'PR02', 1, 18, 2000.00),
    ('B00000014', 'B', 'PR03', 1, 18, 850.00),
    ('F00000008', 'F', 'PR01', 2, 18, 3500.00),
    ('B00000015', 'B', 'PR02', 1, 18, 1400.00),
    ('F00000009', 'F', 'PR01', 3, 18, 3500.00),
    ('F00000009', 'F', 'PR03', 1, 18, 850.00),
    ('F00000009', 'F', 'PR07', 6, 18, 25.00),
    ('B00000016', 'B', 'PR03', 1, 18, 850.00),
    ('B00000016', 'B', 'PR02', 1, 18, 2000.00),
    ('B00000017', 'B', 'PR05', 1, 18, 3200.00),
    ('F00000010', 'F', 'PR01', 2, 18, 3500.00),
    ('F00000010', 'F', 'PR03', 1, 18, 850.00),
    ('F00000010', 'F', 'PR06', 20, 18, 35.00),
    ('B00000018', 'B', 'PR06', 2, 18, 35.00),
    ('B00000018', 'B', 'PR07', 4, 18, 25.00),
    ('B00000019', 'B', 'PR01', 1, 18, 3500.00),
    ('F00000011', 'F', 'PR05', 1, 18, 3200.00),
    ('F00000011', 'F', 'PR02', 1, 18, 1400.00),
    ('B00000020', 'B', 'PR06', 5, 18, 35.00),
    ('B00000020', 'B', 'PR07', 2, 18, 25.00);

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
