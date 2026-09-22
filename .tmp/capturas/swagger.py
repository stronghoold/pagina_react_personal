"""Captura la documentacion Swagger UI de FastAPI (127.0.0.1:8000/docs).

Ejecuta una peticion real con "Try it out" y verifica el codigo de respuesta
antes de guardar la captura.
"""
import os

from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, ".tmp", "capturas", "raw")
os.makedirs(OUT, exist_ok=True)
DOCS = "http://127.0.0.1:8000/docs"
OP_ID = "#operations-Autenticaci\u00f3n-login_api_auth_login_post"


def capturar_login(page):
    page.goto(DOCS + OP_ID, wait_until="load")
    page.wait_for_selector(".swagger-ui .opblock", timeout=25000)
    page.wait_for_timeout(2500)

    op = page.locator(OP_ID).first
    if op.count() == 0:
        op = page.locator(".opblock-post").filter(has_text="Login").first
    cuerpo = op.locator(".opblock-body")
    if not cuerpo.is_visible():
        op.locator(".opblock-summary").click()
        page.wait_for_timeout(1000)

    boton = op.locator("button.try-out__btn")
    boton.wait_for(state="visible", timeout=15000)
    boton.click()
    page.wait_for_timeout(800)

    op.locator("textarea").first.fill(
        '{\n  "email": "admin@techpc.com",\n  "contrasena": "Admin123*"\n}')
    page.wait_for_timeout(500)
    op.locator("button.execute").click()

    page.wait_for_selector(".responses-table .response-col_status", timeout=20000)
    page.wait_for_timeout(2500)
    estados = op.locator(".response-col_status").all_inner_texts()
    cuerpo_txt = op.locator(".response-col_description pre").all_inner_texts()
    print("   estado(s)=", estados)
    print("   respuesta=", (cuerpo_txt[0][:120] if cuerpo_txt else "SIN CUERPO").replace("\n", " "))
    assert any("200" in e for e in estados), "no se obtuvo 200 en la respuesta"

    op.scroll_into_view_if_needed()
    page.wait_for_timeout(700)
    page.screenshot(path=os.path.join(OUT, "swagger-02-login.png"))


def main():
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={"width": 1440, "height": 860},
                            locale="es-CO", color_scheme="light")
        page = ctx.new_page()

        page.goto(DOCS, wait_until="load")
        page.wait_for_selector(".swagger-ui .opblock", timeout=25000)
        page.wait_for_timeout(2500)
        page.screenshot(path=os.path.join(OUT, "swagger-01-general.png"))
        print("  [ok] swagger-01-general")

        capturar_login(page)
        print("  [ok] swagger-02-login")

        page.goto(DOCS + OP_ID, wait_until="load")
        page.wait_for_selector(".swagger-ui .opblock", timeout=25000)
        page.wait_for_timeout(2000)
        page.evaluate("""() => {
            const el = Array.from(document.querySelectorAll('h4'))
                .find(e => e.textContent.trim().toLowerCase().includes('schemas'));
            if (el) el.scrollIntoView({block: 'start'});
        }""")
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(OUT, "swagger-03-schemas.png"))
        print("  [ok] swagger-03-schemas")

        ctx.close()
        b.close()


if __name__ == "__main__":
    main()
