"""Añade las ilustraciones nuevas (un PNG por juego, nombre = id, tinta sobre blanco) y rehace el índice.

Uso: python3 scripts/ilustraciones-nuevas.py <carpeta con los PNG> [--reemplazar]
Sin --reemplazar no toca los juegos que ya tienen dibujo. Siempre reescribe src/ui/illustrations.ts.
"""
import json, os, sys
from PIL import Image, ImageOps

src = sys.argv[1].rstrip('/')
replace = '--reemplazar' in sys.argv
out = 'assets/juegos'
games = {g['id'] for g in json.load(open('src/data/games.json'))['juegos']}
have = {f[:-5] for f in os.listdir(out) if f.endswith('.webp')}
added = 0
for f in sorted(os.listdir(src)):
    gid = f[:-4]
    if not f.endswith('.png') or gid not in games or (gid in have and not replace):
        continue
    im = Image.open(f'{src}/{f}').convert('L')
    al = ImageOps.invert(im).point(lambda v: 0 if v < 18 else min(255, int(v * 1.15)))
    al = al.crop(al.getbbox())
    o = Image.new('RGBA', al.size, (0, 0, 0, 0)); o.putalpha(al)
    o.thumbnail((560, 560), Image.LANCZOS)
    o.save(f'{out}/{gid}.webp', quality=80, method=4)
    added += 1

ids = sorted(f[:-5] for f in os.listdir(out) if f.endswith('.webp') and f[:-5] in games)
with open('src/ui/illustrations.ts', 'w') as fh:
    fh.write("import type { ImageSourcePropType } from 'react-native';\n\n")
    fh.write('/** Ilustraciones a tinta (fondo transparente, se tiñen con el color de tinta del estilo). Generadas con scripts/ilustraciones.py e ilustraciones-nuevas.py. */\n')
    fh.write('export const ILLUSTRATIONS: Readonly<Record<string, ImageSourcePropType>> = {\n')
    for i in ids:
        fh.write(f"  '{i}': require('../../assets/juegos/{i}.webp'),\n")
    fh.write('};\n')
print(f'{added} nuevas, {len(ids)} de {len(games)} juegos con dibujo')
