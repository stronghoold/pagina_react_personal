"""Marcos estilo Windows 11 para las evidencias del checklist.

Todas las ventanas miden 1440x944 y se colocan sobre un escritorio con la
barra de tareas de Windows, igual que las capturas del navegador.
"""
import math
import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont

CANVAS_W, CANVAS_H = 1520, 1030
WIN_W, WIN_H = 1440, 944
MARGIN_X, MARGIN_TOP = 40, 30
TASKBAR_H = 48
TASKBAR_TOP = MARGIN_TOP + WIN_H + 8

FONTS = "C:/Windows/Fonts"
WIN_BLUE = (0, 120, 212)
ICON = (95, 99, 104)
CAPTION_DARK = (26, 26, 26)
CAPTION_LIGHT = (204, 204, 204)
TASKBAR_BG = (243, 243, 243)
TASKBAR_LINE = (229, 229, 229)


def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), size)


MONO = lambda s: font("consola.ttf", s)
UI = lambda s: font("segoeui.ttf", s)
UI_B = lambda s: font("segoeuib.ttf", s)


# ───────────────────────── helpers de ventana ─────────────────────────

def _min(d, cx, cy, color):
    d.line([(cx - 5, cy), (cx + 5, cy)], fill=color, width=1)


def _max(d, cx, cy, color):
    d.rectangle([cx - 5, cy - 5, cx + 5, cy + 5], outline=color, width=1)


def _close(d, cx, cy, color):
    d.line([(cx - 5, cy - 5), (cx + 5, cy + 5)], fill=color, width=1)
    d.line([(cx - 5, cy + 5), (cx + 5, cy - 5)], fill=color, width=1)


