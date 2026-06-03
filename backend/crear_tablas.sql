-- ============================================
-- SISTEMA DE CONTROL DE INVENTARIO Y KARDEX
-- VERSIÓN FINAL CORREGIDA CON PASSWORD Y FUNCIONES COMPLEMENTARIAS
-- ============================================

-- Conectar a la base de datos
\c tenebrosa;

-- ============================================
-- ELIMINAR OBJETOS EXISTENTES
-- ============================================
DROP TRIGGER IF EXISTS trg_actualizar_stock ON DETADOC CASCADE;
DROP TRIGGER IF EXISTS trg_validar_stock ON DETADOC CASCADE;
DROP FUNCTION IF EXISTS Kardex_Consulta CASCADE;
DROP FUNCTION IF EXISTS Stock_Resumen CASCADE;
DROP FUNCTION IF EXISTS Productos_StockCritico CASCADE;
DROP FUNCTION IF EXISTS Top_Productos_Vendidos CASCADE;
DROP FUNCTION IF EXISTS Actualizar_Stock_Producto CASCADE;
DROP FUNCTION IF EXISTS Validar_Stock_Venta CASCADE;
DROP FUNCTION IF EXISTS ven_AnalisisVenta CASCADE;
DROP FUNCTION IF EXISTS Ven_GenerarCronograma CASCADE;
DROP FUNCTION IF EXISTS Ven_GeneraKardex CASCADE;
DROP FUNCTION IF EXISTS ven_Indicador_Venta CASCADE;
DROP FUNCTION IF EXISTS ven_Indicador_Venta_P CASCADE;
DROP FUNCTION IF EXISTS Ven_Indicadores CASCADE;
DROP FUNCTION IF EXISTS Ven_ReporteDocumento CASCADE;
DROP FUNCTION IF EXISTS Ven_ReporteDocumento_Default CASCADE;
DROP FUNCTION IF EXISTS Movimientos_PorFecha CASCADE;
DROP FUNCTION IF EXISTS Rotacion_Inventario CASCADE;
DROP FUNCTION IF EXISTS Valorizacion_Inventario CASCADE;
DROP FUNCTION IF EXISTS Kardex_Resumido CASCADE;
DROP FUNCTION IF EXISTS Registrar_Compra CASCADE;
DROP FUNCTION IF EXISTS Registrar_Venta CASCADE;
DROP FUNCTION IF EXISTS Reporte_Movimientos_Producto CASCADE;
DROP FUNCTION IF EXISTS Consulta_Stock_Rapido CASCADE;

DROP TABLE IF EXISTS DETADOC CASCADE;
DROP TABLE IF EXISTS DOCUMENTO CASCADE;
DROP TABLE IF EXISTS CRONOGRAMA CASCADE;
DROP TABLE IF EXISTS PRODUCTO CASCADE;
DROP TABLE IF EXISTS CLIENTE CASCADE;
DROP TABLE IF EXISTS PROVEEDOR CASCADE;
DROP TABLE IF EXISTS MARCA CASCADE;
DROP TABLE IF EXISTS LINEA CASCADE;
DROP TABLE IF EXISTS ZONA CASCADE;
DROP TABLE IF EXISTS TIPODOC CASCADE;
DROP TABLE IF EXISTS CIUDAD CASCADE;
DROP TABLE IF EXISTS Tienda CASCADE;
DROP TABLE IF EXISTS PERSONAL CASCADE;
DROP TABLE IF EXISTS FORMAPAGO CASCADE;
DROP TABLE IF EXISTS BANCO CASCADE;
DROP TABLE IF EXISTS MEDIOPAGO CASCADE;
DROP TABLE IF EXISTS PUNTOPAGO CASCADE;
DROP TABLE IF EXISTS PARAMETRO CASCADE;
DROP TABLE IF EXISTS VentaMeta CASCADE;
DROP TABLE IF EXISTS DetalleRequerimiento CASCADE;
DROP TABLE IF EXISTS DETALIQUI CASCADE;
DROP TABLE IF EXISTS DETAPEDIDO CASCADE;
DROP TABLE IF EXISTS FERIADOS CASCADE;
DROP TABLE IF EXISTS LIQUIDACION CASCADE;
DROP TABLE IF EXISTS MetaMarcaPersonal CASCADE;
DROP TABLE IF EXISTS MetaProductoZona CASCADE;
DROP TABLE IF EXISTS Metas_Venta CASCADE;
DROP TABLE IF EXISTS MetaSectorista CASCADE;
DROP TABLE IF EXISTS MULTITABLA CASCADE;
DROP TABLE IF EXISTS PEDIDO CASCADE;
DROP TABLE IF EXISTS ProductoUnegocio CASCADE;
DROP TABLE IF EXISTS PronosticoClienteMarca CASCADE;
DROP TABLE IF EXISTS Requerimiento CASCADE;
DROP TABLE IF EXISTS SeguimientoX CASCADE;
DROP TABLE IF EXISTS sys_documentacion CASCADE;
DROP TABLE IF EXISTS UNegocio CASCADE;
DROP TABLE IF EXISTS VentaMetaY CASCADE;
DROP TABLE IF EXISTS ZonaMarcaTiempo CASCADE;

DROP VIEW IF EXISTS v_Documento CASCADE;
DROP VIEW IF EXISTS v_cronograma CASCADE;
DROP VIEW IF EXISTS v_Ventas CASCADE;
DROP VIEW IF EXISTS v_VentasPrevio CASCADE;
DROP VIEW IF EXISTS _Otros CASCADE;
DROP VIEW IF EXISTS v_dimTiempo CASCADE;
DROP VIEW IF EXISTS v_VentasDetalladas CASCADE;

