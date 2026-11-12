"""Pantalla de carga: el símbolo, «Juegolín», los dos lemas y «Cargando…», centrados sobre fondo transparente.
La app la enseña al abrirse, justo después de la imagen de arranque de Android (que solo admite el símbolo).

Uso: python3 scripts/splash.py [símbolo.png grande] [nombre.png grande] (desde la raíz del repo)
Sin argumentos usa los PNG pequeños de assets/; con los grandes (los mismos que usa scripts/iconos.py) queda más nítida.
"""
import sys
from PIL import Image, ImageDraw, ImageFont

INK, SOFT = (43, 39, 36, 255), (94, 86, 77, 255)
W = 900
symbol = Image.open(sys.argv[1] if len(sys.argv) > 1 else 'assets/logo-simbolo.png').convert('RGBA')
symbol = symbol.crop(symbol.getbbox())
symbol = symbol.resize((round(symbol.width * 150 / symbol.height), 150), Image.LANCZOS)
word = Image.open(sys.argv[2] if len(sys.argv) > 2 else 'assets/logo-texto.png').convert('RGBA')
word = word.crop(word.getbbox())
word = word.resize((round(word.width * 130 / word.height), 130), Image.LANCZOS)
ink = Image.new('RGBA', word.size, INK); ink.putalpha(word.getchannel('A')); word = ink
NUNITO = 'node_modules/@expo-google-fonts/nunito/700Bold/Nunito_700Bold.ttf'
CAVEAT = 'node_modules/@expo-google-fonts/caveat/700Bold/Caveat_700Bold.ttf'
measure = ImageDraw.Draw(Image.new('RGBA', (1, 1)))


# (renglones, letra, color, espacio encima): los lemas van partidos a mano para que queden equilibrados
blocks = [
    ('Dadle el móvil a los niños\ny que jueguen.', ImageFont.truetype(CAVEAT, 84), INK, 48),
    ('Ayuda y dinamiza el juego\npara niños y jóvenes.', ImageFont.truetype(NUNITO, 50), SOFT, 28),
    ('Cargando…', ImageFont.truetype(NUNITO, 50), SOFT, 64),
]
rows = []
for text, font, color, gap in blocks:
    for i, line in enumerate(text.split('\n')):
        rows.append((line, font, color, gap if i == 0 else 0, round(font.size * 1.15)))

H = symbol.height + 40 + word.height + sum(g + h for _, _, _, g, h in rows) + 20
out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
draw = ImageDraw.Draw(out)
y = 0
out.alpha_composite(symbol, ((W - symbol.width) // 2, y)); y += symbol.height + 40
out.alpha_composite(word, ((W - word.width) // 2, y)); y += word.height
for line, font, color, gap, h in rows:
    y += gap
    draw.text(((W - measure.textlength(line, font=font)) // 2, y), line, font=font, fill=color)
    y += h
out.save('assets/cargando.png')
print(out.size)
