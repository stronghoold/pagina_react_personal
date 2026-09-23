"""Capturas adicionales del quinto avance: graficos del Dashboard y Swagger UI."""
import os
import sys

from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:5173")
DOCS = "http://127.0.0.1:8000/docs"
HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "raw")
os.makedirs(RAW, exist_ok=True)

taken = []
failed = []


def run(name, fn):
    try:
        fn()
    except Exception as exc:  # noqa: BLE001
        failed.append((name, str(exc)[:220]))
        print("  [!!] %s -> %s" % (name, str(exc)[:220]))


def snap(page, name, wait=1200):
    page.wait_for_timeout(wait)
    page.screenshot(path=os.path.join(RAW, name + ".png"))
    taken.append(name)
    print("  [ok] " + name)


def login(page, correo, clave):
    page.goto(BASE + "/", wait_until="load")
    page.wait_for_timeout(600)
    page.evaluate("localStorage.clear()")
    page.goto(BASE + "/login", wait_until="load")
    page.wait_for_timeout(1300)
    page.fill('input[name="email"]', correo)
    page.fill('input[name="contrasena"]', clave)
    page.click('form button[type="submit"]')
    page.wait_for_timeout(2600)


def token_api():
    import requests
    res = requests.post("http://127.0.0.1:8000/api/auth/login",
                        json={"email": "admin@techpc.com", "contrasena": "Admin123*"}, timeout=20)
    return res.json()["token"]


def autorizar(page, token):
    page.locator("button.authorize").first.click()
    page.wait_for_timeout(1200)
    page.locator('.auth-container input[type="text"]').first.fill(token)
    page.locator('button[type="submit"].btn.authorize').first.click()
    page.wait_for_timeout(1200)
    page.locator(".modal-ux button.btn-done, .modal-ux .close").first.click()
    page.wait_for_timeout(1000)


def ejecutar(page, metodo_clase, texto, cuerpo=None):
    op = page.locator(".opblock%s" % metodo_clase).filter(has_text=texto).first
    op.locator(".opblock-summary").click()
    page.wait_for_timeout(1200)
    op.locator("button.try-out__btn").first.click()
    page.wait_for_timeout(800)
    if cuerpo:
        op.locator("textarea").first.fill(cuerpo)
        page.wait_for_timeout(500)
    op.locator("button.execute").first.click()
    page.wait_for_selector(".responses-table .response-col_status", timeout=25000)
    page.wait_for_timeout(2500)
    op.scroll_into_view_if_needed()
    page.wait_for_timeout(900)
    return op


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--force-color-profile=srgb"])
        ctx = browser.new_context(viewport={"width": 1440, "height": 860}, locale="es-CO",
                                  timezone_id="America/Bogota", color_scheme="light")
        page = ctx.new_page()

        print("== Dashboard: graficos ==")

        def graficos_admin():
            login(page, "admin@techpc.com", "Admin123*")
            page.locator('nav a[href="/admin"]').first.click()
            page.wait_for_timeout(3000)
            page.locator('h3:has-text("Tendencia de ventas")').first.scroll_into_view_if_needed()
            page.evaluate("window.scrollBy(0, -90)")
            snap(page, "04b-admin-dashboard-graficos", wait=2000)
        run("04b-admin-dashboard-graficos", graficos_admin)

        print("== Swagger ==")

        def swagger():
            token = token_api()
            page.goto(DOCS, wait_until="load")
            page.wait_for_selector(".swagger-ui .opblock", timeout=30000)
            page.wait_for_timeout(2500)
            page.evaluate("window.scrollBy(0, 620)")
            snap(page, "swagger-q5-01-general", wait=1200)

            autorizar(page, token)

            op = ejecutar(page, "-post", "/api/ventas",
                          '{\n  "cliente_id": 9,\n  "metodo_pago": "efectivo",\n'
                          '  "estado": "pendiente",\n  "descuento": 0,\n  "items": [\n'
                          '    {"tipo": "producto", "producto_id": 1, "cantidad": 1, "descuento": 0}\n'
                          '  ]\n}')
            snap(page, "swagger-q5-02-ventas", wait=800)

            op2 = ejecutar(page, "-post", "/api/chat",
                           '{\n  "mensaje": "¿Que servicios tecnicos ofrecen y cuanto cuestan?"\n}')
            snap(page, "swagger-q5-03-chat", wait=800)

            page.evaluate("""() => {
                const el = Array.from(document.querySelectorAll('h4'))
                    .find(e => e.textContent.trim().toLowerCase().includes('schemas'));
                if (el) el.scrollIntoView({block: 'start'});
            }""")
            snap(page, "swagger-q5-04-schemas", wait=1500)
        run("swagger-q5", swagger)

        ctx.close()
        browser.close()

    print("\nCapturas: %d | Fallidas: %d" % (len(taken), len(failed)))
    for n, e in failed:
        print("  FALLO %s: %s" % (n, e))
    return 0 if not failed else 1


if __name__ == "__main__":
    sys.exit(main())
