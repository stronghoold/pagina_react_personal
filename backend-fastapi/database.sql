-- ============================================
-- BASE DE DATOS: TechPC (Quinto Avance - FastAPI)
-- Entidades: roles, permisos, rol_permisos, usuarios,
--            categorias_productos, productos, servicios,
--            ventas, detalle_ventas, facturas, detalle_facturas,
--            pqr, conversaciones, mensajes
-- ============================================
CREATE DATABASE IF NOT EXISTS techpc_db;
USE techpc_db;

-- ============================================
-- TABLA: roles
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL UNIQUE,
  descripcion VARCHAR(100)
);

INSERT INTO roles (nombre, descripcion) VALUES
  ('administrador', 'Gestión total del sistema'),
  ('empleado', 'Gestión parcial del sistema'),
  ('cliente', 'Acceso a funcionalidades de cliente');

-- ============================================
-- TABLA: permisos
-- ============================================
CREATE TABLE IF NOT EXISTS permisos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(150)
);

INSERT INTO permisos (nombre, descripcion) VALUES
  ('gestion_usuarios', 'Crear, editar, eliminar y cambiar estado de usuarios'),
  ('gestion_productos', 'Crear, editar y eliminar productos'),
  ('gestion_servicios', 'Crear, editar y eliminar servicios'),
  ('ver_panel_admin', 'Acceder al panel de administración'),
  ('ver_panel_empleado', 'Acceder al panel de empleado'),
  ('ver_panel_cliente', 'Acceder al panel de cliente');

-- ============================================
-- TABLA: rol_permisos (relación N:M)
-- ============================================
CREATE TABLE IF NOT EXISTS rol_permisos (
  rol_id INT NOT NULL,
  permiso_id INT NOT NULL,
  PRIMARY KEY (rol_id, permiso_id),
  FOREIGN KEY (rol_id) REFERENCES roles(id),
  FOREIGN KEY (permiso_id) REFERENCES permisos(id)
);

INSERT INTO rol_permisos (rol_id, permiso_id) VALUES
  (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6),
  (2, 2), (2, 3), (2, 5),
  (3, 6);

-- ============================================
-- TABLA: usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  apellido VARCHAR(50) NOT NULL,
  tipo_documento VARCHAR(5) NOT NULL,
  numero_documento VARCHAR(12) NOT NULL UNIQUE,
  direccion VARCHAR(80) NOT NULL,
  telefono VARCHAR(16) NOT NULL,
  correo VARCHAR(80) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  rol_id INT NOT NULL DEFAULT 3,
  estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- ============================================
-- USUARIO ADMINISTRADOR POR DEFECTO
-- Contraseña: Admin123* (hash bcrypt)
-- ============================================
INSERT INTO usuarios (nombre, apellido, tipo_documento, numero_documento, direccion, telefono, correo, contrasena, rol_id, estado)
VALUES ('Administrador', 'General', 'CC', '1234567890', 'Cra 15 # 45-12, Bogotá', '3001234567', 'admin@techpc.com', '$2b$10$ZPzZuuyGu4GVP8d8RInJZ.gBx5CCc3BxNGozfKswVAsJv7spuEl06', 1, 'activo');

-- ============================================
-- TABLA: categorias_productos
-- ============================================
CREATE TABLE IF NOT EXISTS categorias_productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  descripcion VARCHAR(150)
);

INSERT INTO categorias_productos (nombre, descripcion) VALUES
  ('Procesadores', 'CPUs para escritorio y portátiles'),
  ('Tarjetas Gráficas', 'GPUs para gaming y trabajo'),
  ('Memoria RAM', 'Módulos DDR4 y DDR5'),
  ('Almacenamiento', 'SSD, HDD y NVMe'),
  ('Motherboards', 'Placas base ATX, Micro-ATX, Mini-ITX'),
  ('Fuentes de Poder', 'PSU certificadas'),
  ('Gabinetes', 'Torres y cases para PC'),
  ('Monitores', 'Pantallas para gaming y oficina'),
  ('Periféricos', 'Teclados, mouse, audífonos');

