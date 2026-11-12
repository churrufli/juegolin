"""Prepara las ilustraciones a tinta para la app.

Uso: python3 scripts/ilustraciones.py <carpeta del zip> assets/juegos
Blanco -> transparente, quita la marca de agua y el texto incrustado, recorta y guarda WebP de 560 px.
La app tiñe la línea con el color de tinta de cada estilo (tintColor).
"""
import sys
from PIL import Image, ImageOps
M={"red_pescadores": "red-de-pescadores", "terremoto": "jaula-pajaro-terremoto", "rayuela": "rayuela", "cortapiernas": "cortapiernas", "cinco_marias": "cinco-marias", "pies_quietos": "pies-quietos", "chapas": "chapas", "cazadores_venados": "cazadores-sabuesos-venados", "acecho": "acecho-mutuo", "captura_bandera": "ataque-bandera", "robo_bordones": "robo-bordones", "cuatro_colinas": "cuatro-colinas", "sogatira": "sogatira", "carrera_sacos": "carrera-sacos", "pelea_gallos": "pelea-gallos", "cuncuna_ciega": "cuncuna-ciega", "telefono_descompuesto": "telefono-escacharrado", "nocturno_linterna": "reo-loco", "aro_tradicional": "aro", "arrancar_patatas": "arrancar-cebollas", "balon_prisionero": "balon-prisionero", "bolos_tradicionales": "bolos", "canicas": "canicas", "hoyo_canicas": "el-gua", "carrera_caballos": "carrera-caballitos", "carrera_carretillas": "carretilla", "carrera_cuchara_huevo": "carrera-cuchara-huevo", "carrera_tres_pies": "carrera-tres-pies", "caza_furtivo": "espias-campamento", "chito_tanga": "caliche", "escondite": "escondite", "estatua": "escondite-ingles", "gallinita_ciega": "gallinita-ciega", "goma_elastica": "goma", "herradura": "herradura", "limbo": "limbo", "panuelo": "panuelo", "pelea_globos": "batalla-globos", "pisotón_sombras": "pisar-sombras", "relevos_agua": "relevos-agua", "rescate": "rescate", "saltar_comba": "saltar-comba", "silla_reina": "sillita-reina", "sillas_musicales": "sillas-musicales", "tres_en_raya_humano": "tres-en-raya-humano", "trompo": "peonza", "zapatilla_detras": "zapatilla-por-detras", "cadena": "el-latigo"}
# zonas con texto incrustado a borrar (fracciones x0,y0,x1,y1)
BLANK={'cinco_marias':[(0,0.72,1,1)],'pies_quietos':[(0,0.80,1,1)],'cuatro_colinas':[(0,0,1,0.16)]}
src_dir, out = sys.argv[1], sys.argv[2]
for src,dst in M.items():
  im=Image.open(f'{src_dir}/juego_{src}_lineart.png').convert('L')
  w,h=im.size
  im.paste(255,(int(w*0.80),int(h*0.95),w,h))
  for (a,b,c,d) in BLANK.get(src,[]): im.paste(255,(int(w*a),int(h*b),int(w*c),int(h*d)))
  al=ImageOps.invert(im).point(lambda v: 0 if v<18 else min(255,int(v*1.15)))
  al=al.crop(al.getbbox())
  o=Image.new('RGBA',al.size,(0,0,0,0)); o.putalpha(al)
  o.thumbnail((560,560),Image.LANCZOS)
  o.save(f'{out}/{dst}.webp',quality=80,method=6)
