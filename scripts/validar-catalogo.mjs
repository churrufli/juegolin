// Valida src/data/games.json contra docs/juego.schema.json, sin dependencias.
// Uso: npm run validar   (sale con error si hay algo mal; lo ejecuta la revisión automática de cada propuesta)
import { readFileSync } from 'node:fs';

const schema = JSON.parse(readFileSync(new URL('../docs/juego.schema.json', import.meta.url), 'utf8'));
const data = JSON.parse(readFileSync(new URL('../src/data/games.json', import.meta.url), 'utf8'));
const errores = [];

const tipoDe = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array' : Number.isInteger(v) ? 'integer' : typeof v);
const esTipo = (v, t) => (t === 'number' ? typeof v === 'number' : tipoDe(v) === t || (t === 'integer' && false));

function comprobar(v, s, ruta) {
  if (s.type) {
    const tipos = Array.isArray(s.type) ? s.type : [s.type];
    if (!tipos.some((t) => esTipo(v, t))) return errores.push(`${ruta}: debe ser ${tipos.join(' o ')}`);
  }
  if (s.enum && !s.enum.includes(v)) errores.push(`${ruta}: «${v}» no es un valor permitido (${s.enum.join(', ')})`);
  if (typeof v === 'string') {
    if (s.minLength && v.length < s.minLength) errores.push(`${ruta}: no puede estar vacío`);
    if (s.maxLength && v.length > s.maxLength) errores.push(`${ruta}: ${v.length} letras, máximo ${s.maxLength}`);
    if (s.pattern && !new RegExp(s.pattern).test(v)) errores.push(`${ruta}: «${v}» no cumple ${s.pattern}`);
  }
  if (typeof v === 'number' && s.minimum !== undefined && v < s.minimum) errores.push(`${ruta}: mínimo ${s.minimum}`);
  if (Array.isArray(v)) {
    if (s.minItems && v.length < s.minItems) errores.push(`${ruta}: necesita al menos ${s.minItems}`);
    if (s.uniqueItems && new Set(v.map((x) => JSON.stringify(x))).size !== v.length) errores.push(`${ruta}: hay valores repetidos`);
    if (s.items) v.forEach((x, i) => comprobar(x, s.items, `${ruta}[${i}]`));
  }
  if (tipoDe(v) === 'object') {
    for (const k of s.required ?? []) if (!(k in v)) errores.push(`${ruta}: falta «${k}»`);
    for (const k of Object.keys(v)) {
      if (s.properties?.[k]) comprobar(v[k], s.properties[k], `${ruta}.${k}`);
      else if (s.additionalProperties === false) errores.push(`${ruta}: «${k}» no existe en el esquema`);
    }
  }
}

const ids = new Set();
data.juegos.forEach((g, i) => {
  const ruta = `juegos[${i}]${g?.id ? ` (${g.id})` : ''}`;
  comprobar(g, schema, ruta);
  if (ids.has(g.id)) errores.push(`${ruta}: id repetido`);
  ids.add(g.id);
  if (g.participantes && g.participantes.max !== null && g.participantes.max < g.participantes.min) errores.push(`${ruta}: participantes máximo menor que mínimo`);
  for (const f of ['preparacion', 'comoSeJuega', 'comoSeGana']) if (!g.pasos?.[f]?.length) errores.push(`${ruta}: pasos.${f} vacío`);
  if (g.requiereAdulto && !g.seguridad) errores.push(`${ruta}: si pide adulto, explica por qué en «seguridad»`);
});
for (const id of data.destacados?.destacados ?? []) if (!ids.has(id)) errores.push(`destacados: «${id}» no existe`);

if (errores.length) {
  console.error(`✗ ${errores.length} problema(s) en el catálogo:\n` + errores.slice(0, 60).map((e) => '  - ' + e).join('\n'));
  process.exit(1);
}
console.log(`✓ Catálogo correcto: ${data.juegos.length} juegos.`);
