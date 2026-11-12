"""Genera el logo de Juegolín: la rayuela tumbada (de izquierda a derecha, con el cielo al final)
y el nombre en Fraunces, la letra de los títulos de la app.

Uso: python3 scripts/logo.py (desde la raíz del repo)
Escribe assets/logo-simbolo.svg y assets/logo-texto.svg. Para sacar los PNG, pásalos a PNG grandes
con fondo transparente (por ejemplo con un navegador) y usa scripts/iconos.py.
"""

# Los mismos tonos que ven en la app: la paleta de la marca al 60 % sobre el papiro (theme.ts, washOpacity).
T, C, Y, G = '#B2EBDF', '#F99B8F', '#FBE892', '#C0E491'

# Casillas que encogen hacia la derecha para dar profundidad: (x, y, ancho, alto, color).
TILES = [
    (0, 19, 22, 22, T),
    (26, 5, 19, 24.5, Y), (26, 31.5, 19, 24.5, C),
    (49, 20, 17, 20, G),
    (70, 8.5, 15, 20.5, C), (70, 31, 15, 20.5, Y),
    (89, 21, 13, 18, T),
]
SKY = f'<path d="M106,15 A16,15 0 0 1 106,45 Z" fill="{G}"/>'

def symbol() -> str:
    rects = ''.join(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="3.2" fill="{c}"/>' for x, y, w, h, c in TILES)
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 5 122 51" width="122" height="51">{rects}{SKY}</svg>\n'

def wordmark() -> str:
    # en blanco: la app lo tiñe con el color de la tinta de cada estilo
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 100" width="360" height="100">'
            '<text x="0" y="72" font-family="Fraunces" font-weight="600" font-size="80" letter-spacing="-2" fill="#fff">Juegolín</text></svg>\n')

if __name__ == '__main__':
    open('assets/logo-simbolo.svg', 'w').write(symbol())
    open('assets/logo-texto.svg', 'w').write(wordmark())