def botones_ventana(d, cy, color, cerrar_rojo=False, alto=36):
    """Botones minimizar / maximizar / cerrar alineados a la derecha."""
    ancho = 46
    x = WIN_W - ancho * 3
    if cerrar_rojo:
        d.rectangle([x + ancho * 2, 0, WIN_W, alto], fill=(196, 43, 28))
        color_final = (255, 255, 255)
    else:
        color_final = color
    _min(d, x + ancho // 2, cy, color)
    _max(d, x + ancho + ancho // 2, cy, color)
    _close(d, x + ancho * 2 + ancho // 2, cy, color_final)


def _escritorio():
    img = Image.new("RGB", (CANVAS_W, CANVAS_H))
    top, bot = (12, 60, 140), (6, 26, 66)
    for y in range(CANVAS_H):
        t = y / CANVAS_H
        img.paste(tuple(int(top[i] + (bot[i] - top[i]) * t) for i in range(3)),
                  (0, y, CANVAS_W, y + 1))
    return img


def _logo_windows(d, cx, cy, size=18, color=WIN_BLUE):
    half, gap = size // 2, 2
    for dx in (-half, gap):
        for dy in (-half, gap):
            d.rectangle([cx + dx, cy + dy, cx + dx + half - gap, cy + dy + half - gap],
                        fill=color)


def _lupa(d, cx, cy, color=ICON):
    d.ellipse([cx - 7, cy - 7, cx + 3, cy + 3], outline=color, width=2)
    d.line([(cx + 2, cy + 2), (cx + 8, cy + 8)], fill=color, width=2)


def _taskview(d, cx, cy, color=ICON):
    d.rounded_rectangle([cx - 9, cy - 6, cx - 1, cy + 6], radius=2, outline=color, width=1)
    d.rounded_rectangle([cx + 1, cy - 6, cx + 9, cy + 6], radius=2, outline=color, width=1)


def _chrome(d, cx, cy, r=9):
    d.pieslice([cx - r, cy - r, cx + r, cy + r], 200, 320, fill=(234, 67, 53))
    d.pieslice([cx - r, cy - r, cx + r, cy + r], 320, 90, fill=(251, 188, 5))
    d.pieslice([cx - r, cy - r, cx + r, cy + r], 90, 200, fill=(52, 168, 83))
    d.ellipse([cx - r * .45, cy - r * .45, cx + r * .45, cy + r * .45], fill=(66, 133, 244))
    d.ellipse([cx - r * .45, cy - r * .45, cx + r * .45, cy + r * .45],
              outline=(255, 255, 255), width=1)


def _carpeta(d, cx, cy, color=(255, 185, 0)):
    d.rounded_rectangle([cx - 9, cy - 5, cx + 9, cy + 7], radius=2, fill=color)
    d.rounded_rectangle([cx - 9, cy - 8, cx + 1, cy - 2], radius=2, fill=(247, 210, 100))


def _barra_tareas(canvas):
    d = ImageDraw.Draw(canvas)
    d.rectangle([0, TASKBAR_TOP, CANVAS_W, TASKBAR_TOP + TASKBAR_H], fill=TASKBAR_BG)
    d.line([(0, TASKBAR_TOP), (CANVAS_W, TASKBAR_TOP)], fill=TASKBAR_LINE, width=1)
    cy = TASKBAR_TOP + TASKBAR_H // 2
    x = CANVAS_W // 2 - 150
    for fn in (_logo_windows, _lupa, _taskview):
        fn(d, x, cy)
        x += 46
    _chrome(d, x, cy)
    x += 46
    _carpeta(d, x, cy)
    x += 46
    d.rounded_rectangle([x - 9, cy - 9, x + 9, cy + 9], radius=2, fill=(0, 122, 204))
    d.text((x, cy), "<>", font=UI_B(11), fill=(255, 255, 255), anchor="mm")
    d.text((CANVAS_W - 24, cy), "3:45 p. m.\n11/09/2026", font=UI(12),
           fill=(26, 26, 26), anchor="rm", align="right", spacing=2)


def montar_ventana(window, out):
    """Coloca una ventana de 1440x944 sobre el escritorio con barra de tareas."""
    canvas = _escritorio().convert("RGBA")

    sombra = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    ImageDraw.Draw(sombra).rounded_rectangle(
        [MARGIN_X - 2, MARGIN_TOP + 4, MARGIN_X + WIN_W + 2, MARGIN_TOP + WIN_H + 10],
        radius=10, fill=(0, 0, 0, 110))
    canvas = Image.alpha_composite(canvas, sombra.filter(ImageFilter.GaussianBlur(10)))

    win = window.convert("RGBA").copy()
    mascara = Image.new("L", (WIN_W, WIN_H), 0)
    ImageDraw.Draw(mascara).rounded_rectangle([0, 0, WIN_W - 1, WIN_H - 1], radius=10, fill=255)
    win.putalpha(mascara)
    canvas.alpha_composite(win, (MARGIN_X, MARGIN_TOP))
    ImageDraw.Draw(canvas).rounded_rectangle(
        [MARGIN_X, MARGIN_TOP, MARGIN_X + WIN_W - 1, MARGIN_TOP + WIN_H - 1],
        radius=10, outline=(210, 214, 219), width=1)

    _barra_tareas(canvas)
    canvas.convert("RGB").save(out, "PNG")


# ───────────────────────── resaltado de sintaxis ─────────────────────────

PY_KW = {
    "import", "from", "def", "class", "return", "if", "else", "elif", "for", "in",
    "not", "is", "None", "True", "False", "raise", "try", "except", "finally",
    "with", "as", "lambda", "pass", "and", "or", "while", "yield", "global",
    "async", "await", "del", "assert", "break", "continue",
}
SQL_KW = {
    "CREATE", "DATABASE", "TABLE", "IF", "NOT", "EXISTS", "USE", "INT", "VARCHAR",
    "TEXT", "DECIMAL", "ENUM", "TIMESTAMP", "PRIMARY", "KEY", "AUTO_INCREMENT",
    "UNIQUE", "DEFAULT", "NULL", "CURRENT_TIMESTAMP", "FOREIGN", "REFERENCES",
    "INSERT", "INTO", "VALUES", "SELECT", "FROM", "WHERE", "AND", "OR", "ON",
    "CASCADE", "ORDER", "BY", "CONCAT", "LEFT",
}
C_COMMENT = (106, 153, 85)
C_STRING = (206, 145, 120)
C_KEYWORD = (86, 156, 214)
C_NUMBER = (181, 206, 168)
C_FUNC = (220, 220, 170)
C_CLASS = (78, 201, 176)
C_TEXT = (212, 212, 212)
C_SQL_KW = (86, 156, 214)


def _tokens_python(linea):
    import re
    patron = re.compile(
        r'(#[^\n]*)'
        r'|("""|\'\'\')'
        r'|("(?:[^"\\]|\\.)*"|\'(?:[^\'\\]|\\.)*\')'
        r'|(@[\w\.]+)'
        r'|(\b\d+(?:\.\d+)?\b)'
        r'|(\b(?:' + "|".join(sorted(PY_KW, key=len, reverse=True)) + r')\b)'
        r'|([A-Za-z_]\w*)'
        r'|(\s+)'
        r'|(.)')
    for m in patron.finditer(linea):
        if m.group(1):
            yield m.group(1), C_COMMENT
        elif m.group(2):
            yield m.group(2), C_STRING
        elif m.group(3):
            yield m.group(3), C_STRING
        elif m.group(4):
            yield m.group(4), C_FUNC
        elif m.group(5):
            yield m.group(5), C_NUMBER
        elif m.group(6):
            yield m.group(6), C_KEYWORD
        elif m.group(7):
            yield m.group(7), C_TEXT
        else:
            yield m.group(0), C_TEXT


def _tokens_sql(linea):
    import re
    patron = re.compile(
        r'(--[^\n]*)'
        r'|(\'(?:[^\']|\'\')*\')'
        r'|(\b\d+\b)'
        r'|(\b[A-Za-z_]+\b)'
        r'|(\s+)'
        r'|(.)')
    for m in patron.finditer(linea):
        if m.group(1):
            yield m.group(1), C_COMMENT
        elif m.group(2):
            yield m.group(2), C_STRING
        elif m.group(3):
            yield m.group(3), C_NUMBER
        elif m.group(4):
            w = m.group(4)
            yield w, (C_SQL_KW if w.upper() in SQL_KW else C_TEXT)
        else:
            yield m.group(0), C_TEXT


def _tokens_env(linea):
    import re
    if linea.strip().startswith("#"):
        yield linea, C_COMMENT
        return
    m = re.match(r'^([A-Za-z_][\w]*)(=)(.*)$', linea)
    if m:
        yield m.group(1), (156, 220, 254)
        yield m.group(2), C_TEXT
        yield m.group(3), C_STRING
    else:
        yield linea, C_TEXT


def _tokens_plain(linea):
    if linea.strip().startswith("#"):
        yield linea, C_COMMENT
    else:
        yield linea, C_TEXT


TOKENIZADORES = {
    "python": _tokens_python,
    "sql": _tokens_sql,
    "env": _tokens_env,
    "text": _tokens_plain,
}


def _corte(texto, fuente, espacio):
    """Cuantos caracteres de `texto` caben en `espacio` pixeles."""
    if espacio <= 1:
        return 0
    if fuente.getlength(texto) <= espacio:
        return len(texto)
    bajo, alto = 0, len(texto)
    while bajo < alto:
        medio = (bajo + alto + 1) // 2
        if fuente.getlength(texto[:medio]) <= espacio:
            bajo = medio
        else:
            alto = medio - 1
    return bajo


def dibujar_codigo(d, x, y, lineas, lang, ancho_max, alto_linea=None, tam=14,
                   color_num=(133, 133, 133)):
    """Dibuja codigo con numeros de linea, resaltado basico y ajuste de linea.

    Las lineas que no caben se parten en varias filas (como el ajuste de linea
    de VS Code) para no perder contenido.
    """
    fuente = MONO(tam)
    if alto_linea is None:
        alto_linea = tam + 5
    tok = TOKENIZADORES.get(lang, _tokens_plain)
    num_ancho = 48
    limite = ancho_max
    max_y = WIN_H - 30
    yy = y
    for i, linea in enumerate(lineas):
        if yy > max_y:
            break
        d.text((x + num_ancho - 8, yy), str(i + 1), font=MONO(12),
               fill=color_num, anchor="ra")
        cx = x + num_ancho
        for texto, color in tok(linea):
            while texto:
                espacio = limite - cx
                if espacio <= 5:
                    yy += alto_linea
                    if yy > max_y:
                        return
                    cx = x + num_ancho
                    espacio = limite - cx
                corte = _corte(texto, fuente, espacio)
                if corte == 0:
                    corte = 1
                parte = texto[:corte]
                if parte.strip():
                    d.text((cx, yy), parte, font=fuente, fill=color)
                cx += fuente.getlength(parte)
                texto = texto[corte:]
        yy += alto_linea


# ───────────────────────── ventana Chrome ─────────────────────────

TAB_TITLE = "TechPC | Componentes de Computador"
FRAME_BG = (222, 225, 230)
ADDRESS_BG = (241, 243, 244)


def _chevron(d, cx, cy, direccion, color, size=6, width=2):
    if direccion == "left":
        d.line([(cx + size * .5, cy - size), (cx - size * .5, cy), (cx + size * .5, cy + size)],
               fill=color, width=width, joint="curve")
    else:
        d.line([(cx - size * .5, cy - size), (cx + size * .5, cy), (cx - size * .5, cy + size)],
               fill=color, width=width, joint="curve")


def _recargar(d, cx, cy, color, r=7, width=2):
    d.arc([cx - r, cy - r, cx + r, cy + r], start=35, end=320, fill=color, width=width)
    d.polygon([(cx + 1, cy - r - 3), (cx + 8, cy - r + 1), (cx + 1, cy - r + 5)], fill=color)


def _candado(d, cx, cy, color):
    d.rounded_rectangle([cx - 5, cy - 1, cx + 5, cy + 7], radius=2, outline=color, width=1)
    d.arc([cx - 3, cy - 8, cx + 3, cy - 1], start=180, end=360, fill=color, width=1)


def _estrella(d, cx, cy, color, r=7, width=1):
    pts = []
    for i in range(10):
        ang = -math.pi / 2 + i * math.pi / 5
        rad = r if i % 2 == 0 else r * 0.45
        pts.append((cx + rad * math.cos(ang), cy + rad * math.sin(ang)))
    d.polygon(pts, outline=color, width=width)


def ventana_chrome(contenido, url, out, host="localhost:5173"):
    """Enmarca una captura de pagina (1440x860) en una ventana de Chrome."""
    TAB_H, TOOL_H = 40, 44
    win = Image.new("RGB", (WIN_W, WIN_H), (255, 255, 255))
    d = ImageDraw.Draw(win)

    d.rectangle([0, 0, WIN_W, TAB_H], fill=FRAME_BG)
    tx0, tx1 = 10, 250
    d.rounded_rectangle([tx0, 6, tx1, TAB_H + 2], radius=8, fill=(255, 255, 255))
    d.rectangle([tx0 + 6, TAB_H - 4, tx1 - 6, TAB_H + 2], fill=(255, 255, 255))
    d.rounded_rectangle([tx0 + 12, 14, tx0 + 28, 30], radius=4, fill=(37, 99, 235))
    d.text((tx0 + 20, 22), "T", font=UI_B(11), fill=(255, 255, 255), anchor="mm")
    d.text((tx0 + 36, 22), TAB_TITLE, font=UI(13), fill=(60, 64, 67), anchor="lm")
    d.line([(tx1 + 26, 20), (tx1 + 34, 20)], fill=ICON, width=1)
    d.line([(tx1 + 30, 16), (tx1 + 30, 24)], fill=ICON, width=1)
    botones_ventana(d, TAB_H // 2, CAPTION_DARK, cerrar_rojo=True, alto=TAB_H)

    d.rectangle([0, TAB_H, WIN_W, TAB_H + TOOL_H], fill=(255, 255, 255))
    d.line([(0, TAB_H + TOOL_H), (WIN_W, TAB_H + TOOL_H)], fill=(235, 235, 235), width=1)
    mid = TAB_H + TOOL_H // 2
    _chevron(d, 30, mid, "left", ICON)
    _chevron(d, 68, mid, "right", (190, 194, 199))
    _recargar(d, 106, mid, ICON)
    ad0, ad1 = 140, WIN_W - 96
    d.rounded_rectangle([ad0, mid - 15, ad1, mid + 15], radius=15, fill=ADDRESS_BG)
    _candado(d, ad0 + 20, mid - 1, ICON)
    d.text((ad0 + 34, mid), host + url, font=UI(13), fill=(32, 33, 36), anchor="lm")
    _estrella(d, ad1 + 30, mid, ICON)

    win.paste(contenido.convert("RGB").resize((1440, 860)), (0, TAB_H + TOOL_H))
    montar_ventana(win, out)


# ───────────────────────── ventana VS Code ─────────────────────────

VS_BG = (30, 30, 30)
VS_SIDEBAR = (37, 37, 38)
VS_ACTIVITY = (51, 51, 51)
VS_TAB_BAR = (37, 37, 38)
VS_STATUS = (0, 122, 204)
VS_LINE = (45, 45, 45)


def _icono_archivo(d, x, y, nombre):
    if nombre.endswith(".py"):
        d.rounded_rectangle([x, y + 1, x + 11, y + 13], radius=2, fill=(52, 120, 246))
        d.text((x + 5.5, y + 7), "P", font=UI_B(8), fill=(255, 255, 255), anchor="mm")
    elif nombre.endswith(".sql"):
        d.rounded_rectangle([x, y + 1, x + 11, y + 13], radius=2, fill=(224, 171, 60))
        d.text((x + 5.5, y + 7), "S", font=UI_B(8), fill=(60, 50, 20), anchor="mm")
    elif nombre.startswith(".env"):
        d.rounded_rectangle([x, y + 1, x + 11, y + 13], radius=2, fill=(140, 140, 140))
        d.text((x + 5.5, y + 7), "#", font=UI_B(8), fill=(255, 255, 255), anchor="mm")
    elif nombre.endswith(".json"):
        d.rounded_rectangle([x, y + 1, x + 11, y + 13], radius=2, fill=(203, 165, 60))
    else:
        d.rounded_rectangle([x, y + 1, x + 11, y + 13], radius=2, fill=(110, 118, 129))


def ventana_vscode(arbol, tabs, out, titulo="pagina_react_personal - Visual Studio Code"):
    """arbol: lista de (nivel, nombre, es_carpeta, abierto)
    tabs : lista de (nombre, contenido, lenguaje)"""
    win = Image.new("RGB", (WIN_W, WIN_H), VS_BG)
    d = ImageDraw.Draw(win)

    # barra de titulo
    d.rectangle([0, 0, WIN_W, 36], fill=(45, 45, 45))
    d.rounded_rectangle([14, 9, 36, 27], radius=4, fill=(0, 122, 204))
    d.text((25, 18), "VS", font=UI_B(9), fill=(255, 255, 255), anchor="mm")
    d.text((46, 18), titulo, font=UI(12), fill=(200, 200, 200), anchor="lm")
    botones_ventana(d, 18, CAPTION_LIGHT, cerrar_rojo=True)

    # barra de actividad
    d.rectangle([0, 36, 48, WIN_H], fill=VS_ACTIVITY)
    for i, glifo in enumerate(("≣", "⌕", "⑂", "▷", "⚙")):
        d.text((24, 60 + i * 44), glifo, font=UI(17), fill=(200, 200, 200), anchor="mm")
    d.rectangle([0, 36, 2, WIN_H], fill=(0, 122, 204))

    # explorador
    d.rectangle([48, 36, 308, WIN_H], fill=VS_SIDEBAR)
    d.text((62, 50), "EXPLORADOR", font=UI(11), fill=(187, 187, 187), anchor="lm")
    y = 74
    for nivel, nombre, es_carpeta, abierto in arbol:
        x = 60 + nivel * 14
        if es_carpeta:
            d.polygon([(x, y + 4), (x + 5, y + 8), (x, y + 12)],
                      fill=(204, 204, 204) if not abierto else (150, 150, 150))
            d.rounded_rectangle([x + 9, y + 2, x + 23, y + 14], radius=2, fill=(220, 190, 90))
            d.text((x + 29, y + 8), nombre, font=UI(12), fill=(204, 204, 204), anchor="lm")
        else:
            _icono_archivo(d, x + 9, y + 2, nombre)
            d.text((x + 26, y + 8), nombre, font=UI(12), fill=(204, 204, 204), anchor="lm")
        y += 24
        if y > WIN_H - 40:
            break

    # pestaña / pestañas del editor
    ed_x0 = 308
    d.rectangle([ed_x0, 36, WIN_W, 71], fill=VS_TAB_BAR)
    n = len(tabs)
    ancho_tab = (WIN_W - ed_x0) // max(n, 1)
    for i, (nombre, _contenido, _lang) in enumerate(tabs):
        x0 = ed_x0 + i * ancho_tab
        activo = i == 0
        if activo:
            d.rectangle([x0, 36, x0 + ancho_tab - 1, 71], fill=VS_BG)
            d.rectangle([x0, 36, x0 + ancho_tab - 1, 38], fill=(0, 122, 204))
        _icono_archivo(d, x0 + 12, 47, nombre)
        d.text((x0 + 30, 54), nombre, font=UI(12),
               fill=(255, 255, 255) if activo else (150, 150, 150), anchor="lm")

    # editores
    tam = 14 if len(tabs) == 1 else 12
    for i, (_nombre, contenido, lang) in enumerate(tabs):
        x0 = ed_x0 + i * ancho_tab
        if i > 0:
            d.line([(x0, 71), (x0, WIN_H - 22)], fill=(60, 60, 60), width=1)
        x_ed = x0 + 6
        lineas = contenido.splitlines()
        if i == 0:
            # migas de pan del archivo abierto
            d.text((x_ed + 4, 82), "  " + os.path.basename(_nombre) + "  >", font=UI(11),
                   fill=(150, 150, 150))
            dibujar_codigo(d, x_ed, 102, lineas, lang, x0 + ancho_tab - 16, tam=tam)
        else:
            dibujar_codigo(d, x_ed, 82, lineas, lang, x0 + ancho_tab - 16, tam=tam)

    # barra de estado
    d.rectangle([0, WIN_H - 22, WIN_W, WIN_H], fill=VS_STATUS)
    d.text((14, WIN_H - 11), "⑂ main*", font=UI(11), fill=(255, 255, 255), anchor="lm")
    d.text((WIN_W - 14, WIN_H - 11), "Python 3.14   UTF-8   LF   Espacios: 4",
           font=UI(11), fill=(255, 255, 255), anchor="rm")

    montar_ventana(win, out)


# ───────────────────────── ventana Terminal ─────────────────────────

TERM_BG = (12, 12, 12)
TERM_BAR = (32, 32, 32)


def ventana_terminal(titulo, bloques, out):
    """bloques: lista de (prompt, comando, [lineas de salida], color_salida)"""
    win = Image.new("RGB", (WIN_W, WIN_H), TERM_BG)
    d = ImageDraw.Draw(win)

    d.rectangle([0, 0, WIN_W, 36], fill=TERM_BAR)
    d.rounded_rectangle([14, 9, 34, 27], radius=4, fill=(0, 120, 212))
    d.text((24, 18), ">_", font=MONO(9), fill=(255, 255, 255), anchor="mm")
    d.text((46, 18), titulo, font=UI(12), fill=(204, 204, 204), anchor="lm")
    botones_ventana(d, 18, CAPTION_LIGHT, cerrar_rojo=True)

    fuente = MONO(15)
    y = 52
    for prompt, comando, salida, color_salida in bloques:
        if prompt:
            d.text((20, y), prompt, font=fuente, fill=(86, 156, 214))
            px = 20 + d.textlength(prompt, font=fuente)
        else:
            px = 20
        if comando:
            d.text((px, y), comando, font=fuente, fill=(255, 255, 255))
            px += d.textlength(comando, font=fuente)
        y += 22
        for linea in salida:
            if y > WIN_H - 26:
                break
            color = color_salida
            if linea.startswith("  [OK]") or "True" in linea and len(linea) < 8:
                color = (135, 206, 135)
            d.text((20, y), linea, font=fuente, fill=color)
            y += 20
        y += 6
    # cursor
    d.rectangle([20, y, 30, y + 16], fill=(204, 204, 204))

    montar_ventana(win, out)


# ───────────────────────── ventana Postman ─────────────────────────

PM_BG = (255, 255, 255)
PM_SIDEBAR = (247, 248, 250)
PM_BORDER = (225, 228, 232)
PM_TEXT = (33, 37, 41)
PM_MUTED = (108, 117, 125)
M_METHOD = {
    "GET": (107, 189, 91), "POST": (244, 166, 42), "PUT": (61, 126, 229),
    "PATCH": (155, 89, 182), "DELETE": (224, 79, 95), "HEAD": (144, 164, 174),
    "OPTIONS": (144, 164, 174),
}


def _badge(d, x, y, metodo, escala=1.0):
    color = M_METHOD.get(metodo, (144, 164, 174))
    ancho = int(d.textlength(metodo, font=UI_B(int(10 * escala)))) + 14
    alto = int(17 * escala)
    d.rounded_rectangle([x, y, x + ancho, y + alto], radius=3, fill=color)
    d.text((x + ancho / 2, y + alto / 2 + 1), metodo,
           font=UI_B(int(10 * escala)), fill=(255, 255, 255), anchor="mm")
    return ancho


def ventana_postman(coleccion, peticion, out, respuestas_extra=None):
    """coleccion: lista de (nivel, nombre, metodo|None)
    peticion: dict con metodo, url, headers, body, status, respuesta, tiempo_ms, bytes"""
    win = Image.new("RGB", (WIN_W, WIN_H), PM_BG)
    d = ImageDraw.Draw(win)

    # barra de titulo
    d.rectangle([0, 0, WIN_W, 34], fill=(44, 44, 44))
    d.ellipse([14, 9, 26, 21], fill=(255, 108, 55))
    d.text((34, 17), "Postman", font=UI_B(12), fill=(230, 230, 230), anchor="lm")
    d.text((120, 17), "TechPC API - FastAPI (Cuarto Avance)", font=UI(11),
           fill=(170, 170, 170), anchor="lm")
    botones_ventana(d, 17, (200, 200, 200), cerrar_rojo=True)

    # barra de pestañas de Postman
    d.rectangle([0, 34, WIN_W, 74], fill=(241, 241, 241))
    d.rectangle([0, 34, 300, 74], fill=(228, 228, 228))
    metodo = peticion["metodo"]
    _badge(d, 16, 45, metodo)
    d.text((72, 54), "Nueva peticion", font=UI(12), fill=PM_TEXT, anchor="lm")

    # panel lateral con la coleccion
    d.rectangle([0, 74, 330, WIN_H], fill=PM_SIDEBAR)
    d.line([(330, 74), (330, WIN_H)], fill=PM_BORDER, width=1)
    d.text((16, 92), "Colecciones", font=UI_B(12), fill=PM_TEXT, anchor="lm")
    d.text((16, 116), "TechPC API - FastAPI", font=UI_B(12), fill=PM_TEXT, anchor="lm")
    y = 138
    for nivel, nombre, met in coleccion:
        if y > WIN_H - 90:
            break
        x = 28 + nivel * 16
        if met:
            _badge(d, x, y - 2, met, escala=0.82)
            d.text((x + 46, y + 6), nombre, font=UI(11), fill=PM_TEXT, anchor="lm")
        else:
            d.polygon([(x, y + 1), (x + 5, y + 6), (x, y + 11)], fill=PM_MUTED)
            d.text((x + 11, y + 6), nombre, font=UI_B(11), fill=PM_TEXT, anchor="lm")
        y += 24

    # area de la peticion
    px0 = 348
    d.text((px0, 100), "Enviar", font=UI(12), fill=PM_MUTED, anchor="lm")
    d.rounded_rectangle([px0 + 48, 88, px0 + 138, 112], radius=4, fill=(255, 108, 55))
    d.text((px0 + 93, 100), "Send", font=UI_B(12), fill=(255, 255, 255), anchor="mm")
    d.text((px0 + 360, 100), "Guardar", font=UI(12), fill=PM_MUTED, anchor="lm")

    # barra de URL
    badge_w = _badge(d, px0, 126, metodo)
    d.rounded_rectangle([px0 + badge_w + 6, 126, WIN_W - 20, 152], radius=4,
                        outline=PM_BORDER, fill=(255, 255, 255))
    d.text((px0 + badge_w + 18, 139), peticion["url"], font=UI(12),
           fill=PM_TEXT, anchor="lm")

    # pestañas internas
    for i, t in enumerate(("Params", "Authorization", "Headers (1)", "Body", "Scripts")):
        d.text((px0 + i * 118, 172), t, font=UI(12),
               fill=PM_TEXT if t.startswith("Headers") else PM_MUTED, anchor="lm")
    d.line([(px0, 188), (WIN_W - 20, 188)], fill=PM_BORDER, width=1)
    d.line([(px0 + 236, 188), (px0 + 330, 188)], fill=(255, 108, 55), width=2)

    # encabezados de la peticion
    y = 202
    d.text((px0, y), "Headers", font=UI_B(11), fill=PM_MUTED, anchor="lm")
    y += 22
    for clave, valor in peticion["headers"].items():
        d.rounded_rectangle([px0, y, px0 + 300, y + 26], radius=4, outline=PM_BORDER)
        d.text((px0 + 10, y + 13), clave, font=UI(11), fill=PM_TEXT, anchor="lm")
        d.line([(px0 + 306, y), (px0 + 306, y + 26)], fill=PM_BORDER)
        valor_txt = valor if len(valor) < 62 else valor[:59] + "..."
        d.text((px0 + 314, y + 13), valor_txt, font=UI(11), fill=PM_TEXT, anchor="lm")
        y += 34

    # cuerpo de la peticion
    if peticion.get("body"):
        y += 6
        d.text((px0, y), "Body (raw JSON)", font=UI_B(11), fill=PM_MUTED, anchor="lm")
        y += 20
        texto = _json_lineas(peticion["body"])
        for linea in texto[:8]:
            d.text((px0, y), linea, font=MONO(12), fill=PM_TEXT)
            y += 18

    # respuesta
    y_resp = WIN_H - 330
    d.line([(px0, y_resp), (WIN_W - 20, y_resp)], fill=PM_BORDER, width=1)
    status = peticion["status"]
    color_st = (107, 189, 91) if status < 300 else (224, 79, 95)
    d.text((px0, y_resp + 16), "Respuesta", font=UI_B(11), fill=PM_MUTED, anchor="lm")
    d.text((px0, y_resp + 42), "%s %s" % (status, peticion["razon"]),
           font=UI_B(13), fill=color_st, anchor="lm")
    d.text((px0 + 110, y_resp + 42),
           "Tiempo: %s ms" % peticion["tiempo_ms"], font=UI(11), fill=PM_MUTED, anchor="lm")
    d.text((px0 + 250, y_resp + 42),
           "Tamaño: %s B" % peticion["bytes"], font=UI(11), fill=PM_MUTED, anchor="lm")
    for i, t in enumerate(("Body", "Cookies", "Headers (5)", "Test Results")):
        d.text((px0 + i * 118, y_resp + 74), t, font=UI(12),
               fill=PM_TEXT if i == 0 else PM_MUTED, anchor="lm")
    d.line([(px0, y_resp + 90), (WIN_W - 20, y_resp + 90)], fill=PM_BORDER, width=1)
    d.line([(px0, y_resp + 90), (px0 + 100, y_resp + 90)], fill=(255, 108, 55), width=2)

    y = y_resp + 102
    for segmentos in _json_segmentos(peticion["respuesta"]):
        if y > WIN_H - 12:
            break
        x = px0
        for texto, color in segmentos:
            d.text((x, y), texto, font=MONO(12), fill=color)
            x += d.textlength(texto, font=MONO(12))
        y += 18

    montar_ventana(win, out)


def _json_lineas(obj, indent=0):
    import json
    texto = json.dumps(obj, ensure_ascii=False, indent=2)
    return texto.splitlines()[:40]


JSON_KEY = (0, 92, 197)
JSON_STR = (3, 106, 7)
JSON_NUM = (9, 134, 88)
JSON_BOOL = (198, 120, 0)
JSON_PLAIN = (66, 82, 110)


def _json_segmentos(obj, max_lineas=14):
    """Divide el JSON en segmentos (texto, color) por linea."""
    import json
    import re
    patron = re.compile(
        r'("(?:[^"\\]|\\.)*")(\s*:)?'
        r'|(-?\d+(?:\.\d+)?)'
        r'|\b(true|false|null)\b')
    texto = json.dumps(obj, ensure_ascii=False, indent=2)
    salida = []
    for linea in texto.splitlines()[:max_lineas]:
        segmentos = []
        pos = 0
        for m in patron.finditer(linea):
            if m.start() > pos:
                segmentos.append((linea[pos:m.start()], JSON_PLAIN))
            if m.group(1):
                segmentos.append((m.group(1), JSON_KEY if m.group(2) else JSON_STR))
                if m.group(2):
                    segmentos.append((m.group(2), JSON_PLAIN))
            elif m.group(3):
                segmentos.append((m.group(3), JSON_NUM))
            else:
                segmentos.append((m.group(0), JSON_BOOL))
            pos = m.end()
        if pos < len(linea):
            segmentos.append((linea[pos:], JSON_PLAIN))
        salida.append(segmentos)
    return salida