-- ============================================
-- TABLAS PRINCIPALES
-- ============================================

-- Tabla TIPODOC
CREATE TABLE TIPODOC (
    "TipoDoc" CHAR(1) PRIMARY KEY,
    "Descripcion" VARCHAR(30),
    "Serie" CHAR(3),
    "Numero" INTEGER,
    "Signo" SMALLINT,
    "Unegocio" CHAR(2)
);

-- Tabla ZONA
CREATE TABLE ZONA (
    "Zona" CHAR(2) PRIMARY KEY,
    "Descripcion" VARCHAR(50) NOT NULL,
    "Ciudad" VARCHAR(30)
);

-- Tabla CIUDAD
CREATE TABLE CIUDAD (
    "idCiudad" INTEGER PRIMARY KEY,
    "Nombre" VARCHAR(100) NOT NULL
);

-- Tabla Tienda
CREATE TABLE Tienda (
    "idTienda" CHAR(2) PRIMARY KEY,
    "Descripcion" VARCHAR(100) NOT NULL,
    "Responsable" VARCHAR(50),
    "Region" INTEGER NOT NULL,
    "idCiudad" INTEGER REFERENCES CIUDAD ("idCiudad")
);

-- Tabla CLIENTE
CREATE TABLE CLIENTE (
    "Cliente" CHAR(4) PRIMARY KEY,
    "Zona" CHAR(2) REFERENCES ZONA ("Zona"),
    "Ruc" CHAR(11),
    "Nombre" VARCHAR(100) NOT NULL,
    "Direccion" VARCHAR(100),
    "Saldo" NUMERIC(9,2) DEFAULT 0,
    "credito" BOOLEAN DEFAULT FALSE,
    "topeCredito" NUMERIC(9,2) DEFAULT 0,
    "TipoCliente" CHAR(1) NOT NULL,
    "Calificacion" CHAR(1),
    "idRepresentante" INTEGER NOT NULL,
    "genero" CHAR(1) NOT NULL,
    "idCliente" SERIAL NOT NULL
);

-- Tabla PROVEEDOR
CREATE TABLE PROVEEDOR (
    "Proveedor" CHAR(4) PRIMARY KEY,
    "RazonSocial" VARCHAR(100) NOT NULL,
    "Direccion" VARCHAR(100),
    "email" VARCHAR(100),
    "Ruc" CHAR(11),
    "Local" BOOLEAN DEFAULT TRUE
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
    "Proveedor" CHAR(4) REFERENCES PROVEEDOR ("Proveedor"),
    "Linea" CHAR(2) REFERENCES LINEA ("Linea"),
    "Descripcion" VARCHAR(100) NOT NULL,
    "idLinea" CHAR(2),
    "idSubLinea" CHAR(2)
);

-- Tabla PRODUCTO
CREATE TABLE PRODUCTO (
    "Producto" CHAR(4) PRIMARY KEY,
    "Marca" CHAR(2) REFERENCES MARCA ("Marca"),
    "Descripcion" VARCHAR(200) NOT NULL,
    "StockAc" INTEGER DEFAULT 0,
    "StockMax" INTEGER DEFAULT 0,
    "StockMin" INTEGER DEFAULT 0,
    "PrecVenta" NUMERIC(9,2) DEFAULT 0,
    "PrecCosto" NUMERIC(9,2) DEFAULT 0,
    "Peso" NUMERIC(9,2) DEFAULT 0,
    "ConIgv" BOOLEAN DEFAULT TRUE,
    "UniMed" VARCHAR(20) DEFAULT 'UNIDAD',
    "idProducto" INTEGER,
    "idProd" SERIAL NOT NULL
);

-- Tabla PERSONAL (Modificada con Password)
CREATE TABLE PERSONAL (
    "Personal" CHAR(2) PRIMARY KEY,
    "Nombre" VARCHAR(100) NOT NULL,
    "Telefono" CHAR(11),
    "Activo" BOOLEAN DEFAULT TRUE,
    "Basico" NUMERIC(9,2) DEFAULT 0,
    "idTienda" CHAR(2) REFERENCES Tienda ("idTienda"),
    "fechaNac" TIMESTAMP,
    "Masculino" BOOLEAN DEFAULT TRUE,
    "idOficina" INTEGER,
    "fechaIngre" TIMESTAMP,
    "formato" CHAR(5),
    "Email" VARCHAR(100),
    "Password" VARCHAR(255)
);

-- Tabla FORMAPAGO
CREATE TABLE FORMAPAGO (
    "FormaPago" CHAR(1) PRIMARY KEY,
    "Descripcion" VARCHAR(30) NOT NULL,
    "NroDias" INTEGER NOT NULL
);

-- Tabla DOCUMENTO
CREATE TABLE DOCUMENTO (
    "Documento" CHAR(9) NOT NULL,
    "TipoDoc" CHAR(1) NOT NULL REFERENCES TIPODOC ("TipoDoc"),
    "Proveedor" CHAR(4) REFERENCES PROVEEDOR ("Proveedor"),
    "Pedido" CHAR(9),
    "Cliente" CHAR(4) REFERENCES CLIENTE ("Cliente"),
    "Fecha" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "Estado" CHAR(1) DEFAULT 'P',
    "DocRefer" CHAR(9),
    "Personal" CHAR(2) REFERENCES PERSONAL ("Personal"),
    "pagado" NUMERIC(9,2) DEFAULT 0,
    "IdTienda" CHAR(2) DEFAULT '01',
    "FormaPago" CHAR(1) REFERENCES FORMAPAGO ("FormaPago"),
    "Hora" TIMESTAMP,
    PRIMARY KEY ("Documento", "TipoDoc")
);