-- ============================================
-- TABLA: productos
-- ============================================
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(12,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  imagen_url VARCHAR(255),
  categoria_id INT,
  estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias_productos(id)
);

INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id) VALUES
  ('Procesador AMD Ryzen 7 7800X3D', 'Procesador de 8 núcleos y 16 hilos para gaming', 1550000, 12, 1),
  ('Tarjeta Gráfica RTX 4070 Super', 'GPU NVIDIA con 12GB GDDR6X', 2850000, 8, 2),
  ('Memoria RAM 32GB DDR5 6000MHz', 'Kit de 2x16GB RGB', 520000, 20, 3),
  ('SSD NVMe 1TB Gen4', 'Disco sólido con lectura de 7000 MB/s', 420000, 25, 4),
  ('Motherboard B650M', 'Placa base AM5 micro-ATX', 750000, 10, 5);

-- ============================================
-- TABLA: servicios
-- ============================================
CREATE TABLE IF NOT EXISTS servicios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(12,2) NOT NULL,
  duracion_estimada VARCHAR(50),
  imagen_url VARCHAR(255),
  estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO servicios (nombre, descripcion, precio, duracion_estimada) VALUES
  ('Ensamblaje de PC', 'Armado completo de computador de escritorio', 80000, '2-3 horas'),
  ('Instalación de Software', 'Instalación de sistema operativo y programas', 40000, '1-2 horas'),
  ('Mantenimiento Preventivo', 'Limpieza interna y optimización del sistema', 50000, '1-2 horas'),
  ('Diagnóstico Técnico', 'Revisión completa del estado del equipo', 30000, '1 hora'),
  ('Actualización de Componentes', 'Cambio o mejora de hardware', 60000, '1-3 horas');

-- ============================================
-- CLIENTE DE PRUEBA (Contraseña: Admin123*)
-- ============================================
INSERT INTO usuarios (nombre, apellido, tipo_documento, numero_documento, direccion, telefono, correo, contrasena, rol_id, estado)
VALUES ('Cliente', 'Demo', 'CC', '1234567891', 'Calle 10 # 5-20, Bogotá', '3101234567', 'cliente@techpc.com', '$2b$10$ZPzZuuyGu4GVP8d8RInJZ.gBx5CCc3BxNGozfKswVAsJv7spuEl06', 3, 'activo');

-- ============================================
-- TABLA: ventas (quinto avance)
-- ============================================
CREATE TABLE IF NOT EXISTS ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_venta VARCHAR(20) NOT NULL UNIQUE,
  cliente_id INT NOT NULL,
  usuario_id INT,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  descuento DECIMAL(12,2) NOT NULL DEFAULT 0,
  impuestos DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  metodo_pago VARCHAR(30) DEFAULT 'efectivo',
  estado ENUM('pendiente', 'pagada', 'anulada') DEFAULT 'pendiente',
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- ============================================
-- TABLA: detalle_ventas (productos y servicios de cada venta)
-- ============================================
CREATE TABLE IF NOT EXISTS detalle_ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venta_id INT NOT NULL,
  tipo ENUM('producto', 'servicio') NOT NULL DEFAULT 'producto',
  producto_id INT,
  servicio_id INT,
  descripcion VARCHAR(150) NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(12,2) NOT NULL DEFAULT 0,
  descuento DECIMAL(12,2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id),
  FOREIGN KEY (servicio_id) REFERENCES servicios(id)
);

-- ============================================
-- TABLA: facturas (quinto avance)
-- ============================================
CREATE TABLE IF NOT EXISTS facturas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_factura VARCHAR(20) NOT NULL UNIQUE,
  venta_id INT NOT NULL UNIQUE,
  cliente_id INT NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  descuento DECIMAL(12,2) NOT NULL DEFAULT 0,
  impuestos DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  metodo_pago VARCHAR(30) DEFAULT 'efectivo',
  estado ENUM('emitida', 'pagada', 'anulada') DEFAULT 'emitida',
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
  FOREIGN KEY (cliente_id) REFERENCES usuarios(id)
);

