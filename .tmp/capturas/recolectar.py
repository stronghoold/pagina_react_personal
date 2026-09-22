"""Recolecta datos reales para las evidencias del cuarto avance.

- Contenido de archivos del backend (codigo, requirements, .env, SQL).
- Salidas reales del cliente MySQL (tablas, estructura, datos).
- Verificacion real del hash bcrypt.
- Peticiones HTTP reales (GET, POST, PUT, PATCH, DELETE) contra FastAPI.

Guarda todo en .tmp/capturas/datos/ (JSON + texto).
"""
import json
import os
import subprocess
import time

import requests

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BK = os.path.join(ROOT, "backend-fastapi")
OUT = os.path.join(ROOT, ".tmp", "capturas", "datos")
os.makedirs(OUT, exist_ok=True)

API = "http://127.0.0.1:8000/api"
MYSQL = r"C:\xampp\mysql\bin\mysql.exe"

datos = {}


def guardar(nombre, contenido):
    ruta = os.path.join(OUT, nombre)
    if isinstance(contenido, (dict, list)):
        with open(ruta, "w", encoding="utf-8") as fh:
            json.dump(contenido, fh, ensure_ascii=False, indent=2)
    else:
        with open(ruta, "w", encoding="utf-8") as fh:
            fh.write(contenido)
    return ruta


def leer_archivo(rel):
    with open(os.path.join(BK, rel), encoding="utf-8") as fh:
        return fh.read()


def mysql(consulta):
    res = subprocess.run(
        [MYSQL, "-u", "root", "-t", "-e", consulta],
        capture_output=True, text=True, encoding="utf-8", errors="replace",
    )
    return res.stdout.strip()


