import { fitsPlayers } from './filters';
import type { Juego } from './types';

/** Asistente «¿A qué jugamos?»: unas pocas preguntas y propone los juegos que mejor encajan. */
export interface Answers {
  readonly players?: number;
  readonly where?: 'fuera' | 'dentro' | 'coche';
  readonly age?: '3-5' | '6-8' | '9-12' | 'mezcla';
  readonly energy?: 'correr' | 'tranquilo';
  readonly material?: 'nada' | 'algo';
  readonly time?: 'poco' | 'rato' | 'mucho';
}

export interface Choice<K extends keyof Answers> {
  readonly value: NonNullable<Answers[K]>;
  readonly label: string;
  readonly hint?: string;
}

export interface Question<K extends keyof Answers = keyof Answers> {
  readonly key: K;
  readonly title: string;
  readonly choices: readonly Choice<K>[];
}

export const QUESTIONS: readonly Question[] = [
  {
    key: 'players',
    title: '¿Cuántos vais a jugar?',
    choices: [
      { value: 2, label: '1 o 2' },
      { value: 4, label: '3 a 5' },
      { value: 8, label: '6 a 10' },
      { value: 15, label: 'Más de 10' },
    ],
  },
  {
    key: 'where',
    title: '¿Dónde estáis?',
    choices: [
      { value: 'fuera', label: 'Fuera', hint: 'Patio, parque, campo' },
      { value: 'dentro', label: 'Dentro', hint: 'Casa, aula' },
      { value: 'coche', label: 'De viaje', hint: 'En el coche' },
    ],
  },
  {
    key: 'age',
    title: '¿Qué edad tienen los peques?',
    choices: [
      { value: '3-5', label: '3 a 5 años' },
      { value: '6-8', label: '6 a 8 años' },
      { value: '9-12', label: '9 a 12 años' },
      { value: 'mezcla', label: 'Edades mezcladas' },
    ],
  },
  {
    key: 'energy',
    title: '¿Con cuánta energía?',
    choices: [
      { value: 'correr', label: 'Con ganas de correr' },
      { value: 'tranquilo', label: 'Algo tranquilo' },
    ],
  },
  {
    key: 'material',
    title: '¿Tenéis algo a mano?',
    choices: [
      { value: 'nada', label: 'Nada', hint: 'Solo nosotros' },
      { value: 'algo', label: 'Algo', hint: 'Pelota, tiza, papel…' },
    ],
  },
  {
    key: 'time',
    title: '¿Cuánto tiempo tenéis?',
    choices: [
      { value: 'poco', label: 'Un ratito', hint: 'Menos de 5 min' },
      { value: 'rato', label: 'Un rato', hint: '5 a 15 min' },
      { value: 'mucho', label: 'Toda la tarde' },
    ],
  },
];

/** Puntos de un juego para unas respuestas. Lo que no encaja de verdad (jugadores, coche) lo descarta. */
export function fitScore(g: Juego, a: Answers): number | null {
  const travel = g.colecciones.includes('viaje-coche');
  if (a.players !== undefined && !fitsPlayers(g, a.players)) return null;
  if (a.where === 'coche' && !travel) return null;
  let s = 0;
  if (a.where === 'fuera') s += g.entorno.includes('exterior') ? 3 : -3;
  if (a.where === 'dentro') s += g.entorno.includes('interior') ? 3 : -3;
  if (a.where && a.where !== 'coche' && travel && !g.entorno.includes(a.where === 'fuera' ? 'exterior' : 'interior')) return null;
  if (a.age === 'mezcla') s += g.edades.includes('familia') ? 2 : 0;
  else if (a.age) s += g.edades.includes(a.age) || g.edades.includes('familia') ? 2 : -2;
  if (a.energy === 'correr') s += g.intensidad === 'alta' ? 3 : g.intensidad === 'moderada' ? 0 : -3;
  if (a.energy === 'tranquilo') s += g.intensidad === 'calma' ? 3 : g.intensidad === 'moderada' ? 1 : -3;
  if (a.material === 'nada') s += g.materiales.includes('ninguno') ? 3 : -4;
  if (a.time === 'poco') s += g.duracion === 'expres' ? 2 : g.duracion === 'media' ? 0 : -2;
  if (a.time === 'rato') s += g.duracion === 'media' ? 2 : 0;
  if (a.time === 'mucho') s += g.duracion === 'larga' ? 2 : g.duracion === 'media' ? 1 : -1;
  return s;
}

/** Los que mejor encajan, del mejor al peor. Los ya jugados pesan un poco menos para descubrir juegos nuevos. */
export function suggest(games: readonly Juego[], a: Answers, played: ReadonlySet<string> = new Set()): Juego[] {
  return games
    .map((g) => ({ g, s: fitScore(g, a) }))
    .filter((x): x is { g: Juego; s: number } => x.s !== null)
    .map((x) => ({ ...x, s: x.s - (played.has(x.g.id) ? 1 : 0) }))
    .sort((x, y) => y.s - x.s || x.g.nombre.localeCompare(y.g.nombre, 'es'))
    .map((x) => x.g);
}

/** Preguntas que tiene sentido hacer: en el coche no se pregunta por la energía ni el material. */
export const questionsFor = (a: Answers): readonly Question[] => QUESTIONS.filter((q) => !(a.where === 'coche' && (q.key === 'energy' || q.key === 'material')));