-- ============================================
-- TABLA: detalle_facturas (líneas congeladas de la factura)
-- ============================================
CREATE TABLE IF NOT EXISTS detalle_facturas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  factura_id INT NOT NULL,
  descripcion VARCHAR(150) NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(12,2) NOT NULL DEFAULT 0,
  descuento DECIMAL(12,2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  FOREIGN KEY (factura_id) REFERENCES facturas(id) ON DELETE CASCADE
);

-- ============================================
-- TABLA: pqr (Peticiones, Quejas y Reclamos)
-- ============================================
CREATE TABLE IF NOT EXISTS pqr (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tipo ENUM('peticion', 'queja', 'reclamo') NOT NULL DEFAULT 'peticion',
  asunto VARCHAR(120) NOT NULL,
  descripcion TEXT NOT NULL,
  estado ENUM('pendiente', 'en_proceso', 'respondida', 'cerrada') NOT NULL DEFAULT 'pendiente',
  respuesta TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- ============================================
-- TABLA: conversaciones (chatbot)
-- ============================================
CREATE TABLE IF NOT EXISTS conversaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  titulo VARCHAR(120) DEFAULT 'Nueva conversación',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- ============================================
-- TABLA: mensajes (mensajes de cada conversación)
-- ============================================
CREATE TABLE IF NOT EXISTS mensajes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversacion_id INT NOT NULL,
  rol ENUM('usuario', 'asistente') NOT NULL DEFAULT 'usuario',
  contenido TEXT NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id) ON DELETE CASCADE
);

-- ============================================
-- DATOS DE EJEMPLO DEL QUINTO AVANCE
-- ============================================
INSERT INTO ventas (numero_venta, cliente_id, usuario_id, subtotal, descuento, impuestos, total, metodo_pago, estado, fecha) VALUES
  ('V-DEMO-0001', 2, 1, 2850000, 0, 541500, 3391500, 'tarjeta', 'pagada', DATE_SUB(NOW(), INTERVAL 2 DAY)),
  ('V-DEMO-0002', 2, 1, 840000, 40000, 152000, 952000, 'transferencia', 'pagada', DATE_SUB(NOW(), INTERVAL 1 DAY)),
  ('V-DEMO-0003', 2, 2, 80000, 0, 15200, 95200, 'efectivo', 'pendiente', NOW());

INSERT INTO detalle_ventas (venta_id, tipo, producto_id, servicio_id, descripcion, cantidad, precio_unitario, descuento, subtotal) VALUES
  (1, 'producto', 2, NULL, 'Tarjeta Gráfica RTX 4070 Super', 1, 2850000, 0, 2850000),
  (2, 'producto', 4, NULL, 'SSD NVMe 1TB Gen4', 2, 420000, 40000, 800000),
  (3, 'servicio', NULL, 1, 'Ensamblaje de PC', 1, 80000, 0, 80000);

INSERT INTO facturas (numero_factura, venta_id, cliente_id, subtotal, descuento, impuestos, total, metodo_pago, estado, fecha) VALUES
  ('F-DEMO-0001', 1, 2, 2850000, 0, 541500, 3391500, 'tarjeta', 'pagada', DATE_SUB(NOW(), INTERVAL 2 DAY)),
  ('F-DEMO-0002', 2, 2, 840000, 40000, 152000, 952000, 'transferencia', 'pagada', DATE_SUB(NOW(), INTERVAL 1 DAY));

INSERT INTO detalle_facturas (factura_id, descripcion, cantidad, precio_unitario, descuento, subtotal) VALUES
  (1, 'Tarjeta Gráfica RTX 4070 Super', 1, 2850000, 0, 2850000),
  (2, 'SSD NVMe 1TB Gen4', 2, 420000, 40000, 800000);

INSERT INTO pqr (usuario_id, tipo, asunto, descripcion, estado, respuesta) VALUES
  (2, 'peticion', 'Consulta sobre garantía del SSD', 'Compré un SSD NVMe y quiero conocer el procedimiento para hacer efectiva la garantía.', 'en_proceso', NULL),
  (2, 'queja', 'Retraso en la entrega', 'El pedido tardó más de lo indicado en la página. Solicito revisar el proceso de despacho.', 'pendiente', NULL);