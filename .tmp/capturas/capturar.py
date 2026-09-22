"""Captura automatica de las pantallas del frontend React (TechPC).

Toma screenshots reales de la aplicacion corriendo en Windows usando el
Chromium de Playwright (por lo tanto, con renderizado y fuentes de Windows).

Los paneles se abren navegando con los enlaces internos del Navbar (igual que
un usuario), porque la app restaura la sesion despues del primer render y una
carga directa de /admin, /empleado o /cliente redirige al inicio.

Uso:
    python .tmp/capturas/capturar.py
"""
import os
import sys
import time

from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:5173")
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "raw")
os.makedirs(OUT, exist_ok=True)

ADMIN = ("admin@techpc.com", "Admin123*")
EMPLEADO = ("empleado@techpc.com", "Empleado123*")
CLIENTE = ("cliente@techpc.com", "Cliente123*")

taken = []
failed = []


def snap(page, name, full=False, wait=1600):
    page.wait_for_timeout(wait)
    path = os.path.join(OUT, name + ".png")
    page.screenshot(path=path, full_page=full)
    taken.append(name)
    print("  [ok] " + name)


def run(page, name, fn):
    try:
        fn()
    except Exception as exc:  # noqa: BLE001
        failed.append((name, str(exc)[:180]))
        print("  [!!] " + name + " -> " + str(exc)[:180])


def reset(page):
    page.goto(BASE + "/", wait_until="load")
    page.wait_for_timeout(600)
    page.evaluate("localStorage.clear()")


def login(page, creds):
    reset(page)
    page.goto(BASE + "/login", wait_until="load")
    page.wait_for_timeout(1300)
    page.fill('input[name="email"]', creds[0])
    page.fill('input[name="contrasena"]', creds[1])
    page.click('form button[type="submit"]')
    page.wait_for_timeout(2400)


def open_panel(page, link_text):
    """Abre el panel con el enlace del Navbar (navegacion interna de React)."""
    page.click('header a:has-text("%s")' % link_text)
    page.wait_for_timeout(2200)