-- Tabla DETADOC
CREATE TABLE DETADOC (
    "Documento" CHAR(9) NOT NULL,
    "TipoDoc" CHAR(1) NOT NULL,
    "Producto" CHAR(4) NOT NULL REFERENCES PRODUCTO ("Producto"),
    "Cantidad" NUMERIC(9,2) DEFAULT 0,
    "Igv" NUMERIC(9,2) DEFAULT 0,
    "PrecUnit" NUMERIC(9,2) DEFAULT 0,
    PRIMARY KEY ("Documento", "TipoDoc", "Producto"),
    FOREIGN KEY ("Documento", "TipoDoc") REFERENCES DOCUMENTO ("Documento", "TipoDoc")
);

-- Tabla CRONOGRAMA
CREATE TABLE CRONOGRAMA (
    "NroCuota" INTEGER NOT NULL,
    "Documento" CHAR(9) NOT NULL,
    "TipoDoc" CHAR(1) NOT NULL,
    "Importe" NUMERIC(9,2) DEFAULT 0,
    "Interes" NUMERIC(9,2) DEFAULT 0,
    "IgvInteres" NUMERIC(9,2) DEFAULT 0,
    "feVence" TIMESTAMP NOT NULL,
    "Fepago" TIMESTAMP,
    "estado" CHAR(1) DEFAULT 'P',
    "idMedioPago" CHAR(2),
    "idPuntoPago" CHAR(2),
    "idBanco" CHAR(2),
    PRIMARY KEY ("NroCuota", "Documento", "TipoDoc")
);

-- Tablas adicionales
CREATE TABLE BANCO ("idBanco" CHAR(2) PRIMARY KEY, "nombreBanco" VARCHAR(100) NOT NULL);
CREATE TABLE MEDIOPAGO ("idMedioPago" CHAR(2) PRIMARY KEY, "Descripcion" VARCHAR(100) NOT NULL, "Activo" BOOLEAN NOT NULL);
CREATE TABLE PUNTOPAGO ("idPuntoPago" CHAR(2) PRIMARY KEY, "Descripcion" VARCHAR(100) NOT NULL, "Activo" BOOLEAN NOT NULL, "idTienda" CHAR(2) REFERENCES Tienda ("idTienda"));
CREATE TABLE PARAMETRO ("Parametro" INTEGER PRIMARY KEY, "Igv" NUMERIC(8,2) DEFAULT 18, "TasaInt" NUMERIC(8,2) DEFAULT 0, "TasaLegal" NUMERIC(8,2) DEFAULT 0, "Fecha" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "TasaDolar" NUMERIC(9,2) DEFAULT 0, "activo" BOOLEAN DEFAULT TRUE, "Vencidos" SMALLINT DEFAULT 0);
CREATE TABLE VentaMeta ("idcodigo" SERIAL PRIMARY KEY, "personal" CHAR(2), "anual" INTEGER, "Mes" INTEGER, "zona" CHAR(2), "Monto" NUMERIC(38,6));
CREATE TABLE DetalleRequerimiento ("Item" INTEGER PRIMARY KEY, "Tipo" VARCHAR(30), "Descripcion" VARCHAR(100) NOT NULL);

-- Tablas adicionales sin restricciones complejas
CREATE TABLE DETALIQUI ("liquidacion" CHAR(9), "Documento" CHAR(9), "TipoDoc" CHAR(1), "TipoPago" CHAR(1), "Importe" NUMERIC(9,2), "Estado" CHAR(1));
CREATE TABLE DETAPEDIDO ("Pedido" CHAR(9), "Producto" CHAR(4), "Cantidad" NUMERIC(9,2), "PrecUnit" NUMERIC(9,2), "FAB" INTEGER);
CREATE TABLE FERIADOS ("fecha" TIMESTAMP);
CREATE TABLE LIQUIDACION ("liquidacion" CHAR(9) PRIMARY KEY, "Personal" CHAR(2), "Fecha" TIMESTAMP);
CREATE TABLE MetaMarcaPersonal ("personal" CHAR(2), "marca" CHAR(2), "Anualidad" INTEGER, "Mensualidad" INTEGER, "MontoPresupuesto" NUMERIC(38,2));
CREATE TABLE MetaProductoZona ("zona" CHAR(2), "producto" CHAR(4), "Anualidad" INTEGER, "Mensualidad" INTEGER, "MontoPresupuesto" NUMERIC(38,2));
CREATE TABLE Metas_Venta ("idMeta" INTEGER PRIMARY KEY, "Anual" INTEGER, "Mes" SMALLINT, "idSucursal" CHAR(2), "TipoCliente" CHAR(1), "MontoProy" NUMERIC(12,2));
CREATE TABLE MetaSectorista ("personal" CHAR(2), "Mes" INTEGER, "Anual" INTEGER, "Meta" NUMERIC(38,4));
CREATE TABLE MULTITABLA ("Tipo" CHAR(2), "Valor" CHAR(3), "Descripcion" VARCHAR(100), PRIMARY KEY ("Tipo", "Valor"));
CREATE TABLE PEDIDO ("Pedido" CHAR(9) PRIMARY KEY, "FormaPago" CHAR(1), "Personal" CHAR(2), "Cliente" CHAR(4), "Fecha" TIMESTAMP, "Estado" CHAR(1), "idTienda" CHAR(2));
CREATE TABLE ProductoUnegocio ("UNegocio" CHAR(2), "Producto" CHAR(4), "Stockac" NUMERIC(9,2));
CREATE TABLE PronosticoClienteMarca ("marca" CHAR(2), "Anual" INTEGER, "TRIMEStre" INTEGER, "cliente" CHAR(4), "Monto" NUMERIC(38,4), "idPronostico" INTEGER);
CREATE TABLE Requerimiento ("item" INTEGER, "descripcion" VARCHAR(100), "Cubo" VARCHAR(50), "Proyecto" VARCHAR(100));
CREATE TABLE SeguimientoX ("Item" INTEGER, "Tabla" VARCHAR(100), "Campo" VARCHAR(100), "ValorActual" VARCHAR(100), "ValorNuevo" VARCHAR(100), "Usuario" VARCHAR(100), "Equipo" VARCHAR(100), "Fecha" TIMESTAMP, "Aplicacion" VARCHAR(100), "Codigo" VARCHAR(100));
CREATE TABLE sys_documentacion ("Schemax" VARCHAR(255), "Tabla" VARCHAR(255), "Campo" VARCHAR(255), "Columna" VARCHAR(255), "max_length" SMALLINT, "scale" SMALLINT, "precision" SMALLINT);
CREATE TABLE UNegocio ("UNegocio" CHAR(2), "Descripcion" VARCHAR(100), "Responsable" VARCHAR(100), "sysEquipo" VARCHAR(100), "SysFecha" TIMESTAMP, "SysUsuario" VARCHAR(100));
CREATE TABLE VentaMetaY ("zona" CHAR(2), "Anual" INTEGER, "Mensual" INTEGER, "MetaVenta" NUMERIC(38,4));
CREATE TABLE ZonaMarcaTiempo ("zona" CHAR(2), "linea" CHAR(2), "Anualidad" INTEGER, "trimestre" INTEGER, "MontoProyectado" NUMERIC(38,2));

