"""Compone las capturas de la app dentro del marco de Chrome (Windows 11)."""
import glob
import os
import sys

from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import marcos  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, ".tmp", "capturas", "raw")
DST = os.path.join(ROOT, "docs", "capturas-react")
os.makedirs(DST, exist_ok=True)

# captura -> ruta de la app mostrada en la barra de direcciones
PAGES = {
    "01-inicio": "/",
    "02-quienes-somos": "/quienes-somos",
    "03-contacto": "/contacto",
    "04-arma-tu-pc": "/armar-pc",
    "05-login": "/login",
    "06-login-validaciones": "/login",
    "07-registro": "/login",
    "08-registro-validaciones": "/login",
    "09-registro-exitoso": "/login",
    "10-recuperar-password": "/recuperar-password",
    "11-navbar-admin": "/",
    "12-admin-usuarios": "/admin",
    "13-admin-editar-usuario": "/admin",
    "14-admin-productos": "/admin",
    "15-admin-servicios": "/admin",
    "16-menu-usuario": "/",
    "17-empleado-productos": "/empleado",
    "18-empleado-servicios": "/empleado",
    "19-cliente-productos": "/cliente",
    "20-cliente-servicios": "/cliente",
    "21-cliente-perfil": "/cliente",
    "22-cliente-cambiar-cuenta": "/cliente",
    "23-admin-sin-sesion": "/admin",
}


def main():
    for f in sorted(glob.glob(os.path.join(SRC, "*.png"))):
        nombre = os.path.splitext(os.path.basename(f))[0]
        if nombre not in PAGES:
            print("  (omitida)", nombre)
            continue
        marcos.ventana_chrome(Image.open(f), PAGES[nombre],
                              os.path.join(DST, nombre + ".png"))
        print("  [ok]", nombre)


if __name__ == "__main__":
    main()
