"""Captura automatica de las pantallas del QUINTO avance (TechPC).

Toma screenshots reales de la aplicacion corriendo en Windows usando el
Chromium de Playwright (renderizado y fuentes de Windows) y descarga los
documentos que genera FastAPI (reporte PDF, reporte Excel y factura PDF).

Uso:
    python .tmp/capturas/capturar_q5.py
"""
import os
import sys

from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:5173")
HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "raw")
OUT = os.path.join(HERE, "out")
os.makedirs(RAW, exist_ok=True)
os.makedirs(OUT, exist_ok=True)

ADMIN = ("admin@techpc.com", "Admin123*")
EMPLEADO = ("empleado@techpc.com", "Empleado123*")
CLIENTE = ("cliente@techpc.com", "Cliente123*")

taken = []
failed = []
descargas = []


def snap(page, name, wait=1500):
    page.wait_for_timeout(wait)
    page.screenshot(path=os.path.join(RAW, name + ".png"))
    taken.append(name)
    print("  [ok] " + name)


def run(name, fn):
    try:
        fn()
    except Exception as exc:  # noqa: BLE001
        failed.append((name, str(exc)[:200]))
        print("  [!!] %s -> %s" % (name, str(exc)[:200]))


def boton(page, texto):
    """Boton por nombre accesible exacto (evita 'Ver tienda' cuando busco 'Ver')."""
    return page.get_by_role("button", name=texto, exact=True)


def reset(page):
    page.goto(BASE + "/", wait_until="load")
    page.wait_for_timeout(500)
    page.evaluate("localStorage.clear()")


def login(page, creds):
    reset(page)
    page.goto(BASE + "/login", wait_until="load")
    page.wait_for_timeout(1200)
    page.fill('input[name="email"]', creds[0])
    page.fill('input[name="contrasena"]', creds[1])
    page.click('form button[type="submit"]')
    page.wait_for_timeout(2600)


def abrir_panel(page, ruta):
    page.locator('nav a[href="%s"]' % ruta).first.click()
    page.wait_for_timeout(2600)


def tab_admin(page, texto):
    page.locator('aside button:has-text("%s")' % texto).first.click()
    page.wait_for_timeout(2400)


def tab(page, texto):
    page.locator('button:has-text("%s")' % texto).first.click()
    page.wait_for_timeout(1800)


def descargar(page, locator, prefijo, destino):
    with page.expect_download(timeout=60000) as info:
        locator.click()
    dl = info.value
    ruta = os.path.join(OUT, destino)
    dl.save_as(ruta)
    descargas.append((prefijo, ruta, os.path.getsize(ruta)))
    print("  [dl] %s -> %s (%d bytes)" % (prefijo, os.path.basename(ruta), os.path.getsize(ruta)))
    return ruta