-- ============================================
-- VISTAS
-- ============================================

CREATE OR REPLACE VIEW v_Documento AS
SELECT d1."Documento", d1."Fecha", d1."Cliente", d1."Personal", d1."Estado", d1."pagado", 
       SUM(COALESCE(dd1."Cantidad", 0) * COALESCE(dd1."PrecUnit", 0)) AS monto
FROM DOCUMENTO d1 
INNER JOIN DETADOC dd1 ON d1."Documento" = dd1."Documento" AND d1."TipoDoc" = dd1."TipoDoc"
GROUP BY d1."Documento", d1."Fecha", d1."Cliente", d1."Personal", d1."Estado", d1."pagado";

CREATE OR REPLACE VIEW v_cronograma AS
SELECT "Documento", "TipoDoc", SUM("Importe") AS Programado, 
       SUM(CASE WHEN "estado" = 'C' THEN "Importe" ELSE 0 END) AS cancelado
FROM CRONOGRAMA GROUP BY "Documento", "TipoDoc";

CREATE OR REPLACE VIEW v_Ventas AS
SELECT CLIENTE."Cliente", CLIENTE."Zona", CLIENTE."Nombre", CLIENTE."TipoCliente", 
       DOCUMENTO."Fecha", DOCUMENTO."pagado", DOCUMENTO."Personal", PRODUCTO."Producto", 
       PRODUCTO."Marca", PRODUCTO."Descripcion", 
       SUM(DETADOC."Cantidad") AS TotCantidad,
       SUM(DETADOC."PrecUnit" * DETADOC."Cantidad") AS TotMonto
FROM CLIENTE 
INNER JOIN DOCUMENTO ON CLIENTE."Cliente" = DOCUMENTO."Cliente"
INNER JOIN DETADOC ON DOCUMENTO."Documento" = DETADOC."Documento" AND DOCUMENTO."TipoDoc" = DETADOC."TipoDoc"
INNER JOIN PRODUCTO ON DETADOC."Producto" = PRODUCTO."Producto"
GROUP BY CLIENTE."Cliente", CLIENTE."Zona", CLIENTE."Nombre", CLIENTE."TipoCliente", 
         DOCUMENTO."Fecha", DOCUMENTO."pagado", DOCUMENTO."Personal", 
         PRODUCTO."Producto", PRODUCTO."Marca", PRODUCTO."Descripcion";

CREATE OR REPLACE VIEW v_VentasPrevio AS
SELECT EXTRACT(YEAR FROM vd."Fecha") AS anual, EXTRACT(MONTH FROM vd."Fecha") AS Mes,
       EXTRACT(DAY FROM vd."Fecha") AS Dia, vd."Cliente", c."Nombre" AS NomCliente,
       c."Zona", vd.monto, vd."pagado", vd."Fecha"
FROM v_Documento vd INNER JOIN CLIENTE c ON vd."Cliente" = c."Cliente";

CREATE OR REPLACE VIEW _Otros AS
SELECT DISTINCT EXTRACT(YEAR FROM d."Fecha") AS anual, EXTRACT(MONTH FROM d."Fecha") AS mes, 
       SUM(dd."Cantidad" * dd."PrecUnit") AS monto, d."Personal",
       p."Descripcion" AS prod, m."Descripcion" AS marca, l."Descripcion" AS linea
FROM DOCUMENTO d 
INNER JOIN DETADOC dd ON dd."Documento" = d."Documento" AND d."TipoDoc" = dd."TipoDoc"
INNER JOIN PRODUCTO p ON p."Producto" = dd."Producto"
INNER JOIN MARCA m ON m."Marca" = p."Marca"
INNER JOIN LINEA l ON l."Linea" = m."Linea"
WHERE d."Cliente" IS NOT NULL
GROUP BY EXTRACT(YEAR FROM d."Fecha"), EXTRACT(MONTH FROM d."Fecha"), d."Personal", p."Descripcion", m."Descripcion", l."Descripcion";

