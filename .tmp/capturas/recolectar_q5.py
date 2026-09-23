"""Recolecta datos reales para las evidencias del QUINTO avance.

- Contenido de los archivos nuevos del backend y del frontend.
- Salidas reales del cliente MySQL (tablas, estructura, datos).
- Peticiones HTTP reales contra FastAPI (ventas, facturas, reportes, PQR,
  dashboards y chatbot), incluyendo respuestas 401 de endpoints protegidos.

Guarda todo en .tmp/capturas/datos/ (JSON).
"""
import json
import os
import subprocess
import time

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, ".tmp", "capturas", "datos")
os.makedirs(OUT, exist_ok=True)

MYSQL = r"C:\xampp\mysql\bin\mysql.exe"
API = "http://127.0.0.1:8000/api"
HOY = time.strftime("%Y-%m-%d")

datos = {}


def leer(rel):
    with open(os.path.join(ROOT, rel), encoding="utf-8") as fh:
        return fh.read()


def mysql(consulta):
    res = subprocess.run(
        [MYSQL, "-u", "root", "-t", "-e", consulta],
        capture_output=True, text=True, encoding="utf-8", errors="replace",
    )
    return res.stdout.strip()


def main():
    import requests

    # ── 1. Archivos del proyecto ──
    print("== archivos ==")
    archivos = {
        "main_py": "backend-fastapi/app/main.py",
        "config_py": "backend-fastapi/app/config.py",
        "models_py": "backend-fastapi/app/models.py",
        "schemas_py": "backend-fastapi/app/schemas.py",
        "security_py": "backend-fastapi/app/security.py",
        "router_ventas": "backend-fastapi/app/routers/ventas.py",
        "router_facturas": "backend-fastapi/app/routers/facturas.py",
        "router_dashboard": "backend-fastapi/app/routers/dashboard.py",
        "router_pqr": "backend-fastapi/app/routers/pqr.py",
        "router_chat": "backend-fastapi/app/routers/chat.py",
        "utils_ia": "backend-fastapi/app/utils/ia.py",
        "utils_reportes": "backend-fastapi/app/utils/reportes.py",
        "utils_numeracion": "backend-fastapi/app/utils/numeracion.py",
        "database_sql": "backend-fastapi/database.sql",
        "migracion_sql": "backend-fastapi/migracion_quinto_avance.sql",
        "env_example": "backend-fastapi/.env.example",
        "env": "backend-fastapi/.env",
        "procfile": "backend-fastapi/Procfile",
        "requirements": "backend-fastapi/requirements.txt",
        "vercel_json": "frontend/vercel.json",
        "redirects": "frontend/public/_redirects",
        "api_js": "frontend/src/utils/api.js",
        "barchart_jsx": "frontend/src/components/charts/BarChart.jsx",
        "linechart_jsx": "frontend/src/components/charts/LineChart.jsx",
        "statcard_jsx": "frontend/src/components/dashboard/StatCard.jsx",
        "chatbot_jsx": "frontend/src/components/Chatbot.jsx",
        "ventaspanel_jsx": "frontend/src/components/comercial/VentasPanel.jsx",
    }
    for clave, rel in archivos.items():
        try:
            datos[clave] = leer(rel)
        except OSError as exc:
            print("   falta", rel, exc)
    datos["coleccion_postman"] = json.loads(
        leer("backend-fastapi/TechPC_FastAPI.postman_collection.json"))

    # ── 2. Base de datos ──
    print("== mysql ==")
    datos["sql_tablas"] = mysql("USE techpc_db; SHOW TABLES;")
    datos["sql_ventas_describe"] = mysql("USE techpc_db; DESCRIBE ventas;")
    datos["sql_detalle_describe"] = mysql("USE techpc_db; DESCRIBE detalle_ventas;")
    datos["sql_facturas_describe"] = mysql("USE techpc_db; DESCRIBE facturas;")
    datos["sql_pqr_describe"] = mysql("USE techpc_db; DESCRIBE pqr;")
    datos["sql_conv_describe"] = mysql("USE techpc_db; DESCRIBE conversaciones;")
    datos["sql_mensajes_describe"] = mysql("USE techpc_db; DESCRIBE mensajes;")
    datos["sql_ventas"] = mysql(
        "USE techpc_db; SELECT v.id, v.numero_venta, DATE(v.fecha) AS fecha, "
        "CONCAT(u.nombre,' ',u.apellido) AS cliente, v.subtotal, v.impuestos, v.total, "
        "v.estado FROM ventas v LEFT JOIN usuarios u ON u.id = v.cliente_id "
        "ORDER BY v.id DESC;")
    datos["sql_detalle"] = mysql(
        "USE techpc_db; SELECT d.venta_id, d.tipo, COALESCE(p.nombre, s.nombre) AS item, "
        "d.cantidad, d.precio_unitario, d.subtotal FROM detalle_ventas d "
        "LEFT JOIN productos p ON p.id = d.producto_id "
        "LEFT JOIN servicios s ON s.id = d.servicio_id ORDER BY d.venta_id;")
    datos["sql_facturas"] = mysql(
        "USE techpc_db; SELECT id, numero_factura, venta_id, DATE(fecha) AS fecha, "
        "subtotal, impuestos, total, estado FROM facturas ORDER BY id DESC;")
    datos["sql_pqr"] = mysql(
        "USE techpc_db; SELECT id, tipo, asunto, LEFT(descripcion, 40) AS descripcion, estado "
        "FROM pqr ORDER BY id DESC;")
    datos["sql_conversaciones"] = mysql(
        "USE techpc_db; SELECT c.id, c.titulo, DATE(c.fecha_creacion) AS fecha, "
        "COUNT(m.id) AS mensajes FROM conversaciones c LEFT JOIN mensajes m "
        "ON m.conversacion_id = c.id GROUP BY c.id, c.titulo, c.fecha_creacion;")
    datos["sql_hash"] = mysql(
        "USE techpc_db; SELECT correo, CONCAT(LEFT(contrasena, 24), '...') AS hash_bcrypt "
        "FROM usuarios LIMIT 4;")

    # ── 3. Peticiones HTTP ──
    print("== api ==")
    log = []

    def pedir(metodo, ruta, etiqueta, token=None, body=None):
        headers = {"Content-Type": "application/json"}
        if token:
            headers["Authorization"] = "Bearer " + token
        res = requests.request(metodo, API + ruta, headers=headers, json=body, timeout=25)
        try:
            respuesta = res.json()
        except Exception:  # noqa: BLE001
            respuesta = res.text[:1500]
        entrada = {
            "etiqueta": etiqueta,
            "metodo": metodo,
            "url": API + ruta,
            "headers": {k: (v[:44] + "..." if k == "Authorization" and len(v) > 44 else v)
                        for k, v in headers.items()},
            "body": body,
            "status": res.status_code,
            "razon": res.reason,
            "respuesta": respuesta,
            "tiempo_ms": int(res.elapsed.total_seconds() * 1000),
            "bytes": len(res.content),
        }
        log.append(entrada)
        print("   %-6s %-52s -> %s" % (metodo, ruta, res.status_code))
        return entrada

    login = pedir("POST", "/auth/login", "Iniciar sesion (admin)",
                  body={"email": "admin@techpc.com", "contrasena": "Admin123*"})
    token = login["respuesta"]["token"]

    pedir("GET", "/ventas", "Historial de ventas", token=token)
    pedir("GET", "/ventas?estado=pendiente", "Historial filtrado (pendiente)", token=token)
    pedir("GET", "/ventas", "Historial de ventas SIN token")

    # venta nueva (1 servicio) para la evidencia de Postman
    marca = str(int(time.time()))[-6:]
    venta = pedir("POST", "/ventas", "Registrar venta (POST)",
                  token=token,
                  body={"cliente_id": 9, "metodo_pago": "tarjeta", "estado": "pagada",
                        "descuento": 0,
                        "items": [{"tipo": "servicio", "servicio_id": 8, "cantidad": 1,
                                   "descuento": 0}]})
    venta_id = (venta["respuesta"].get("sale") or {}).get("id")

    if venta_id:
        pedir("POST", "/facturas", "Generar factura (POST)", token=token,
              body={"venta_id": venta_id})
    pedir("GET", "/facturas", "Consultar facturas", token=token)
    pedir("GET", "/dashboard/admin", "Dashboard administrativo", token=token)
    pedir("GET", "/dashboard/ventas?agrupacion=dia", "Series de ventas (dia)", token=token)
    pedir("GET", "/dashboard/filtros", "Listas de los filtros", token=token)
    pedir("GET", "/ventas/reporte/diario?fecha=" + HOY, "Reporte diario de ventas", token=token)
    pedir("GET", "/dashboard/admin", "Dashboard SIN token")

    pqr = pedir("POST", "/pqr", "Registrar PQR (POST)", token=token,
                body={"tipo": "peticion", "asunto": "Solicitud de prueba " + marca,
                      "descripcion": "Solicitud creada desde la coleccion de pruebas de la API."})
    pqr_id = (pqr["respuesta"].get("pqr") or {}).get("id")
    if pqr_id:
        pedir("PATCH", "/pqr/%s" % pqr_id, "Gestionar PQR (PATCH)", token=token,
              body={"estado": "en_proceso", "respuesta": "Caso en revision por el area tecnica."})
    pedir("GET", "/pqr", "Listar PQR", token=token)

    pedir("GET", "/chat/info", "Informacion del chatbot")
    pedir("POST", "/chat", "Conversar con el chatbot",
          body={"mensaje": "¿Que servicios tecnicos ofrecen y cuanto cuestan?"})

    datos["log_api"] = log
    with open(os.path.join(OUT, "api_log_q5.json"), "w", encoding="utf-8") as fh:
        json.dump(log, fh, ensure_ascii=False, indent=2)
    with open(os.path.join(OUT, "datos_q5.json"), "w", encoding="utf-8") as fh:
        json.dump(datos, fh, ensure_ascii=False, indent=2)
    print("\nGuardado en", OUT)


if __name__ == "__main__":
    main()
