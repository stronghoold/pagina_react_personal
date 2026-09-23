"""Compone las 25 evidencias del quinto avance con marco estilo Windows 11.

Salida: docs/capturas-quinto-avance/E01..E25*.png
"""
import json
import os
import re
import sys
import shutil

import fitz  # PyMuPDF: renderiza los PDF que genera FastAPI
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import marcos  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, ".tmp", "capturas", "raw")
OUT = os.path.join(ROOT, ".tmp", "capturas", "out")
DST = os.path.join(ROOT, "docs", "capturas-quinto-avance")
ARCH = os.path.join(DST, "archivos")
os.makedirs(DST, exist_ok=True)
os.makedirs(ARCH, exist_ok=True)

D = json.load(open(os.path.join(ROOT, ".tmp", "capturas", "datos", "datos_q5.json"), encoding="utf-8"))
LOG = json.load(open(os.path.join(ROOT, ".tmp", "capturas", "datos", "api_log_q5.json"), encoding="utf-8"))

PROMPT = r"PS C:\...\pagina_react_personal\backend-fastapi> "


def sin_emoji(texto):
    return re.sub(r"[\U0001F000-\U0001FAFF\u2600-\u27BF\uFE0F\u2B00-\u2BFF]", "", texto).strip()


def api(etiqueta):
    for e in LOG:
        if e["etiqueta"] == etiqueta:
            return e
    raise KeyError(etiqueta)


def chrome(nombre, url, host="localhost:5173"):
    marcos.ventana_chrome(Image.open(os.path.join(RAW, nombre + ".png")), url,
                          os.path.join(DST, nombre + ".png"), host)
    print("  [ok]", nombre)


# ─────────────── arbol del explorador (backend) ───────────────
ARBOL_BACK = [
    (0, "pagina_react_personal", True, True),
    (1, "backend-fastapi", True, True),
    (2, "app", True, True),
    (3, "routers", True, True),
    (4, "chat.py", False, False),
    (4, "dashboard.py", False, False),
    (4, "facturas.py", False, False),
    (4, "pqr.py", False, False),
    (4, "ventas.py", False, False),
    (3, "utils", True, True),
    (4, "ia.py", False, False),
    (4, "reportes.py", False, False),
    (3, "config.py", False, False),
    (3, "main.py", False, True),
    (3, "models.py", False, False),
    (3, "schemas.py", False, False),
    (2, ".env", False, False),
    (2, ".env.example", False, False),
    (2, "Procfile", False, False),
    (2, "database.sql", False, False),
    (1, "frontend", True, False),
]

ARBOL_FRONT = [
    (0, "pagina_react_personal", True, True),
    (1, "frontend", True, True),
    (2, "src", True, True),
    (3, "components", True, True),
    (4, "charts", True, True),
    (5, "BarChart.jsx", False, True),
    (5, "LineChart.jsx", False, False),
    (4, "comercial", True, True),
    (5, "DashboardPanel.jsx", False, False),
    (5, "FacturasPanel.jsx", False, False),
    (5, "PqrPanel.jsx", False, False),
    (5, "ReportsPanel.jsx", False, False),
    (5, "VentasModal.jsx", False, False),
    (5, "VentasPanel.jsx", False, False),
    (4, "dashboard", True, True),
    (5, "StatCard.jsx", False, True),
    (4, "Chatbot.jsx", False, False),
    (4, "CheckoutModal.jsx", False, False),
    (3, "utils", True, False),
]


def arbol_con_abierto(arbol, nombre):
    return [(n, nom, carp, (nom == nombre) or (carp and n <= 2))
            for (n, nom, carp, _ab) in arbol]


def vscode(nombre_salida, arbol, tabs, abierto=None):
    marcos.ventana_vscode(arbol_con_abierto(arbol, abierto) if abierto else arbol, tabs,
                          os.path.join(DST, nombre_salida + ".png"))
    print("  [ok]", nombre_salida)