CREATE OR REPLACE VIEW v_dimTiempo AS
SELECT DISTINCT EXTRACT(YEAR FROM d."Fecha") AS Anual,
       EXTRACT(YEAR FROM d."Fecha")::TEXT || CASE WHEN EXTRACT(MONTH FROM d."Fecha") < 7 THEN '-S1' ELSE '-S2' END AS Semestre,
       EXTRACT(QUARTER FROM d."Fecha") AS Trimestre, TO_CHAR(d."Fecha", 'Month') AS Mes,
       TO_CHAR(d."Fecha", 'Day') AS DiaSemana, EXTRACT(MONTH FROM d."Fecha") AS NroMes,
       TO_CHAR(d."Fecha", 'DD/MM/YYYY') AS idFecha
FROM DOCUMENTO d;

CREATE OR REPLACE VIEW v_VentasDetalladas AS
SELECT DOCUMENTO."Documento", DOCUMENTO."TipoDoc", CLIENTE."Cliente", CLIENTE."Zona", 
       DOCUMENTO."Fecha", DOCUMENTO."Pedido"
FROM CLIENTE INNER JOIN DOCUMENTO ON CLIENTE."Cliente" = DOCUMENTO."Cliente";

-- ============================================
-- FUNCIONES Y PROCEDIMIENTOS
-- ============================================

CREATE OR REPLACE FUNCTION ven_AnalisisVenta(p_anual INTEGER, p_mes SMALLINT)
RETURNS TABLE(Anual INTEGER, Mes INTEGER, Dia INTEGER, Cliente CHAR(4), Zona CHAR(2),
    CliNombre VARCHAR(100), Fecha TIMESTAMP, pagado NUMERIC(9,2), Personal CHAR(2),
    Marca CHAR(2), NomProducto VARCHAR(200), totcantidad NUMERIC, totMonto NUMERIC) AS $$
BEGIN
    RETURN QUERY
    SELECT EXTRACT(YEAR FROM v."Fecha")::INTEGER, EXTRACT(MONTH FROM v."Fecha")::INTEGER, EXTRACT(DAY FROM v."Fecha")::INTEGER,
           v."Cliente", v."Zona", v."Nombre", v."Fecha", v."pagado", v."Personal",
           v."Marca", v."Descripcion", v."TotCantidad", v."TotMonto"
    FROM v_Ventas v
    WHERE EXTRACT(YEAR FROM v."Fecha") = p_anual AND EXTRACT(MONTH FROM v."Fecha") = p_mes;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION Ven_GeneraKardex(p_idproducto CHAR(4))
RETURNS TABLE(Documento CHAR(9), TipoDoc CHAR(1), Fecha TIMESTAMP, Cantidad NUMERIC(9,2), 
    Stock NUMERIC(9,2), Signo SMALLINT) AS $$
DECLARE
    v_stock NUMERIC(9,2) := 0;
    v_doc CHAR(9); v_tdoc CHAR(1); v_fecha TIMESTAMP; v_can NUMERIC(9,2); v_signo SMALLINT;
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
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION Ven_GenerarCronograma(p_doc CHAR(9), p_tdoc CHAR(1), p_cuotas SMALLINT)
RETURNS VOID AS $$
DECLARE v_igv NUMERIC(9,2); v_tasai NUMERIC(9,2); v_deuda NUMERIC(10,2) := 0; v_cta INTEGER := 0;
BEGIN
    SELECT COALESCE("Igv", 18)/100, COALESCE("TasaInt", 0)/100 INTO v_igv, v_tasai FROM PARAMETRO WHERE "activo" = TRUE;
    SELECT COALESCE(SUM("Cantidad" * "PrecUnit"), 0) INTO v_deuda FROM DETADOC WHERE "Documento" = p_doc AND "TipoDoc" = p_tdoc;
    WHILE v_cta < p_cuotas LOOP
        v_cta := v_cta + 1;
        INSERT INTO CRONOGRAMA ("NroCuota", "Documento", "TipoDoc", "Importe", "Interes", "IgvInteres", "feVence", "estado")
        VALUES (v_cta, p_doc, p_tdoc, v_deuda / p_cuotas, v_tasai * v_deuda / p_cuotas, 
                v_igv * v_tasai * v_deuda / p_cuotas, CURRENT_DATE + (v_cta || ' months')::INTERVAL, 'P');
    END LOOP;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION ven_Indicador_Venta(p_anual INTEGER)
RETURNS TABLE(Anual INTEGER, Mes INTEGER, MetaVenta NUMERIC, VentaReal NUMERIC) AS $$
BEGIN
    CREATE TEMP TABLE temp_venta_real AS
    SELECT EXTRACT(YEAR FROM "Fecha")::INTEGER AS Anual, EXTRACT(MONTH FROM "Fecha")::INTEGER AS Mes, SUM(monto) AS Monto
    FROM v_Documento WHERE EXTRACT(YEAR FROM "Fecha") = p_anual
    GROUP BY EXTRACT(YEAR FROM "Fecha"), EXTRACT(MONTH FROM "Fecha");

    RETURN QUERY
    SELECT mv."anual"::INTEGER, mv."Mes"::INTEGER, COALESCE(SUM(mv."Monto"), 0) AS MetaVenta, COALESCE(vr.Monto, 0) AS VentaReal
    FROM VentaMeta mv LEFT JOIN temp_venta_real vr ON mv."anual" = vr.Anual AND mv."Mes" = vr.Mes
    WHERE mv."anual" = p_anual GROUP BY mv."anual", mv."Mes", vr.Monto;
    
    DROP TABLE temp_venta_real;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION ven_Indicador_Venta_P(p_anual INTEGER)
