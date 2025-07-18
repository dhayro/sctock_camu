-- Crear base de datos
CREATE DATABASE IF NOT EXISTS stock_camu
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE stock_camu;

-- Tabla de roles
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30) UNIQUE NOT NULL,
    descripcion TEXT
);

-- Tabla de cargos
CREATE TABLE cargos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT
);

-- Tabla de áreas
CREATE TABLE areas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT
);

-- Tabla de personal
CREATE TABLE personal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dni CHAR(8) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    cargo_id INT NOT NULL,
    area_id INT,
    telefono VARCHAR(15),
    direccion VARCHAR(200),
    email VARCHAR(100),
    estado BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (cargo_id) REFERENCES cargos(id) ON DELETE RESTRICT,
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE RESTRICT
);

-- Tabla de usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    personal_id INT,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    rol_id INT NOT NULL,
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE RESTRICT,
    FOREIGN KEY (personal_id) REFERENCES personal(id) ON DELETE RESTRICT
);

-- Tabla de socios
DROP TABLE IF EXISTS socios;

CREATE TABLE socios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    dni CHAR(8) UNIQUE ,
    apellidos VARCHAR(100) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    caserio VARCHAR(100),
    certificado BOOLEAN DEFAULT FALSE,
    direccion VARCHAR(200),
    telefono VARCHAR(20),
    email VARCHAR(100),
    estado BOOLEAN DEFAULT TRUE
);

-- Tabla de tipos de fruta
CREATE TABLE tipos_fruta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT
);

-- Tabla de unidades de medida
CREATE TABLE unidades_medida (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL,
    abreviatura VARCHAR(10) NOT NULL
);

-- Tabla de productos
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    unidad_medida_id INT NOT NULL,
    descripcion TEXT,
    estado BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (unidad_medida_id) REFERENCES unidades_medida(id) ON DELETE RESTRICT
);

CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    razon_social VARCHAR(150) NOT NULL,
    ruc CHAR(11) NOT NULL,
    direccion VARCHAR(200),
    telefono VARCHAR(20),
    email VARCHAR(100),
    estado BOOLEAN DEFAULT TRUE
);

CREATE TABLE pedidos_lotes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    cliente_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL,
    unidad_medida_id INT NOT NULL,
    fecha_pedido DATE NOT NULL,
    tipo_fruta_id INT NOT NULL,
    fecha_limite DATE,
    estado ENUM('pendiente', 'completado', 'cancelado') DEFAULT 'pendiente',
    observacion TEXT,
    usuario_creacion_id INT NOT NULL,
    usuario_modificacion_id INT,
    FOREIGN KEY (usuario_creacion_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_modificacion_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
    FOREIGN KEY (tipo_fruta_id) REFERENCES tipos_fruta(id) ON DELETE RESTRICT,
    FOREIGN KEY (unidad_medida_id) REFERENCES unidades_medida(id) ON DELETE RESTRICT
);

-- Tabla de ingresos
CREATE TABLE ingresos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_ingreso VARCHAR(20) UNIQUE NOT NULL,
    fecha DATETIME NOT NULL,
    socio_id INT NOT NULL,
    producto_id INT NOT NULL,
    pedido_lote_id INT NOT NULL,
    unidad_medida_id INT NOT NULL,
    tipo_fruta_id INT NOT NULL,
    num_jabas INT,
    dscto_merma DECIMAL(10,2),
    dscto_jaba DECIMAL(10,2),
    peso_neto DECIMAL(10,2),
    precio_venta_kg DECIMAL(10,2),
    total DECIMAL(10,2),
    pago_transporte DECIMAL(10,2),
    ingreso_cooperativa DECIMAL(10,2),
    pago_socio DECIMAL(10,2),
    pago_con_descuento DECIMAL(10,2),
    observacion TEXT,
    estado BOOLEAN DEFAULT TRUE,
    usuario_creacion_id INT NOT NULL,
    usuario_modificacion_id INT,
    FOREIGN KEY (usuario_creacion_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_modificacion_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (socio_id) REFERENCES socios(id) ON DELETE RESTRICT,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
    FOREIGN KEY (pedido_lote_id) REFERENCES pedidos_lotes(id) ON DELETE RESTRICT,
    FOREIGN KEY (unidad_medida_id) REFERENCES unidades_medida(id) ON DELETE RESTRICT,
    FOREIGN KEY (tipo_fruta_id) REFERENCES tipos_fruta(id) ON DELETE RESTRICT
);