def main():
    # ── 1. Archivos del proyecto ──
    print("== archivos ==")
    for rel, clave in [
        ("requirements.txt", "requirements"),
        (".env.example", "env_example"),
        (".env", "env"),
        ("database.sql", "database_sql"),
        ("app/main.py", "main_py"),
        ("app/config.py", "config_py"),
        ("app/database.py", "database_py"),
        ("app/models.py", "models_py"),
        ("app/schemas.py", "schemas_py"),
        ("app/security.py", "security_py"),
        ("app/routers/auth.py", "router_auth"),
        ("app/routers/usuarios.py", "router_usuarios"),
        ("app/routers/productos.py", "router_productos"),
        ("app/routers/servicios.py", "router_servicios"),
    ]:
        datos[clave] = leer_archivo(rel)
    datos["coleccion_postman"] = json.loads(
        leer_archivo("TechPC_FastAPI.postman_collection.json"))

    # ── 2. Arbol de carpetas del backend ──
    print("== arbol ==")
    arbol = []
    for base, dirs, files in os.walk(BK):
        dirs[:] = [d for d in dirs if d not in ("__pycache__",)]
        rel = os.path.relpath(base, ROOT).replace("\\", "/")
        profundidad = rel.count("/")
        arbol.append(("  " * profundidad) + os.path.basename(base) + "/")
        for f in sorted(files):
            arbol.append(("  " * (profundidad + 1)) + f)
    datos["arbol"] = "\n".join(arbol)

    # ── 3. Dependencias instaladas ──
    print("== pip ==")
    res = subprocess.run(
        [os.path.join(ROOT, ".venv", "Scripts", "python.exe"), "-m", "pip", "list"],
        capture_output=True, text=True, encoding="utf-8", errors="replace",
    )
    datos["pip_list"] = res.stdout.strip()

    # ── 4. Base de datos ──
    print("== mysql ==")
    datos["sql_tablas"] = mysql("USE techpc_db; SHOW TABLES;")
    datos["sql_describe"] = mysql("USE techpc_db; DESCRIBE usuarios;")
    datos["sql_usuarios"] = mysql(
        "USE techpc_db; SELECT id, nombre, apellido, correo, "
        "CONCAT(LEFT(contrasena,22),'...') AS contrasena_hash, rol_id, estado "
        "FROM usuarios ORDER BY id;")
    datos["sql_roles"] = mysql("USE techpc_db; SELECT * FROM roles;")
    datos["sql_permisos"] = mysql("USE techpc_db; SELECT * FROM permisos;")
    datos["sql_rol_permisos"] = mysql("USE techpc_db; SELECT * FROM rol_permisos;")

    # ── 5. Verificacion del hash bcrypt ──
    print("== bcrypt ==")
    hash_admin = subprocess.run(
        [MYSQL, "-u", "root", "-N", "-e",
         "USE techpc_db; SELECT contrasena FROM usuarios WHERE correo='admin@techpc.com';"],
        capture_output=True, text=True, encoding="utf-8", errors="replace",
    ).stdout.strip()
    check = subprocess.run(
        [os.path.join(ROOT, ".venv", "Scripts", "python.exe"), "-c",
         "import bcrypt,sys; h=sys.argv[1].encode(); print(bcrypt.checkpw(b'Admin123*', h))",
         hash_admin],
        capture_output=True, text=True, encoding="utf-8", errors="replace",
    ).stdout.strip()
    datos["hash_admin"] = hash_admin
    datos["hash_plano"] = "NO" if hash_admin.startswith("$2b$") else "SI"
    datos["bcrypt_ok"] = check == "True"

    # ── 6. Peticiones HTTP reales ──
    print("== api ==")
    log = []

    def peticion(metodo, ruta, token=None, body=None, etiqueta="", archivo=None):
        url = API + ruta
        headers = {"Content-Type": "application/json"}
        if token:
            headers["Authorization"] = "Bearer " + token
        res = requests.request(metodo, url, headers=headers,
                               json=body, timeout=20)
        try:
            respuesta = res.json()
        except Exception:  # noqa: BLE001
            respuesta = res.text
        entrada = {
            "etiqueta": etiqueta,
            "metodo": metodo,
            "url": url,
            "headers": headers,
            "body": body,
            "status": res.status_code,
            "razon": res.reason,
            "respuesta": respuesta,
            "tiempo_ms": int(res.elapsed.total_seconds() * 1000),
            "bytes": len(res.content),
        }
        log.append(entrada)
        if archivo:
            guardar(archivo, json.dumps(entrada, ensure_ascii=False, indent=2))
        print("   %-6s %-40s -> %s" % (metodo, ruta, res.status_code))
        return entrada

    # login como administrador
    login = peticion("POST", "/auth/login", etiqueta="Iniciar sesion (admin)",
                     body={"email": "admin@techpc.com", "contrasena": "Admin123*"},
                     archivo="api_01_login.json")
    token = login["respuesta"].get("token", "")

    # GET publico
    peticion("GET", "/productos", etiqueta="Listar productos (publico)",
             archivo="api_02_get_productos.json")

    # GET protegido sin token -> 401
    peticion("GET", "/usuarios", etiqueta="Listar usuarios SIN token",
             archivo="api_03_sin_token.json")

    # GET protegido con token
    peticion("GET", "/usuarios", token=token, etiqueta="Listar usuarios (admin)",
             archivo="api_04_get_usuarios.json")

    # POST registro
    marca = str(int(time.time()))[-8:]
    correo = "prueba.api.%s@techpc.com" % marca
    reg = peticion("POST", "/usuarios/registro", etiqueta="Registrar usuario (POST)",
                   body={"nombre": "Mario", "apellido": "Prueba", "tipoDocumento": "CC",
                         "numeroDocumento": "20" + marca, "direccion": "Calle 100 # 20-30",
                         "telefono": "3009998877", "correo": correo,
                         "contrasena": "Prueba123*"},
                   archivo="api_05_post_registro.json")
    nuevo_id = reg["respuesta"].get("user", {}).get("id")

    # PUT
    peticion("PUT", "/usuarios/%s" % nuevo_id, token=token,
             etiqueta="Actualizar usuario (PUT)",
             body={"nombre": "Mario Andres", "telefono": "3001112233"},
             archivo="api_06_put.json")

    # PATCH
    peticion("PATCH", "/usuarios/%s/estado" % nuevo_id, token=token,
             etiqueta="Cambiar estado (PATCH)",
             body={"estado": "inactivo"}, archivo="api_07_patch.json")

    # DELETE
    peticion("DELETE", "/usuarios/%s" % nuevo_id, token=token,
             etiqueta="Eliminar usuario (DELETE)", archivo="api_08_delete.json")

    datos["log_api"] = log
    guardar("api_log.json", log)

    guardar("datos.json", datos)
    print("\nGuardado en", OUT)


if __name__ == "__main__":
    main()