# ══════════════════════════════════════════════════════════

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--force-color-profile=srgb"], downloads_path=OUT)
        ctx = browser.new_context(
            viewport={"width": 1440, "height": 860},
            device_scale_factor=1,
            locale="es-CO",
            timezone_id="America/Bogota",
            color_scheme="light",
            accept_downloads=True,
        )
        page = ctx.new_page()

        # ───────────── Publicas / Chatbot ─────────────
        print("== Publicas / Chatbot ==")
        run("01-inicio", lambda: (page.goto(BASE + "/", wait_until="load"), snap(page, "01-inicio")))

        def chatbot():
            page.locator('button[aria-label="Abrir chat de atención"]').first.click()
            page.wait_for_timeout(1600)
            page.fill('input[placeholder^="Escribe tu pregunta"]', "¿Qué productos y precios tienen?")
            page.locator('button[aria-label="Enviar mensaje"]').first.click()
            snap(page, "02-chatbot", wait=4500)
        run("02-chatbot", chatbot)

        def chatbot_pqr():
            page.fill('input[placeholder^="Escribe tu pregunta"]',
                      "Necesito poner una queja por un producto que llegó dañado")
            page.locator('button[aria-label="Enviar mensaje"]').first.click()
            snap(page, "03-chatbot-pqr", wait=5000)
        run("03-chatbot-pqr", chatbot_pqr)

        # ───────────── Sesion ADMIN ─────────────
        print("== Admin ==")
        run("04-admin-dashboard", lambda: (login(page, ADMIN), abrir_panel(page, "/admin"),
                                           snap(page, "04-admin-dashboard", wait=2600)))

        def admin_filtros():
            page.locator('label:has-text("Estado") select').first.select_option("pagada")
            page.wait_for_timeout(1200)
            page.locator('label:has-text("Agrupar por") select').first.select_option("mes")
            page.locator('label:has-text("Producto") select').first.select_option(index=1)
            snap(page, "05-admin-dashboard-filtros", wait=2600)
        run("05-admin-dashboard-filtros", admin_filtros)

        run("06-admin-ventas", lambda: (tab_admin(page, "Ventas"),
                                        snap(page, "06-admin-ventas", wait=2400)))

        def nueva_venta():
            boton(page, "+ Registrar venta").first.click()
            page.wait_for_timeout(2000)
            form = page.locator('form:has-text("Detalle de la venta")')
            sel = form.locator("select")
            sel.nth(0).select_option(index=1)          # cliente
            sel.nth(4).select_option(index=1)          # producto del item 1
            page.wait_for_timeout(1000)
            boton(page, "+ Agregar ítem").first.click()
            page.wait_for_timeout(1000)
            form = page.locator('form:has-text("Detalle de la venta")')
            sel = form.locator("select")
            sel.nth(5).select_option("servicio")       # tipo del item 2
            page.wait_for_timeout(900)
            sel.nth(6).select_option(index=1)          # servicio
            page.wait_for_timeout(1400)
            snap(page, "07-admin-nueva-venta")
        run("07-admin-nueva-venta", nueva_venta)

        def guardar_venta():
            boton(page, "Registrar venta").first.click()
            page.wait_for_timeout(3200)
            snap(page, "08-admin-venta-registrada", wait=1200)
        run("08-admin-venta-registrada", guardar_venta)

        def detalle_venta():
            boton(page, "Ver").first.click()
            snap(page, "09-admin-venta-detalle", wait=1600)
            boton(page, "Cerrar").first.click()
            page.wait_for_timeout(800)
        run("09-admin-venta-detalle", detalle_venta)

        def filtro_ventas():
            page.locator('label:has-text("Estado") select').first.select_option("pagada")
            page.wait_for_timeout(1200)
            page.locator('label:has-text("Cliente") select').first.select_option(index=1)
            snap(page, "10-admin-ventas-filtros", wait=2200)
        run("10-admin-ventas-filtros", filtro_ventas)

        def facturar():
            boton(page, "Facturar").first.click()
            snap(page, "11-admin-ventas-facturada", wait=2800)
        run("11-admin-ventas-facturada", facturar)

        run("12-admin-facturas", lambda: (tab_admin(page, "Facturas"),
                                          snap(page, "12-admin-facturas", wait=2600)))

        def factura_detalle():
            boton(page, "Ver").first.click()
            snap(page, "13-admin-factura-detalle", wait=1600)
            boton(page, "Cerrar").first.click()
            page.wait_for_timeout(800)
        run("13-admin-factura-detalle", factura_detalle)

        def factura_pdf():
            descargar(page, boton(page, "PDF").first, "factura pdf", "factura_V-20260922-0001.pdf")
            snap(page, "14-admin-factura-pdf", wait=1400)
        run("14-admin-factura-pdf", factura_pdf)

        def reportes():
            tab_admin(page, "Reportes")
            page.locator('input[type="date"]').first.fill("2026-09-22")
            page.wait_for_timeout(2400)
            snap(page, "15-admin-reportes", wait=1200)
        run("15-admin-reportes", reportes)

        def reporte_pdf():
            descargar(page, boton(page, "📄 Exportar PDF").first, "reporte pdf",
                      "reporte_ventas_2026-09-22.pdf")
            snap(page, "16-admin-reporte-pdf", wait=1500)
        run("16-admin-reporte-pdf", reporte_pdf)

        def reporte_excel():
            page.wait_for_timeout(800)
            descargar(page, boton(page, "📊 Exportar Excel").first, "reporte excel",
                      "reporte_ventas_2026-09-22.xlsx")
            snap(page, "17-admin-reporte-excel", wait=1500)
        run("17-admin-reporte-excel", reporte_excel)

        run("18-admin-pqr", lambda: (tab_admin(page, "PQR"),
                                     snap(page, "18-admin-pqr", wait=2600)))

        def pqr_gestion():
            boton(page, "Gestionar").first.click()
            page.wait_for_timeout(1000)
            page.locator('select').last.select_option("en_proceso")
            page.locator("textarea").first.fill(
                "Estamos revisando el caso con el área técnica. Te contactaremos en 24 horas.")
            snap(page, "19-admin-pqr-gestion", wait=1200)
            boton(page, "Cancelar").first.click()
            page.wait_for_timeout(700)
        run("19-admin-pqr-gestion", pqr_gestion)

        run("20-admin-usuarios", lambda: (tab_admin(page, "Usuarios"),
                                          snap(page, "20-admin-usuarios", wait=2600)))
        run("21-admin-productos", lambda: (tab_admin(page, "Productos"),
                                           snap(page, "21-admin-productos", wait=2600)))

        # ───────────── Sesion EMPLEADO ─────────────
        print("== Empleado ==")
        run("30-empleado-dashboard", lambda: (login(page, EMPLEADO), abrir_panel(page, "/empleado"),
                                              snap(page, "30-empleado-dashboard", wait=2800)))
        run("31-empleado-ventas", lambda: (tab(page, "Ventas"),
                                           snap(page, "31-empleado-ventas", wait=2400)))
        run("32-empleado-pqr", lambda: (tab(page, "PQR"),
                                        snap(page, "32-empleado-pqr", wait=2400)))

        # ───────────── Sesion CLIENTE ─────────────
        print("== Cliente ==")
        run("40-cliente-dashboard", lambda: (login(page, CLIENTE), abrir_panel(page, "/cliente"),
                                             snap(page, "40-cliente-dashboard", wait=2800)))
        run("41-cliente-compras", lambda: (tab(page, "Mis compras"),
                                           snap(page, "41-cliente-compras", wait=2200)))
        run("42-cliente-facturas", lambda: (tab(page, "Mis facturas"),
                                            snap(page, "42-cliente-facturas", wait=2200)))

        def cliente_pqr():
            tab(page, "PQR")
            page.locator('select').first.select_option("queja")
            page.fill('input[placeholder="Describe brevemente tu solicitud"]',
                      "Producto con falla de fábrica")
            page.fill('textarea[placeholder^="Cuéntanos con detalle"]',
                      "Compré una tarjeta grafica y presenta fallas de video a los pocos dias de uso.")
            snap(page, "43-cliente-pqr-form")
            boton(page, "Registrar solicitud").first.click()
            page.wait_for_timeout(2800)
            snap(page, "44-cliente-pqr-registrada", wait=1200)
        run("43-cliente-pqr", cliente_pqr)

        ctx.close()
        browser.close()

    with open(os.path.join(HERE, "resumen_capturas.txt"), "w", encoding="utf-8") as fh:
        fh.write("Capturas: %d | Fallidas: %d | Descargas: %d\n" % (len(taken), len(failed), len(descargas)))
        fh.write("OK: " + ", ".join(taken) + "\n")
        for nombre, err in failed:
            fh.write("FALLO %s: %s\n" % (nombre, err))
        for prefijo, ruta, peso in descargas:
            fh.write("DESCARGA %s -> %s (%d bytes)\n" % (prefijo, ruta, peso))

    print("\nCapturas: %d  |  Fallidas: %d  |  Descargas: %d" % (len(taken), len(failed), len(descargas)))
    for name, err in failed:
        print("  FALLO %s: %s" % (name, err))
    return 0 if not failed else 1


if __name__ == "__main__":
    sys.exit(main())
