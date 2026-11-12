import type { Juego } from './types';

const shared = <T>(a: readonly T[], b: readonly T[]): number => a.filter((x) => b.includes(x)).length;

/**
 * Cuánto se parecen dos juegos: misma colección, mismas habilidades y forma de jugar,
 * mismo sitio, edades parecidas y la misma energía. Cuanto más alto, más parecidos.
 */
export function similarity(a: Juego, b: Juego): number {
  if (a.id === b.id) return 0;
  let s = 0;
  s += 3 * shared(a.colecciones, b.colecciones);
  s += 2 * shared(a.habilidades, b.habilidades);
  s += 2 * shared(a.organizacion, b.organizacion);
  s += 1.5 * shared(a.destrezas, b.destrezas);
  s += shared(a.entorno, b.entorno);
  s += shared(a.edades, b.edades);
  s += shared(a.grupo, b.grupo);
  if (a.intensidad === b.intensidad) s += 2;
  if (a.seccion === b.seccion) s += 1.5;
  if (a.duracion === b.duracion) s += 1;
  if (a.ruido === b.ruido) s += 0.5;
  const realA = a.materiales.filter((m) => m !== 'ninguno');
  const realB = b.materiales.filter((m) => m !== 'ninguno');
  s += realA.length === 0 && realB.length === 0 ? 1 : 1.5 * shared(realA, realB);
  return s;
}

/** Desempate estable: siempre el mismo orden para el mismo juego, sin depender del orden del catálogo. */
const byScore = (a: { game: Juego; score: number }, b: { game: Juego; score: number }) => b.score - a.score || a.game.nombre.localeCompare(b.game.nombre, 'es');

/** Juegos parecidos a uno: para la ficha («Si os ha gustado…»). Primero los que aún no habéis jugado. */
export function similarTo(game: Juego, games: readonly Juego[], played: ReadonlySet<string> = new Set(), n = 4): Juego[] {
  return games
    .filter((g) => g.id !== game.id)
    .map((g) => ({ game: g, score: similarity(game, g) - (played.has(g.id) ? 4 : 0) }))
    .sort(byScore)
    .slice(0, n)
    .map((x) => x.game);
}

/**
 * Recomendaciones para la pantalla principal: juegos sin jugar que se parecen a los últimos que habéis jugado.
 * Los más recientes pesan más. `recent` va del más nuevo al más viejo.
 */
export function recommendFrom(recent: readonly Juego[], games: readonly Juego[], played: ReadonlySet<string>, n = 8): Juego[] {
  const base = recent.slice(0, 6);
  if (base.length === 0) return [];
  return games
    .filter((g) => !played.has(g.id))
    .map((g) => ({ game: g, score: base.reduce((sum, r, i) => sum + similarity(r, g) / (1 + i * 0.35), 0) }))
    .sort(byScore)
    .slice(0, n)
    .map((x) => x.game);
}
