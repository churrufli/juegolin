"""Saca el icono, el icono adaptable, la imagen de arranque y el símbolo de la cabecera del logo.

Uso: python3 scripts/iconos.py <símbolo.png> (desde la raíz del repo)
<símbolo.png> es assets/logo-simbolo.svg pasado a PNG grande con fondo transparente
(por ejemplo, 2048 px de ancho con un navegador). El símbolo es apaisado: se encaja en un cuadrado.
"""
import sys
from PIL import Image

PAPIRO = (245, 237, 219, 255)
src = Image.open(sys.argv[1]).convert('RGBA')
src = src.crop(src.getbbox())

def fit(h):
    return src.resize((round(src.width * h / src.height), h), Image.LANCZOS)

def fit_box(side):
    k = side / max(src.width, src.height)
    return src.resize((round(src.width * k), round(src.height * k)), Image.LANCZOS)

def place(size, frac, bg, path, mono=False):
    m = fit_box(int(size * frac))
    if mono:
        a = m.getchannel('A'); m = Image.new('RGBA', m.size, (255, 255, 255, 0)); m.putalpha(a)
    c = Image.new('RGBA', (size, size), bg)
    c.alpha_composite(m, ((size - m.width) // 2, (size - m.height) // 2))
    c.save(path)

A = 'assets/'
place(1024, 0.72, PAPIRO, A + 'icon.png')
# el icono adaptable recorta el tercio exterior: el símbolo cabe en la zona segura central
place(1024, 0.6, (0, 0, 0, 0), A + 'android-icon-foreground.png')
place(1024, 0.6, (0, 0, 0, 0), A + 'android-icon-monochrome.png', mono=True)
place(512, 0.8, (0, 0, 0, 0), A + 'splash-icon.png')
fit(120).save(A + 'logo-simbolo.png')
