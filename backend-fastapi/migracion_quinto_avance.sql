-- ============================================
-- MIGRACIÓN AL QUINTO AVANCE (TechPC)
-- ============================================
-- Úsalo cuando YA tengas la base de datos del cuarto avance y NO quieras
-- volver a ejecutar database.sql completo.
--
--   mysql -u root -p techpc_db < migracion_quinto_avance.sql
--
-- Características:
--   * Solo AGREGA tablas y registros: no elimina ni modifica nada existente.
--   * Es idempotente: se puede ejecutar varias veces sin duplicar datos.
-- ============================================

SET NAMES utf8mb4;

-- ============================================
-- 1. NUEVAS TABLAS
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

CREATE TABLE IF NOT EXISTS conversaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  titulo VARCHAR(120) DEFAULT 'Nueva conversación',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS mensajes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversacion_id INT NOT NULL,
  rol ENUM('usuario', 'asistente') NOT NULL DEFAULT 'usuario',
  contenido TEXT NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id) ON DELETE CASCADE
);

-- ============================================
-- 2. CLIENTE DE PRUEBA
-- Contraseña: Admin123*
-- ============================================
INSERT IGNORE INTO usuarios
  (nombre, apellido, tipo_documento, numero_documento, direccion, telefono, correo, contrasena, rol_id, estado)
VALUES
  ('Cliente', 'Demo', 'CC', '1234567891', 'Calle 10 # 5-20, Bogotá', '3101234567', 'cliente@techpc.com',
   '$2b$10$ZPzZuuyGu4GVP8d8RInJZ.gBx5CCc3BxNGozfKswVAsJv7spuEl06', 3, 'activo');

-- Variables auxiliares (evitan depender de identificadores fijos)
SET @cliente_id := (SELECT id FROM usuarios WHERE correo = 'cliente@techpc.com' LIMIT 1);
-- Usuario que registra las operaciones de ejemplo (un administrador existente)
SET @usuario_id := (SELECT id FROM usuarios WHERE rol_id = 1 ORDER BY id LIMIT 1);
SET @producto_a := (SELECT id FROM productos ORDER BY id LIMIT 1);
SET @producto_b := (SELECT id FROM productos ORDER BY id LIMIT 1 OFFSET 1);
SET @servicio_a := (SELECT id FROM servicios ORDER BY id LIMIT 1);

-- ============================================
-- 3. DATOS DE EJEMPLO (solo si aún no existen)
-- ============================================

INSERT INTO ventas
  (numero_venta, cliente_id, usuario_id, subtotal, descuento, impuestos, total, metodo_pago, estado, fecha)
SELECT 'V-DEMO-0001', @cliente_id, @usuario_id, 2850000, 0, 541500, 3391500, 'tarjeta', 'pagada', DATE_SUB(NOW(), INTERVAL 2 DAY)
FROM DUAL
WHERE @cliente_id IS NOT NULL AND @usuario_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ventas WHERE numero_venta = 'V-DEMO-0001');

INSERT INTO ventas
  (numero_venta, cliente_id, usuario_id, subtotal, descuento, impuestos, total, metodo_pago, estado, fecha)
SELECT 'V-DEMO-0002', @cliente_id, @usuario_id, 840000, 40000, 152000, 952000, 'transferencia', 'pagada', DATE_SUB(NOW(), INTERVAL 1 DAY)
FROM DUAL
WHERE @cliente_id IS NOT NULL AND @usuario_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ventas WHERE numero_venta = 'V-DEMO-0002');

INSERT INTO ventas
  (numero_venta, cliente_id, usuario_id, subtotal, descuento, impuestos, total, metodo_pago, estado, fecha)
SELECT 'V-DEMO-0003', @cliente_id, @usuario_id, 80000, 0, 15200, 95200, 'efectivo', 'pendiente', NOW()
FROM DUAL
WHERE @cliente_id IS NOT NULL AND @usuario_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ventas WHERE numero_venta = 'V-DEMO-0003');

INSERT INTO detalle_ventas
  (venta_id, tipo, producto_id, servicio_id, descripcion, cantidad, precio_unitario, descuento, subtotal)
SELECT v.id, 'producto', @producto_a, NULL, 'Tarjeta Gráfica RTX 4070 Super', 1, 2850000, 0, 2850000
FROM ventas v
WHERE v.numero_venta = 'V-DEMO-0001'
  AND NOT EXISTS (SELECT 1 FROM detalle_ventas d WHERE d.venta_id = v.id);