def logout(page):
    page.evaluate("localStorage.removeItem('techpc_token'); localStorage.removeItem('techpc_user')")
    page.goto(BASE + "/", wait_until="load")
    page.wait_for_timeout(800)


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--force-color-profile=srgb"])
        ctx = browser.new_context(
            viewport={"width": 1440, "height": 860},
            device_scale_factor=1,
            locale="es-CO",
            timezone_id="America/Bogota",
            color_scheme="light",
        )
        page = ctx.new_page()

        # ---------- Paginas publicas ----------
        print("== Publicas ==")
        run(page, "01-inicio", lambda: (
            page.goto(BASE + "/", wait_until="load"), snap(page, "01-inicio")))
        run(page, "02-quienes-somos", lambda: (
            page.goto(BASE + "/quienes-somos", wait_until="load"), snap(page, "02-quienes-somos")))
        run(page, "03-contacto", lambda: (
            page.goto(BASE + "/contacto", wait_until="load"), snap(page, "03-contacto")))
        run(page, "04-arma-tu-pc", lambda: (
            page.goto(BASE + "/armar-pc", wait_until="load"), snap(page, "04-arma-tu-pc")))

        # ---------- Login + validaciones ----------
        print("== Login ==")
        run(page, "05-login", lambda: (
            reset(page),
            page.goto(BASE + "/login", wait_until="load"),
            snap(page, "05-login")))

        def login_errores():
            page.goto(BASE + "/login", wait_until="load")
            page.wait_for_timeout(900)
            page.fill('input[name="email"]', "correo-invalido")
            page.fill('input[name="contrasena"]', "123")
            page.click('form button[type="submit"]')
            snap(page, "06-login-validaciones")
        run(page, "06-login-validaciones", login_errores)

        # ---------- Registro ----------
        print("== Registro ==")

        def abrir_registro():
            page.goto(BASE + "/login", wait_until="load")
            page.wait_for_timeout(900)
            page.click('text=Crear una cuenta')
            snap(page, "07-registro")
        run(page, "07-registro", abrir_registro)

        def registro_errores():
            page.click('button:has-text("Registrarme")')
            snap(page, "08-registro-validaciones")
        run(page, "08-registro-validaciones", registro_errores)

        def registro_exitoso():
            correo = "captura.%d@techpc.com" % int(time.time())
            page.fill('input[name="nombre"]', "Andres")
            page.fill('input[name="apellido"]', "Gomez")
            page.select_option('select[name="tipoDocumento"]', "CC")
            page.fill('input[name="numeroDocumento"]', "1023456789")
            page.fill('input[name="direccion"]', "Cra 15 # 45-12, Bogota")
            page.fill('input[name="telefono"]', "3001234567")
            page.fill('input[name="correo"]', correo)
            page.fill('input[name="contrasena"]', "Cliente123*")
            page.fill('input[name="confirmarContrasena"]', "Cliente123*")
            page.wait_for_timeout(500)
            page.click('button:has-text("Registrarme")')
            page.wait_for_timeout(2000)
            snap(page, "09-registro-exitoso")
        run(page, "09-registro-exitoso", registro_exitoso)

        run(page, "10-recuperar-password", lambda: (
            page.goto(BASE + "/recuperar-password", wait_until="load"),
            snap(page, "10-recuperar-password")))

        # ---------- Sesion ADMIN ----------
        print("== Admin ==")
        run(page, "11-navbar-admin", lambda: (
            login(page, ADMIN),
            page.goto(BASE + "/", wait_until="load"),
            snap(page, "11-navbar-admin")))

        run(page, "12-admin-usuarios", lambda: (
            open_panel(page, "Admin"),
            snap(page, "12-admin-usuarios", wait=2400)))

        def admin_editar():
            page.click('button:has-text("Editar")')
            snap(page, "13-admin-editar-usuario")
            page.click('button:has-text("Cancelar")')
        run(page, "13-admin-editar-usuario", admin_editar)

        def admin_productos():
            page.click('button:has-text("Productos")')
            snap(page, "14-admin-productos", wait=2000)
        run(page, "14-admin-productos", admin_productos)

        def admin_servicios():
            page.click('button:has-text("Servicios")')
            snap(page, "15-admin-servicios", wait=2000)
        run(page, "15-admin-servicios", admin_servicios)

        def menu_usuario():
            page.goto(BASE + "/", wait_until="load")
            page.wait_for_timeout(1200)
            page.locator('header button').filter(has_text="Juan").first.click()
            snap(page, "16-menu-usuario")
        run(page, "16-menu-usuario", menu_usuario)

        # ---------- Sesion EMPLEADO ----------
        print("== Empleado ==")
        run(page, "17-empleado-productos", lambda: (
            login(page, EMPLEADO),
            open_panel(page, "Empleado"),
            snap(page, "17-empleado-productos", wait=2400)))

        def empleado_servicios():
            page.click('button:has-text("Servicios")')
            snap(page, "18-empleado-servicios", wait=2000)
        run(page, "18-empleado-servicios", empleado_servicios)

        # ---------- Sesion CLIENTE ----------
        print("== Cliente ==")
        run(page, "19-cliente-productos", lambda: (
            login(page, CLIENTE),
            open_panel(page, "Mi Panel"),
            snap(page, "19-cliente-productos", wait=2600)))

        def cliente_servicios():
            page.click('button:has-text("Servicios")')
            snap(page, "20-cliente-servicios", wait=1600)
        run(page, "20-cliente-servicios", cliente_servicios)

        def cliente_perfil():
            page.click('button:has-text("Mi Perfil")')
            snap(page, "21-cliente-perfil", wait=1600)
        run(page, "21-cliente-perfil", cliente_perfil)

        def cliente_cambiar():
            page.click('button:has-text("Cambiar cuenta")')
            snap(page, "22-cliente-cambiar-cuenta", wait=1600)
        run(page, "22-cliente-cambiar-cuenta", cliente_cambiar)

        # ---------- Bloqueo de acceso a ruta protegida sin sesion ----------
        print("== Protegidas ==")
        def acceso_denegado():
            logout(page)
            page.goto(BASE + "/admin", wait_until="load")
            snap(page, "23-admin-sin-sesion")
        run(page, "23-admin-sin-sesion", acceso_denegado)

        ctx.close()
        browser.close()

    print("\nCapturas: %d  |  Fallidas: %d" % (len(taken), len(failed)))
    for name, err in failed:
        print("  FALLO " + name + ": " + err)
    return 0 if not failed else 1


if __name__ == "__main__":
    sys.exit(main())
