import type { IconName } from '../ui/icons';
import type { Juego } from './types';

/** Lo que cambia cada día en la portada: el juego del día y unas secciones temáticas al azar. */

/** «2026-10-23» en hora local: el día cambia a medianoche del móvil. */
export const dayKey = (d = new Date()): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Azar con semilla: el mismo día da siempre el mismo resultado. */
function seeded(key: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  return () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: readonly T[], rand: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export interface Theme {
  readonly id: string;
  readonly title: string;
  readonly icon: IconName;
  readonly test: (g: Juego) => boolean;
}

export const THEMES: readonly Theme[] = [
  { id: 'patio', title: 'Clásicos del patio', icon: 'chalk', test: (g) => g.colecciones.includes('clasicos-del-patio') },
  { id: 'lluvia', title: 'Para un día de lluvia', icon: 'house', test: (g) => g.entorno.includes('interior') && g.intensidad !== 'alta' },
  { id: 'mundo', title: 'Juegos del mundo', icon: 'globe', test: (g) => g.colecciones.includes('juegos-del-mundo') },
  { id: 'nada', title: 'Sin nada en las manos', icon: 'hand', test: (g) => g.materiales.includes('ninguno') },
  { id: 'coche', title: 'Para el coche', icon: 'car', test: (g) => g.colecciones.includes('viaje-coche') },
  { id: 'fiesta', title: 'Para un cumpleaños', icon: 'cake', test: (g) => g.colecciones.includes('cumpleanos-fiestas') },
  { id: 'correr', title: 'Para soltar energía', icon: 'run', test: (g) => g.intensidad === 'alta' },
  { id: 'calma', title: 'Para bajar revoluciones', icon: 'leaf', test: (g) => g.intensidad === 'calma' },
  { id: 'dos', title: 'Para jugar de dos en dos', icon: 'pair', test: (g) => g.participantes.min <= 2 && (g.participantes.max === null || g.participantes.max >= 2) },
  { id: 'rapidos', title: 'En cinco minutos', icon: 'bolt', test: (g) => g.duracion === 'expres' },
  { id: 'equipos', title: 'Por equipos', icon: 'versus', test: (g) => g.organizacion.includes('equipos') },
  { id: 'juntos', title: 'Todos a una', icon: 'heart', test: (g) => g.organizacion.includes('cooperativo') },
  { id: 'peques', title: 'Para los más peques', icon: 'age3', test: (g) => g.edades.includes('3-5') },
  { id: 'rompehielos', title: 'Para conocerse', icon: 'snow', test: (g) => g.colecciones.includes('rompehielos') },
  { id: 'campamento', title: 'De campamento', icon: 'tent', test: (g) => g.colecciones.includes('campamento') },
  { id: 'noche', title: 'Cuando se hace de noche', icon: 'moon', test: (g) => g.colecciones.includes('nocturnos') },
  { id: 'punteria', title: 'De puntería', icon: 'target', test: (g) => g.destrezas.includes('punteria') },
  { id: 'pelota', title: 'Con una pelota', icon: 'ball', test: (g) => g.materiales.includes('pelota') },
  { id: 'papel', title: 'Con papel y lápiz', icon: 'pencil', test: (g) => g.materiales.includes('papel') },
  { id: 'silencio', title: 'Sin hacer ruido', icon: 'quiet', test: (g) => g.ruido === 'silencioso' },
];

export interface DailySection {
  readonly theme: Theme;
  readonly games: readonly Juego[];
}

export interface Daily {
  readonly game: Juego;
  readonly sections: readonly DailySection[];
}

/** El juego del día y `count` secciones con `perSection` juegos cada una, todo fijo para ese día. */
export function daily(games: readonly Juego[], key = dayKey(), count = 3, perSection = 8): Daily {
  const rand = seeded(key);
  const game = games[Math.floor(rand() * games.length)]!;
  const usable = THEMES.filter((t) => games.filter(t.test).length >= 4);
  const sections = shuffled(usable, rand)
    .slice(0, count)
    .map((theme) => ({ theme, games: shuffled(games.filter((g) => theme.test(g) && g.id !== game.id), rand).slice(0, perSection) }));
  return { game, sections };
}
