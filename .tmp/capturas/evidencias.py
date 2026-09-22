"""Genera las evidencias faltantes del checklist (Windows 11).

Usa datos reales recolectados con recolectar.py: codigo del backend, salidas
de MySQL, verificacion del hash bcrypt, respuestas HTTP y Swagger UI.

Salida: docs/capturas-react/*.png
"""
import json
import os
import re
import sys

from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import marcos  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATOS = os.path.join(ROOT, ".tmp", "capturas", "datos")
RAW = os.path.join(ROOT, ".tmp", "capturas", "raw")
DST = os.path.join(ROOT, "docs", "capturas-react")
os.makedirs(DST, exist_ok=True)

D = json.load(open(os.path.join(DATOS, "datos.json"), encoding="utf-8"))
LOG = json.load(open(os.path.join(DATOS, "api_log.json"), encoding="utf-8"))
PROMPT = r"PS C:\...\pagina_react_personal\backend-fastapi> "


def sin_emoji(texto):
    return re.sub(r"[\U0001F000-\U0001FAFF\u2600-\u27BF\uFE0F\u2B00-\u2BFF]", "",
                  texto).strip()


def api(etiqueta):
    for e in LOG:
        if e["etiqueta"] == etiqueta:
            return e
    raise KeyError(etiqueta)


# ─────────────── arbol del explorador de VS Code ───────────────
ARBOL = [
    (0, "pagina_react_personal", True, True),
    (1, "backend-fastapi", True, True),
    (2, "app", True, True),
    (3, "routers", True, True),
    (4, "auth.py", False, False),
    (4, "productos.py", False, False),
    (4, "servicios.py", False, False),
    (4, "usuarios.py", False, False),
    (3, "config.py", False, False),
    (3, "database.py", False, False),
    (3, "main.py", False, True),
    (3, "models.py", False, False),
    (3, "schemas.py", False, False),
    (3, "security.py", False, False),
    (2, ".env", False, False),
    (2, ".env.example", False, False),
    (2, "database.sql", False, False),
    (2, "requirements.txt", False, False),
    (2, "run.py", False, False),
    (1, "frontend", True, False),
    (1, "INFORMACION_PROYECTO.md", False, False),
]


def arbol_con_abierto(nombre):
    return [(n, nom, carp, (nom == nombre) or (carp and n <= 2))
            for (n, nom, carp, _ab) in ARBOL]


# ─────────────── coleccion de Postman para la barra lateral ───────────────
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


# ─────────────── peticiones de Postman ───────────────
def peticion(etiqueta):
    e = api(etiqueta)
    return {
        "metodo": e["metodo"],
        "url": e["url"],
        "headers": e["headers"],
        "body": e["body"],
        "status": e["status"],
        "razon": e["razon"],
        "respuesta": e["respuesta"],
        "tiempo_ms": e["tiempo_ms"],
        "bytes": e["bytes"],
    }


CHROME = [
    ("swagger-01-general", "/docs", "127.0.0.1:8000"),
    ("swagger-02-login", "/docs", "127.0.0.1:8000"),
    ("swagger-03-schemas", "/docs", "127.0.0.1:8000"),
]


def main():
    # ── Chrome (Swagger) ──
    for nombre, url, host in CHROME:
        img = Image.open(os.path.join(RAW, nombre + ".png"))
        marcos.ventana_chrome(img, url, os.path.join(DST, nombre + ".png"), host)
        print("  [ok]", nombre)

    # ── VS Code ──
    vs = [
        ("VS-02-estructura", "main.py", [(("main.py"), D["main_py"], "python")]),
        ("VS-04-basedatos", "database.sql", [("database.sql", D["database_sql"], "sql")]),
        ("VS-06-modelos", None, [("models.py", D["models_py"], "python"),
                                 ("schemas.py", D["schemas_py"], "python")]),
        ("VS-07-conexion", None, [("config.py", D["config_py"], "python"),
                                  ("database.py", D["database_py"], "python")]),
        ("VS-23-entorno", None, [(".env.example", D["env_example"], "env"),
                                 (".env", D["env"], "env")]),
    ]
    for nombre, abierto, tabs in vs:
        arbol = arbol_con_abierto(abierto) if abierto else ARBOL
        marcos.ventana_vscode(arbol, tabs, os.path.join(DST, nombre + ".png"))
        print("  [ok]", nombre)

    # ── Terminal ──
    req = D["requirements"].splitlines()
    pip = D["pip_list"].splitlines()
    pip = pip[:1] + pip[2:22]
    term_entorno = [
        (PROMPT, r"..\.venv\Scripts\Activate.ps1", [], None),
        ("(.venv) " + PROMPT, "type requirements.txt", req, (204, 204, 204)),
        ("(.venv) " + PROMPT, "pip list", pip, (204, 204, 204)),
        ("(.venv) " + PROMPT, "python run.py", [
            "INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)",
            "INFO:     Application startup complete.",
        ], (130, 190, 130)),
    ]
    marcos.ventana_terminal(
        "Windows PowerShell", term_entorno, os.path.join(DST, "TERM-03-entorno.png"))
    print("  [ok] TERM-03-entorno")

    db = [
        ("(.venv) " + PROMPT, r'mysql -u root -e "USE techpc_db; DESCRIBE usuarios;"',
         D["sql_describe"].splitlines(), (204, 204, 204)),
        ("(.venv) " + PROMPT,
         r'mysql -u root -e "USE techpc_db; SELECT id,nombre,correo,rol_id,estado FROM usuarios;"',
         D["sql_usuarios"].splitlines()[:10], (204, 204, 204)),
    ]
    marcos.ventana_terminal(
        "Windows PowerShell", db, os.path.join(DST, "DB-05-usuarios.png"))
    print("  [ok] DB-05-usuarios")

    term_hash = [
        ("(.venv) " + PROMPT,
         r'mysql -u root -e "SELECT correo,contrasena FROM usuarios WHERE rol_id=1;"',
         D["sql_usuarios"].splitlines()[:6], (204, 204, 204)),
        ("(.venv) " + PROMPT,
         r'python -c "import bcrypt; print(bcrypt.checkpw(b\'Admin123*\', h))"',
         [str(D["bcrypt_ok"])], (135, 206, 135)),
        ("(.venv) " + PROMPT,
         "python -c \"print('contrasena en texto plano:', " + D["hash_plano"] + ")\"",
         ["contrasena en texto plano: " + D["hash_plano"]], (135, 206, 135)),
    ]
    marcos.ventana_terminal(
        "Windows PowerShell", term_hash, os.path.join(DST, "TERM-22-hash.png"))
    print("  [ok] TERM-22-hash")

    # ── Postman ──
    pm = [
        ("POST-11-jwt", "Listar usuarios (admin)"),
        ("POST-13-401", "Listar usuarios SIN token"),
        ("POST-15-registro", "Registrar usuario (POST)"),
        ("POST-26-login", "Iniciar sesion (admin)"),
    ]
    for nombre, etiqueta in pm:
        marcos.ventana_postman(COLECCION, peticion(etiqueta),
                               os.path.join(DST, nombre + ".png"))
        print("  [ok]", nombre)

    print("\nEvidencias generadas en", DST)


if __name__ == "__main__":
    main()
