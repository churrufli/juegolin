"""Pasa los esquemas de montaje (SVG + montaje.json) a la app.

Uso: python3 scripts/montajes.py <carpeta con los SVG y montaje.json>
Escribe src/data/montajes.json (título y pasos) y src/ui/montajes.ts (los SVG como texto).
Las fuentes se cambian por las que carga la app (Nunito_400Regular, _700Bold, _800ExtraBold).
"""
import json, os, re, sys

D = sys.argv[1].rstrip('/') + '/'
steps = json.load(open(D + 'montaje.json'))
games = {g['id'] for g in json.load(open('src/data/games.json'))['juegos']}
W = {'600': 'Nunito_700Bold', '700': 'Nunito_700Bold', '800': 'Nunito_800ExtraBold'}

def font(m):
    tag = m.group(0)
    w = re.search(r'font-weight="(\d+)"', tag)
    fam = W.get(w.group(1) if w else '', 'Nunito_400Regular')
    tag = re.sub(r'\s*font-weight="\d+"', '', tag)
    tag = re.sub(r'font-family="[^"]*"', f'font-family="{fam}"', tag)
    return tag if 'font-family' in tag else tag.replace('<text', f'<text font-family="{fam}"', 1)

out, xml = {}, {}
for f in sorted(os.listdir(D)):
    gid = f[:-4]
    if not f.endswith('.svg') or gid not in games:
        continue
    s = open(D + f).read()
    s = re.sub(r'<metadata>.*?</metadata>', '', s, flags=re.S).replace(' xmlns:c2pa="http://c2pa.org/manifest"', '')
    s = re.sub(r'>\s+<', '><', re.sub(r'<text\b[^>]*>', font, s)).strip()
    xml[gid] = s
    p = steps.get(gid, [])
    t = ' '.join(p).lower()
    out[gid] = {'titulo': 'Cómo se dibuja' if 'tiza' in t or 'dibuja' in t else 'Cómo se monta', 'pasos': p}

json.dump(out, open('src/data/montajes.json', 'w'), ensure_ascii=False, indent=2)
with open('src/ui/montajes.ts', 'w') as fh:
    fh.write('// Generado con scripts/montajes.py desde los esquemas de montaje. No editar a mano.\n')
    fh.write('/** Esquemas vistos desde arriba: tinta #2B2724 y papel #FFFFFF, que se cambian por los del tema al pintarlos. */\n')
    fh.write('export const MONTAJE_SVG: Readonly<Record<string, string>> = {\n')
    for k, v in xml.items():
        fh.write(f'  {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)},\n')
    fh.write('};\n')
print(len(xml), 'esquemas')