RETURNS TABLE(Anual INTEGER, Mes INTEGER, MetaVenta NUMERIC, VentaReal NUMERIC, Personal CHAR(2)) AS $$
BEGIN
    CREATE TEMP TABLE temp_venta_real AS
    SELECT EXTRACT(YEAR FROM "Fecha")::INTEGER AS Anual, EXTRACT(MONTH FROM "Fecha")::INTEGER AS Mes, SUM(monto) AS Monto, "Personal"
    FROM v_Documento WHERE EXTRACT(YEAR FROM "Fecha") = p_anual
    GROUP BY EXTRACT(YEAR FROM "Fecha"), EXTRACT(MONTH FROM "Fecha"), "Personal";

    RETURN QUERY
    SELECT mv."anual"::INTEGER, mv."Mes"::INTEGER, SUM(mv."Monto") AS MetaVenta, vr.Monto AS VentaReal, mv."personal"
    FROM VentaMeta mv LEFT JOIN temp_venta_real vr ON mv."anual" = vr.Anual AND mv."Mes" = vr.Mes AND vr."Personal" = mv."personal"
    WHERE mv."anual" = p_anual GROUP BY mv."anual", mv."Mes", vr.Monto, mv."personal";
    
    DROP TABLE temp_venta_real;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION Ven_Indicadores(p_anual INTEGER)
RETURNS TABLE(Anual INTEGER, Mes INTEGER, Monto NUMERIC, Pagado NUMERIC(9,2)) AS $$
BEGIN
    RETURN QUERY SELECT EXTRACT(YEAR FROM "Fecha")::INTEGER, EXTRACT(MONTH FROM "Fecha")::INTEGER, monto, "pagado"
    FROM v_Documento WHERE EXTRACT(YEAR FROM "Fecha") = p_anual;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION Ven_ReporteDocumento(p_fecha1 TIMESTAMP, p_fecha2 TIMESTAMP, p_estado CHAR(1), p_personal CHAR(2))
RETURNS SETOF DOCUMENTO AS $$
BEGIN
    RETURN QUERY SELECT * FROM DOCUMENTO
    WHERE "Fecha" >= p_fecha1 AND "Fecha" < p_fecha2 + INTERVAL '1 day'
        AND "Estado" = p_estado AND "Personal" = p_personal;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION Ven_ReporteDocumento_Default(p_fecha1 TIMESTAMP, p_fecha2 TIMESTAMP, p_estado CHAR(1) DEFAULT 'C', p_personal CHAR(2) DEFAULT NULL)
RETURNS SETOF DOCUMENTO AS $$
BEGIN
    RETURN QUERY SELECT * FROM DOCUMENTO
    WHERE "Fecha" >= p_fecha1 AND "Fecha" < p_fecha2 + INTERVAL '1 day'
        AND "Estado" = p_estado AND (p_personal IS NULL OR "Personal" = p_personal);
END; $$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN PRINCIPAL KARDEX
-- ============================================
CREATE OR REPLACE FUNCTION Kardex_Consulta(
    p_idproducto CHAR(4),
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL
)
RETURNS TABLE(documento TEXT, tipomov TEXT, fecha DATE, cantidad NUMERIC(9,2), stock NUMERIC(9,2)) AS $$
DECLARE
    v_stock NUMERIC(9,2) := 0;
    v_doc CHAR(9); v_tdoc CHAR(1); v_fecha DATE; v_cantidad NUMERIC(9,2); v_signo INTEGER;
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
    SELECT d."Documento", d."TipoDoc", d."Fecha"::DATE as Fecha, dd."Cantidad", COALESCE(td."Signo", 1) as Signo, 0::NUMERIC(9,2) as Stock
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
    SELECT k."Documento" || '-' || k."TipoDoc", CASE WHEN k.Signo = 1 THEN 'INGRESO' ELSE 'SALIDA' END,
           k.Fecha, k."Cantidad", k.Stock
    FROM temp_kardex k ORDER BY k.Fecha ASC;
    DROP TABLE temp_kardex;