def coleccion_lateral():
    filas = []
    for carpeta in D["coleccion_postman"]["item"]:
        if "item" not in carpeta:
            continue
        filas.append((0, sin_emoji(carpeta["name"]), None))
        for req in carpeta["item"]:
            r = req.get("request", {})
            filas.append((1, sin_emoji(req["name"]), r.get("method", "GET")))
    return filas


COLECCION = coleccion_lateral()


def postman(nombre_salida, etiqueta):
    marcos.ventana_postman(COLECCION, api(etiqueta), os.path.join(DST, nombre_salida + ".png"))
    print("  [ok]", nombre_salida)


def pdf_en_chrome(origen, nombre_salida, titulo_url):
    """Renderiza la primera pagina de un PDF y la muestra en el visor de Chrome."""
    destino = os.path.join(ARCH, os.path.basename(origen))
    shutil.copyfile(origen, destino)
    doc = fitz.open(destino)
    pix = doc[0].get_pixmap(matrix=fitz.Matrix(2.2, 2.2))
    pagina = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    alto = 838
    ancho = int(pagina.width * alto / pagina.height)
    pagina = pagina.resize((ancho, alto))
    lienzo = Image.new("RGB", (1440, 860), (50, 53, 56))
    lienzo.paste(pagina, ((1440 - ancho) // 2, 10))
    url = "file:///" + destino.replace("\\", "/").lstrip("/")
    marcos.ventana_chrome(lienzo, url, os.path.join(DST, nombre_salida + ".png"),
                          host="", ajustar=False)
    print("  [ok]", nombre_salida)


def excel_real(archivo, nombre_salida):
    """Dibuja en Excel el libro .xlsx generado por FastAPI."""
    from openpyxl import load_workbook
    destino = os.path.join(ARCH, os.path.basename(archivo))
    shutil.copyfile(archivo, destino)
    wb = load_workbook(destino, data_only=True)
    ws = wb.active
    filas = [[("" if v is None else v) for v in fila] for fila in ws.iter_rows(values_only=True)]
    marcos.ventana_excel(ws.title, filas, os.path.join(DST, nombre_salida + ".png"),
                         os.path.basename(destino))
    print("  [ok]", nombre_salida)


def terminal(nombre_salida, bloques, titulo="Windows PowerShell"):
    marcos.ventana_terminal(titulo, bloques, os.path.join(DST, nombre_salida + ".png"))
    print("  [ok]", nombre_salida)


def main():
    # ── Pantallas de la aplicacion (Chrome) ──
    print("== Chrome (aplicacion React) ==")
    chrome("01-inicio", "/")
    chrome("02-chatbot", "/")
    chrome("03-chatbot-pqr", "/")
    chrome("04-admin-dashboard", "/admin")
    chrome("04b-admin-dashboard-graficos", "/admin")
    chrome("05-admin-dashboard-filtros", "/admin")
    chrome("06-admin-ventas", "/admin")
    chrome("07-admin-nueva-venta", "/admin")
    chrome("08-admin-venta-registrada", "/admin")
    chrome("09-admin-venta-detalle", "/admin")
    chrome("10-admin-ventas-filtros", "/admin")
    chrome("11-admin-ventas-facturada", "/admin")
    chrome("12-admin-facturas", "/admin")
    chrome("13-admin-factura-detalle", "/admin")
    chrome("14-admin-factura-pdf", "/admin")
    chrome("15-admin-reportes", "/admin")
    chrome("16-admin-reporte-pdf", "/admin")
    chrome("17-admin-reporte-excel", "/admin")
    chrome("18-admin-pqr", "/admin")
    chrome("19-admin-pqr-gestion", "/admin")
    chrome("20-admin-usuarios", "/admin")
    chrome("21-admin-productos", "/admin")
    chrome("30-empleado-dashboard", "/empleado")
    chrome("31-empleado-ventas", "/empleado")
    chrome("32-empleado-pqr", "/empleado")
    chrome("40-cliente-dashboard", "/cliente")
    chrome("41-cliente-compras", "/cliente")
    chrome("42-cliente-facturas", "/cliente")
    chrome("43-cliente-pqr-form", "/cliente")
    chrome("44-cliente-pqr-registrada", "/cliente")

    # ── Swagger ──
    print("== Swagger ==")
    for nombre, url in [("swagger-q5-01-general", "/docs"),
                        ("swagger-q5-02-ventas", "/docs"),
                        ("swagger-q5-03-chat", "/docs"),
                        ("swagger-q5-04-schemas", "/docs")]:
        chrome(nombre, url, host="127.0.0.1:8000")

    # ── Documentos generados por FastAPI ──
    print("== PDF y Excel ==")
    pdf_en_chrome(os.path.join(OUT, "reporte_ventas_2026-09-22.pdf"), "E05-reporte-pdf",
                  "reporte")
    excel_real(os.path.join(OUT, "reporte_ventas_2026-09-22.xlsx"), "E06-reporte-excel")
    pdf_en_chrome(os.path.join(OUT, "factura_V-20260922-0001.pdf"), "E09-factura-pdf",
                  "factura")

    # ── VS Code ──
    print("== VS Code ==")
    vscode("E15-integracion-dashboard", ARBOL_BACK,
           [("dashboard.py", D["router_dashboard"], "python")], abierto="dashboard.py")
    vscode("E18-chatbot-ia", ARBOL_BACK,
           [("ia.py", D["utils_ia"], "python")], abierto="ia.py")
    vscode("E19-api-key-segura", ARBOL_BACK,
           [(".env.example", D["env_example"], "env"), (".env", D["env"], "env")],
           abierto=".env.example")
    vscode("E20-despliegue", ARBOL_BACK,
           [("Procfile", D["procfile"], "text"), ("vercel.json", D["vercel_json"], "text"),
            ("_redirects", D["redirects"], "text")], abierto="Procfile")
    vscode("E22-modelos-esquemas", ARBOL_BACK,
           [("models.py", D["models_py"], "python"), ("schemas.py", D["schemas_py"], "python")])
    vscode("E23-componentes-react", ARBOL_FRONT,
           [("BarChart.jsx", D["barchart_jsx"], "text"), ("StatCard.jsx", D["statcard_jsx"], "text")],
           abierto="BarChart.jsx")

    # ── Terminal (MySQL) ──
    print("== Terminal ==")
    terminal("E21-base-datos-sql", [
        (PROMPT, 'mysql -u root -t -e "USE techpc_db; SHOW TABLES;"',
         D["sql_tablas"].splitlines(), (204, 204, 204)),
        (PROMPT, 'mysql -u root -t -e "USE techpc_db; DESCRIBE ventas;"',
         D["sql_ventas_describe"].splitlines(), (204, 204, 204)),
    ])
    terminal("EX-datos-ventas", [
        (PROMPT, 'mysql -u root -t -e "USE techpc_db; SELECT numero_venta, total, estado FROM ventas;"',
         D["sql_ventas"].splitlines(), (204, 204, 204)),
        (PROMPT, 'mysql -u root -t -e "USE techpc_db; SELECT * FROM facturas;"',
         D["sql_facturas"].splitlines()[:8], (204, 204, 204)),
    ])
    terminal("EX-detalle-venta", [
        (PROMPT, 'mysql -u root -t -e "USE techpc_db; SELECT * FROM detalle_ventas;"',
         D["sql_detalle"].splitlines(), (204, 204, 204)),
    ])

    # ── Postman ──
    print("== Postman ==")
    postman("E25-postman", "Registrar venta (POST)")
    postman("E24-seguridad", "Dashboard SIN token")
    postman("EX-postman-factura", "Generar factura (POST)")
    postman("EX-postman-chat", "Conversar con el chatbot")

    print("\nEvidencias generadas en", DST)


if __name__ == "__main__":
    main()