INSERT INTO detalle_ventas
  (venta_id, tipo, producto_id, servicio_id, descripcion, cantidad, precio_unitario, descuento, subtotal)
SELECT v.id, 'producto', @producto_b, NULL, 'SSD NVMe 1TB Gen4', 2, 420000, 40000, 800000
FROM ventas v
WHERE v.numero_venta = 'V-DEMO-0002'
  AND NOT EXISTS (SELECT 1 FROM detalle_ventas d WHERE d.venta_id = v.id);

INSERT INTO detalle_ventas
  (venta_id, tipo, producto_id, servicio_id, descripcion, cantidad, precio_unitario, descuento, subtotal)
SELECT v.id, 'servicio', NULL, @servicio_a, 'Ensamblaje de PC', 1, 80000, 0, 80000
FROM ventas v
WHERE v.numero_venta = 'V-DEMO-0003'
  AND NOT EXISTS (SELECT 1 FROM detalle_ventas d WHERE d.venta_id = v.id);

INSERT INTO facturas
  (numero_factura, venta_id, cliente_id, subtotal, descuento, impuestos, total, metodo_pago, estado, fecha)
SELECT 'F-DEMO-0001', v.id, @cliente_id, 2850000, 0, 541500, 3391500, 'tarjeta', 'pagada', DATE_SUB(NOW(), INTERVAL 2 DAY)
FROM ventas v
WHERE v.numero_venta = 'V-DEMO-0001'
  AND NOT EXISTS (SELECT 1 FROM facturas f WHERE f.numero_factura = 'F-DEMO-0001');

INSERT INTO facturas
  (numero_factura, venta_id, cliente_id, subtotal, descuento, impuestos, total, metodo_pago, estado, fecha)
SELECT 'F-DEMO-0002', v.id, @cliente_id, 840000, 40000, 152000, 952000, 'transferencia', 'pagada', DATE_SUB(NOW(), INTERVAL 1 DAY)
FROM ventas v
WHERE v.numero_venta = 'V-DEMO-0002'
  AND NOT EXISTS (SELECT 1 FROM facturas f WHERE f.numero_factura = 'F-DEMO-0002');

INSERT INTO detalle_facturas
  (factura_id, descripcion, cantidad, precio_unitario, descuento, subtotal)
SELECT f.id, 'Tarjeta Gráfica RTX 4070 Super', 1, 2850000, 0, 2850000
FROM facturas f
WHERE f.numero_factura = 'F-DEMO-0001'
  AND NOT EXISTS (SELECT 1 FROM detalle_facturas d WHERE d.factura_id = f.id);

INSERT INTO detalle_facturas
  (factura_id, descripcion, cantidad, precio_unitario, descuento, subtotal)
SELECT f.id, 'SSD NVMe 1TB Gen4', 2, 420000, 40000, 800000
FROM facturas f
WHERE f.numero_factura = 'F-DEMO-0002'
  AND NOT EXISTS (SELECT 1 FROM detalle_facturas d WHERE d.factura_id = f.id);

INSERT INTO pqr (usuario_id, tipo, asunto, descripcion, estado, respuesta)
SELECT @cliente_id, 'peticion', 'Consulta sobre garantía del SSD',
       'Compré un SSD NVMe y quiero conocer el procedimiento para hacer efectiva la garantía.',
       'en_proceso', NULL
FROM DUAL
WHERE @cliente_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM pqr WHERE asunto = 'Consulta sobre garantía del SSD');

INSERT INTO pqr (usuario_id, tipo, asunto, descripcion, estado, respuesta)
SELECT @cliente_id, 'queja', 'Retraso en la entrega',
       'El pedido tardó más de lo indicado en la página. Solicito revisar el proceso de despacho.',
       'pendiente', NULL
FROM DUAL
WHERE @cliente_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM pqr WHERE asunto = 'Retraso en la entrega');

-- ============================================
-- 4. VERIFICACIÓN
-- ============================================
SELECT 'Migración del quinto avance aplicada correctamente' AS resultado;
SELECT
  (SELECT COUNT(*) FROM ventas)      AS ventas,
  (SELECT COUNT(*) FROM facturas)    AS facturas,
  (SELECT COUNT(*) FROM pqr)         AS pqr,
  (SELECT COUNT(*) FROM conversaciones) AS conversaciones;