END; $$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIONES ADICIONALES DE INVENTARIO
-- ============================================
CREATE OR REPLACE FUNCTION Stock_Resumen(p_marca CHAR(2) DEFAULT NULL)
RETURNS TABLE(producto CHAR(4), descripcion VARCHAR(200), stock_actual INTEGER, stock_minimo INTEGER, estado TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT p."Producto", p."Descripcion", p."StockAc", p."StockMin",
           CASE WHEN p."StockAc" <= p."StockMin" THEN 'STOCK BAJO' ELSE 'NORMAL' END
    FROM PRODUCTO p WHERE p_marca IS NULL OR p."Marca" = p_marca ORDER BY p."StockAc" ASC;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION Productos_StockCritico()
RETURNS TABLE(producto CHAR(4), descripcion VARCHAR(200), stock_actual INTEGER, stock_minimo INTEGER, faltante INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT p."Producto", p."Descripcion", p."StockAc", p."StockMin", (p."StockMin" - p."StockAc")::INTEGER
    FROM PRODUCTO p WHERE p."StockAc" <= p."StockMin" ORDER BY (p."StockMin" - p."StockAc") DESC;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION Top_Productos_Vendidos(p_limite INTEGER DEFAULT 10)
RETURNS TABLE(producto CHAR(4), descripcion VARCHAR(200), total_vendido NUMERIC(12,2), cantidad_vendida NUMERIC(12,2)) AS $$
BEGIN
    RETURN QUERY
    SELECT dd."Producto", p."Descripcion", SUM(dd."Cantidad" * dd."PrecUnit"), SUM(dd."Cantidad")
    FROM DETADOC dd
    INNER JOIN DOCUMENTO d ON d."Documento" = dd."Documento" AND d."TipoDoc" = dd."TipoDoc"
    INNER JOIN PRODUCTO p ON p."Producto" = dd."Producto"
    WHERE d."TipoDoc" IN ('B', 'F')
    GROUP BY dd."Producto", p."Descripcion"
    ORDER BY SUM(dd."Cantidad" * dd."PrecUnit") DESC
    LIMIT p_limite;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION Consulta_Stock_Rapido(p_producto CHAR(4) DEFAULT NULL)
RETURNS TABLE(producto CHAR(4), descripcion VARCHAR(200), stock_actual INTEGER, stock_minimo INTEGER, estado TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT p."Producto", p."Descripcion", p."StockAc", p."StockMin",
           CASE WHEN p."StockAc" = 0 THEN 'AGOTADO' WHEN p."StockAc" <= p."StockMin" THEN 'STOCK BAJO' ELSE 'NORMAL' END
    FROM PRODUCTO p WHERE p_producto IS NULL OR p."Producto" = p_producto ORDER BY p."StockAc" ASC;
END; $$ LANGUAGE plpgsql;


-- ============================================
-- NUEVAS FUNCIONES COMPLEMENTARIAS
-- ============================================

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
    IF p_credito THEN
        v_tipo_doc := 'F';
    ELSE
        v_tipo_doc := 'B';
    END IF;

    SELECT COALESCE("Igv", 18) INTO v_igv_rate FROM PARAMETRO WHERE "activo" = TRUE LIMIT 1;
    IF v_igv_rate IS NULL THEN
        v_igv_rate := 18.00;
    END IF;

    INSERT INTO DOCUMENTO ("Documento", "TipoDoc", "Cliente", "Fecha", "Estado", "Personal", "FormaPago", "pagado", "IdTienda")
    VALUES (p_documento, v_tipo_doc, p_cliente, p_fecha, 'P', p_personal, p_forma_pago, 0, '01');

    FOR v_rec IN SELECT * FROM json_to_recordset(p_productos_json::json) AS x(producto CHAR(4), cantidad NUMERIC(9,2), precio NUMERIC(9,2))
    LOOP
        v_producto := v_rec.producto;
        v_cantidad := v_rec.cantidad;
        v_precio := v_rec.precio;
        v_igv_item := (v_precio * v_cantidad) * (v_igv_rate / 100.0);
        v_total := v_total + (v_precio * v_cantidad);

        INSERT INTO DETADOC ("Documento", "TipoDoc", "Producto", "Cantidad", "Igv", "PrecUnit")
        VALUES (p_documento, v_tipo_doc, v_producto, v_cantidad, v_igv_item, v_precio);
    END LOOP;

    IF NOT p_credito THEN
        UPDATE DOCUMENTO 
        SET "pagado" = v_total, "Estado" = 'C' 
        WHERE "Documento" = p_documento AND "TipoDoc" = v_tipo_doc;
    ELSE
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
    SELECT COALESCE("Igv", 18) INTO v_igv_rate FROM PARAMETRO WHERE "activo" = TRUE LIMIT 1;
    IF v_igv_rate IS NULL THEN
        v_igv_rate := 18.00;
    END IF;

    INSERT INTO DOCUMENTO ("Documento", "TipoDoc", "Proveedor", "Fecha", "Estado", "Personal", "pagado", "IdTienda")
    VALUES (p_documento, v_tipo_doc, p_proveedor, p_fecha, 'C', p_personal, 0, '01');

    FOR v_rec IN SELECT * FROM json_to_recordset(p_productos_json::json) AS x(producto CHAR(4), cantidad NUMERIC(9,2), precio NUMERIC(9,2))
    LOOP
        v_producto := v_rec.producto;
        v_cantidad := v_rec.cantidad;
        v_precio := v_rec.precio;
        v_igv_item := (v_precio * v_cantidad) * (v_igv_rate / 100.0);
        v_total := v_total + (v_precio * v_cantidad);

        INSERT INTO DETADOC ("Documento", "TipoDoc", "Producto", "Cantidad", "Igv", "PrecUnit")
        VALUES (p_documento, v_tipo_doc, v_producto, v_cantidad, v_igv_item, v_precio);
    END LOOP;

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


-- ============================================
-- TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION Actualizar_Stock_Producto()
RETURNS TRIGGER AS $$
DECLARE v_signo INTEGER := 1;
BEGIN
    SELECT COALESCE("Signo", 1) INTO v_signo FROM TIPODOC WHERE "TipoDoc" = NEW."TipoDoc";
    UPDATE PRODUCTO SET "StockAc" = "StockAc" + (NEW."Cantidad" * v_signo)::INTEGER WHERE "Producto" = NEW."Producto";
    RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualizar_stock AFTER INSERT ON DETADOC FOR EACH ROW EXECUTE FUNCTION Actualizar_Stock_Producto();

CREATE OR REPLACE FUNCTION Validar_Stock_Venta()
RETURNS TRIGGER AS $$
DECLARE v_stock_actual INTEGER; v_signo INTEGER;
BEGIN
    SELECT COALESCE("Signo", 1) INTO v_signo FROM TIPODOC WHERE "TipoDoc" = NEW."TipoDoc";
    IF v_signo = -1 THEN
        SELECT "StockAc" INTO v_stock_actual FROM PRODUCTO WHERE "Producto" = NEW."Producto";
        IF v_stock_actual < NEW."Cantidad" THEN
            RAISE EXCEPTION 'Stock insuficiente para producto %', NEW."Producto";
        END IF;
    END IF;
    RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_stock BEFORE INSERT ON DETADOC FOR EACH ROW EXECUTE FUNCTION Validar_Stock_Venta();

-- ============================================
-- DATOS DE PRUEBA
-- ============================================

DELETE FROM DETADOC;
DELETE FROM DOCUMENTO;
DELETE FROM CRONOGRAMA;
DELETE FROM PRODUCTO;
DELETE FROM CLIENTE;
DELETE FROM PERSONAL;
DELETE FROM MARCA;
DELETE FROM LINEA;
DELETE FROM PROVEEDOR;
DELETE FROM TIPODOC;
DELETE FROM ZONA;
DELETE FROM CIUDAD;
DELETE FROM Tienda;
DELETE FROM FORMAPAGO;
DELETE FROM PARAMETRO;
DELETE FROM VentaMeta;

INSERT INTO TIPODOC ("TipoDoc", "Descripcion", "Signo") VALUES 
('C', 'COMPRA', 1),
('B', 'BOLETA', -1),
('F', 'FACTURA', -1),
('N', 'NOTA CREDITO', 1),
('D', 'NOTA DEBITO', -1),
('P', 'PEDIDO', 0);

INSERT INTO CIUDAD ("idCiudad", "Nombre") VALUES (1, 'LIMA'), (2, 'CALLAO'), (3, 'AREQUIPA');

INSERT INTO ZONA ("Zona", "Descripcion") VALUES ('01', 'ZONA NORTE'), ('02', 'ZONA SUR');

INSERT INTO Tienda ("idTienda", "Descripcion", "Responsable", "Region", "idCiudad") VALUES 
('01', 'TIENDA CENTRAL', 'JUAN PEREZ', 1, 1),
('02', 'TIENDA NORTE', 'MARIA LOPEZ', 2, 2);

INSERT INTO PROVEEDOR ("Proveedor", "RazonSocial") VALUES ('PROV', 'PROVEEDOR GENERAL');

INSERT INTO LINEA ("Linea", "Descripcion", "ComiMayor") VALUES ('L1', 'ELECTRONICA', 5.00);

INSERT INTO MARCA ("Marca", "Proveedor", "Linea", "Descripcion") VALUES ('S1', 'PROV', 'L1', 'SAMSUNG');

INSERT INTO PRODUCTO ("Producto", "Marca", "Descripcion", "StockAc", "StockMax", "StockMin", "PrecVenta", "PrecCosto", "Peso", "ConIgv", "UniMed") VALUES 
('PR01', 'S1', 'SAMSUNG GALAXY S23', 100, 500, 10, 3500.00, 2500.00, 0.5, TRUE, 'UNIDAD'),
('PR02', 'S1', 'SAMSUNG TV 55', 50, 200, 5, 2000.00, 1400.00, 15.0, TRUE, 'UNIDAD');

INSERT INTO PARAMETRO ("Parametro", "Igv", "TasaInt", "TasaLegal", "Fecha", "TasaDolar", "activo", "Vencidos") VALUES 
(1, 18.00, 1.50, 2.00, CURRENT_TIMESTAMP, 3.80, TRUE, 30);

-- Insertar personal con Email y Password hasheada (clave: password123)
INSERT INTO PERSONAL ("Personal", "Nombre", "idTienda", "Activo", "Basico", "Email", "Password") VALUES 
('01', 'JUAN PEREZ', '01', TRUE, 2500.00, 'juan@tenebrosa.com', '$2a$10$qKiMCsS2UuLSKM6XJIktUO0O1/q/WxFAHSt9WxNekvYIGTSha/5xW'),
('02', 'MARIA LOPEZ', '01', TRUE, 2600.00, 'maria@tenebrosa.com', '$2a$10$qKiMCsS2UuLSKM6XJIktUO0O1/q/WxFAHSt9WxNekvYIGTSha/5xW');

INSERT INTO CLIENTE ("Cliente", "Zona", "Nombre", "idRepresentante", "genero", "TipoCliente") VALUES 
('CL01', '01', 'EMPRESA EJEMPLO', 1, 'M', 'E'),
('CL02', '02', 'CLIENTE VIP', 1, 'F', 'V');

INSERT INTO FORMAPAGO ("FormaPago", "Descripcion", "NroDias") VALUES 
('1', 'CONTADO', 0),
('2', 'CREDITO 30 DIAS', 30);

INSERT INTO DOCUMENTO ("Documento", "TipoDoc", "Proveedor", "Fecha", "Estado", "pagado", "IdTienda", "Personal") VALUES 
('C00000001', 'C', 'PROV', '2024-01-15', 'C', 5000.00, '01', '01'),
('B00000001', 'B', NULL, '2024-01-20', 'C', 3500.00, '01', '01');

INSERT INTO DETADOC ("Documento", "TipoDoc", "Producto", "Cantidad", "Igv", "PrecUnit") VALUES 
('C00000001', 'C', 'PR01', 10, 18, 2500.00),
('C00000001', 'C', 'PR02', 20, 18, 1400.00),
('B00000001', 'B', 'PR01', 2, 18, 3500.00);

INSERT INTO VentaMeta ("personal", "anual", "Mes", "zona", "Monto") VALUES 
('01', 2024, 1, '01', 50000),
('01', 2024, 2, '01', 55000),
('02', 2024, 1, '02', 45000);

-- ============================================
-- VERIFICAR Y PROBAR
-- ============================================
SELECT '=== PRODUCTOS ===' as Mensaje;
SELECT "Producto", "Descripcion", "StockAc" FROM PRODUCTO;

SELECT '=== KARDEX PR01 ===' as Mensaje;
SELECT * FROM Kardex_Consulta('PR01');

SELECT '=== STOCK RESUMEN ===' as Mensaje;
SELECT * FROM Stock_Resumen();

SELECT '=== PRODUCTOS STOCK CRITICO ===' as Mensaje;
SELECT * FROM Productos_StockCritico();

SELECT '=== TOP PRODUCTOS ===' as Mensaje;
SELECT * FROM Top_Productos_Vendidos(5);

SELECT '=== VENTAS POR VENDEDOR ===' as Mensaje;
SELECT * FROM ven_Indicador_Venta_P(2024);

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
