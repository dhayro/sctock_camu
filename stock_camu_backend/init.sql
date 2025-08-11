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
    ruc CHAR(11) UNIQUE NOT NULL ,
    direccion VARCHAR(200),
    telefono VARCHAR(20),
    email VARCHAR(100),
    estado BOOLEAN DEFAULT TRUE
);

CREATE TABLE ordenes_compra (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_lote VARCHAR(20) UNIQUE NOT NULL,
    tipo_lote ENUM('organica', 'convencional') NOT NULL,
    tipo_pago ENUM('contado', 'credito') NOT NULL,
    cliente_id INT NOT NULL,
    numero_orden VARCHAR(20),
    fecha_emision DATE NOT NULL,
    fecha_entrega DATE,
    lugar_entrega TEXT,
    estado ENUM('pendiente', 'en_proceso', 'completado', 'cancelado') DEFAULT 'pendiente',
    observacion TEXT,
    forma_pago VARCHAR(50),
    usuario_creacion_id INT NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    usuario_modificacion_id INT,
    fecha_modificacion DATETIME,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_creacion_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_modificacion_id) REFERENCES usuarios(id) ON DELETE RESTRICT
);

CREATE TABLE detalle_ordenes_compra (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orden_compra_id INT NOT NULL,
    producto_id INT NOT NULL,
    tipo_fruta_id INT,
    cantidad DECIMAL(10,2) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    cantidad_ingresada DECIMAL(10,2) DEFAULT 0,  -- Para ir acumulando ingresos
    estado ENUM('pendiente', 'completado') DEFAULT 'pendiente',
    observacion TEXT,
    FOREIGN KEY (orden_compra_id) REFERENCES ordenes_compra(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
    FOREIGN KEY (tipo_fruta_id) REFERENCES tipos_fruta(id) ON DELETE RESTRICT
);


-- Tabla de ingresos actualizada
DROP TABLE IF EXISTS ingresos;

CREATE TABLE ingresos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_ingreso VARCHAR(20) UNIQUE NOT NULL,
    fecha DATETIME NOT NULL,
    socio_id INT NOT NULL,
    detalle_orden_id INT NOT NULL,
    
    -- Campos de peso y medidas
    peso_bruto DECIMAL(10,3) DEFAULT 0.000 COMMENT 'Peso total incluyendo jabas',
    peso_total_jabas DECIMAL(10,3) DEFAULT 0.000 COMMENT 'Peso total de las jabas vacías',
    num_jabas INT DEFAULT 0 COMMENT 'Número total de jabas',
    peso_neto DECIMAL(10,3) DEFAULT 0.000 COMMENT 'Peso neto del producto (bruto - jabas - merma)',
    peso_jaba_unitario DECIMAL(10,3) DEFAULT 2.000 COMMENT 'Peso de cada jaba vacía',
    
    -- Campos de descuentos
    dscto_merma DECIMAL(10,3) DEFAULT 0.000 COMMENT 'Descuento por merma en kg',
    dscto_jaba DECIMAL(10,3) DEFAULT 0.000 COMMENT 'Descuento por peso de jabas',
    aplicarPrecioJaba BOOLEAN DEFAULT FALSE COMMENT 'Indica si se aplica el precio de jaba',
    
    -- Campos financieros
    precio_venta_kg DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Precio por kilogramo',
    impuesto DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Porcentaje de impuesto',
    subtotal DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Subtotal sin impuesto',
    monto_impuesto DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Monto del impuesto calculado',
    total DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Total con impuesto',
    pago_transporte DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Porcentaje para pago de transporte',
    monto_transporte DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Monto calculado para transporte',
    ingreso_cooperativa DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Monto que ingresa a la cooperativa',
    pago_socio DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Monto a pagar al socio',
    pago_con_descuento DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Pago final con descuentos aplicados',
    
    -- Campos de control
    observacion TEXT,
    estado BOOLEAN DEFAULT TRUE,
    usuario_creacion_id INT NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    usuario_modificacion_id INT,
    fecha_modificacion DATETIME ON UPDATE CURRENT_TIMESTAMP,
    
    -- Restricciones de clave foránea
    FOREIGN KEY (detalle_orden_id) REFERENCES detalle_ordenes_compra(id) ON DELETE RESTRICT,
    FOREIGN KEY (socio_id) REFERENCES socios(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_creacion_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_modificacion_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    
    -- Índices para mejor rendimiento
    INDEX idx_numero_ingreso (numero_ingreso),
    INDEX idx_fecha (fecha),
    INDEX idx_socio_id (socio_id),
    INDEX idx_detalle_orden_id (detalle_orden_id),
    INDEX idx_estado (estado)
);

-- Tabla de detalle de pesajes actualizada
DROP TABLE IF EXISTS detalle_pesajes;

CREATE TABLE detalle_pesajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ingreso_id INT NOT NULL,
    numero_pesaje INT NOT NULL,
    peso_bruto DECIMAL(10,3) NOT NULL COMMENT 'peso_bruto registrado en kg con 3 decimales',
    peso_jaba DECIMAL(10,3) DEFAULT 2.000 COMMENT 'Peso de la jaba para este pesaje',
    descuento_merma_pesaje DECIMAL(10,3) DEFAULT 0.000 COMMENT 'Descuento de merma aplicado a este pesaje',
    peso_neto_pesaje DECIMAL(10,3) GENERATED ALWAYS AS (peso_bruto - peso_jaba - descuento_merma_pesaje) STORED COMMENT 'Peso neto calculado automáticamente',
    observacion_pesaje TEXT COMMENT 'Observaciones específicas del pesaje',
    fecha_pesaje DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp del pesaje',
    
    -- Campos de control
    estado BOOLEAN DEFAULT TRUE,
    usuario_creacion_id INT NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    usuario_modificacion_id INT,
    fecha_modificacion DATETIME ON UPDATE CURRENT_TIMESTAMP,
    
    -- Restricciones de clave foránea
    FOREIGN KEY (ingreso_id) REFERENCES ingresos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_creacion_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_modificacion_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    
    -- Restricciones únicas e índices
    UNIQUE KEY unique_pesaje_por_ingreso (ingreso_id, numero_pesaje),
    INDEX idx_ingreso_id (ingreso_id),
    INDEX idx_fecha_pesaje (fecha_pesaje),
    INDEX idx_estado (estado)
);

CREATE TABLE salidas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATETIME NOT NULL,
    detalle_orden_id INT NOT NULL,
    guia_remision VARCHAR(30),
    destino VARCHAR(200),
    observacion TEXT,
    usuario_creacion_id INT NOT NULL,
    usuario_modificacion_id INT,
    FOREIGN KEY (detalle_orden_id) REFERENCES detalle_ordenes_compra(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_creacion_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_modificacion_id) REFERENCES usuarios(id) ON DELETE RESTRICT
);

