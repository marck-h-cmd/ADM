-- ============================================
-- SISTEMA DE CONTROL DE INVENTARIO Y KARDEX
-- FASE 1: CREACIÓN DE TABLAS (SQL SERVER)
-- ============================================

SET QUOTED_IDENTIFIER ON;

-- ============================================
-- LIMPIAR OBJETOS EXISTENTES
-- ============================================
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_detadoc_insert')
    DROP TRIGGER trg_detadoc_insert;

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
    "Local" BIT DEFAULT 1
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
    "SysFecha" DATETIME DEFAULT CURRENT_TIMESTAMP,
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

-- Tabla CLIENTE
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
    "ConIgv" BIT DEFAULT 1,
    "UniMed" VARCHAR(20) DEFAULT 'UNIDAD',
    "idProducto" INTEGER,
    "idProd" INT IDENTITY(1,1) NOT NULL UNIQUE
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
    "Fecha" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "TasaDolar" NUMERIC(9,2) DEFAULT 0,
    "activo" BIT DEFAULT 1,
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
    "Activo" BIT NOT NULL DEFAULT 1
);

-- Tabla PUNTO_PAGO
CREATE TABLE PUNTO_PAGO (
    "idPuntoPago" CHAR(2) PRIMARY KEY,
    "Descripcion" VARCHAR(100) NOT NULL,
    "Activo" BIT NOT NULL DEFAULT 1,
    "idTienda" CHAR(2) REFERENCES TIENDA ("idTienda") ON DELETE CASCADE
);

-- ============================================
-- TABLAS DE DOCUMENTOS Y TRANSACCIONES
-- ============================================

-- Tabla DOCUMENTO - Cabecera de transacciones
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

-- Tabla DETADOC - Detalles de documentos
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

-- Tabla CRONOGRAMA - Plan de pagos
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

-- Tabla PEDIDO
CREATE TABLE PEDIDO (
    "Pedido" CHAR(9) PRIMARY KEY,
    "FormaPago" CHAR(1) REFERENCES FORMA_PAGO ("FormaPago") ON DELETE SET NULL,
    "Personal" CHAR(2) REFERENCES PERSONAL ("Personal") ON DELETE SET NULL,
    "Cliente" CHAR(4) REFERENCES CLIENTE ("Cliente") ON DELETE SET NULL,
    "Fecha" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "Estado" CHAR(1) DEFAULT 'P',
    "idTienda" CHAR(2) REFERENCES TIENDA ("idTienda") ON DELETE SET NULL
);

-- Tabla DETAPEDIDO - Detalles de pedidos
CREATE TABLE DETAPEDIDO (
    "Pedido" CHAR(9) NOT NULL REFERENCES PEDIDO ("Pedido") ON DELETE CASCADE,
    "Producto" CHAR(4) NOT NULL REFERENCES PRODUCTO ("Producto") ON DELETE NO ACTION,
    "Cantidad" NUMERIC(9,2) NOT NULL,
    "PrecUnit" NUMERIC(9,2),
    "FAB" INTEGER
);

-- ============================================
-- TABLAS DE METAS Y ANÁLISIS
-- ============================================

-- Tabla VENTA_META
CREATE TABLE VENTA_META (
    "idcodigo" INT IDENTITY(1,1) PRIMARY KEY,
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
    "Fecha" DATETIME DEFAULT CURRENT_TIMESTAMP
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
    "fecha" DATETIME PRIMARY KEY
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
    "idPronostico" INT IDENTITY(1,1) PRIMARY KEY,
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