CREATE TABLE detalle_pesajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ingreso_id INT NOT NULL,
    numero_pesaje INT NOT NULL,
    peso DECIMAL(10,2) NOT NULL,
    estado BOOLEAN DEFAULT TRUE,
    usuario_creacion_id INT NOT NULL,
    usuario_modificacion_id INT,
    FOREIGN KEY (usuario_creacion_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_modificacion_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (ingreso_id) REFERENCES ingresos(id) ON DELETE RESTRICT
);

CREATE TABLE salidas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATETIME NOT NULL,
    pedido_lote_id INT NOT NULL,
    cliente_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL,
    unidad_medida_id INT NOT NULL,
    guia_remision VARCHAR(30),
    destino VARCHAR(200),
    observacion TEXT,
    usuario_creacion_id INT NOT NULL,
    usuario_modificacion_id INT,
    FOREIGN KEY (usuario_creacion_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_modificacion_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (pedido_lote_id) REFERENCES pedidos_lotes(id) ON DELETE RESTRICT,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
    FOREIGN KEY (unidad_medida_id) REFERENCES unidades_medida(id) ON DELETE RESTRICT
);

-- Índices
CREATE INDEX idx_personal_dni ON personal(dni);
CREATE INDEX idx_usuarios_usuario ON usuarios(usuario);
CREATE INDEX idx_clientes_ruc ON clientes(ruc);
CREATE INDEX idx_ingresos_fecha ON ingresos(fecha);
CREATE INDEX idx_salidas_fecha ON salidas(fecha);
CREATE INDEX idx_socios_codigo ON socios(codigo);
CREATE INDEX idx_pedidos_lotes_codigo ON pedidos_lotes(codigo);
CREATE INDEX idx_ingresos_socio_id ON ingresos(socio_id);
CREATE INDEX idx_ingresos_producto_id ON ingresos(producto_id);
CREATE INDEX idx_ingresos_tipo_fruta_id ON ingresos(tipo_fruta_id);
CREATE INDEX idx_salidas_cliente_id ON salidas(cliente_id);
CREATE INDEX idx_salidas_producto_id ON salidas(producto_id);
CREATE INDEX idx_productos_nombre ON productos(nombre);
CREATE INDEX idx_socios_nombres ON socios(nombres);
CREATE INDEX idx_ingresos_pedido_lote_id ON ingresos(pedido_lote_id);
CREATE INDEX idx_salidas_pedido_lote_id ON salidas(pedido_lote_id);
CREATE INDEX idx_detalle_pesajes_ingreso_id ON detalle_pesajes(ingreso_id);

-- Vistas
CREATE OR REPLACE VIEW detalle_salidas AS
SELECT
    s.id AS salida_id,
    s.fecha,
    c.razon_social AS cliente,
    pl.id AS pedido_lote_id,
    pr.nombre AS producto,
    s.cantidad,
    um.abreviatura AS unidad,
    pl.codigo AS codigo_lote,
    s.destino,
    s.guia_remision
FROM salidas s
JOIN pedidos_lotes pl ON s.pedido_lote_id = pl.id
JOIN clientes c ON s.cliente_id = c.id
JOIN productos pr ON s.producto_id = pr.id
JOIN unidades_medida um ON s.unidad_medida_id = um.id;

CREATE OR REPLACE VIEW avance_pedidos AS
SELECT
    pl.id AS pedido_id,
    c.razon_social AS cliente,
    pr.nombre AS producto,
    pl.cantidad AS cantidad_solicitada,
    COALESCE(SUM(dp.peso), 0) AS cantidad_acopiada,
    (pl.cantidad - COALESCE(SUM(dp.peso), 0)) AS cantidad_faltante,
    CASE
        WHEN COALESCE(SUM(dp.peso), 0) >= pl.cantidad THEN 'completo'
        ELSE 'pendiente'
    END AS estado_acopio
FROM pedidos_lotes pl
JOIN clientes c ON pl.cliente_id = c.id
JOIN productos pr ON pl.producto_id = pr.id
LEFT JOIN ingresos i ON i.pedido_lote_id = pl.id
LEFT JOIN detalle_pesajes dp ON dp.ingreso_id = i.id
GROUP BY pl.id, c.razon_social, pr.nombre, pl.cantidad;

CREATE OR REPLACE VIEW contribucion_por_socio AS
SELECT
    pl.id AS pedido_id,
    s.codigo AS codigo_socio,
    s.nombres,
    s.apellidos,
    pr.nombre AS producto,
    SUM(dp.peso) AS total_aportado
FROM ingresos i
JOIN socios s ON i.socio_id = s.id
JOIN productos pr ON i.producto_id = pr.id
JOIN pedidos_lotes pl ON i.pedido_lote_id = pl.id
JOIN detalle_pesajes dp ON dp.ingreso_id = i.id
GROUP BY pl.id, s.id, pr.id;