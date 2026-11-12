import type { IconName } from '../ui/icons';
import type { Juego } from './types';
import { SECTION_LABEL } from './catalog';

/** Insignias del cuaderno. Sin rachas ni caducidad: solo se suman. */

/** Una partida apuntada en el cuaderno: cuándo, quién firmó y quién ganó. */
export interface Session {
  readonly at: string;
  readonly players: readonly string[];
  readonly winners: readonly string[];
}

/** Lo que las insignias necesitan del cuaderno. */
export interface BadgeInput {
  readonly plays: Readonly<Record<string, { readonly count: number; readonly sessions?: readonly Session[] }>>;
  /** Nombre de cada jugador, para decir quién ha conseguido la insignia. */
  readonly names: Readonly<Record<string, string>>;
}

export type BadgeGroup = 'juegos' | 'colecciones' | 'partidas' | 'ganadores' | 'pandilla';

export const GROUP_LABEL: Record<BadgeGroup, string> = {
  juegos: 'Juegos distintos',
  colecciones: 'Colecciones',
  partidas: 'Partidas',
  ganadores: 'Ganadores',
  pandilla: 'Jugar juntos',
};

interface Stats {
  readonly games: readonly Juego[];
  readonly played: readonly Juego[];
  readonly sessions: readonly (Session & { readonly game: string })[];
  readonly totalPlays: number;
  readonly maxRepeats: number;
  readonly wins: ReadonlyMap<string, number>;
  readonly pairs: ReadonlyMap<string, number>;
  readonly names: Readonly<Record<string, string>>;
}

interface Progress {
  readonly done: number;
  /** Quién la ha conseguido («Lucía y Mateo»), si es de alguien. */
  readonly who?: string;
}

export interface Badge {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: IconName;
  readonly group: BadgeGroup;
  readonly target: number;
  /** Cuántos juegos de este tipo hay: el objetivo nunca pide más de los que existen. */
  readonly cap?: (games: readonly Juego[]) => number;
  readonly progress: (s: Stats) => Progress;
}

const inSet = (test: (g: Juego) => boolean) => ({
  cap: (games: readonly Juego[]) => games.filter(test).length,
  progress: (s: Stats): Progress => ({ done: s.played.filter(test).length }),
});

const pairKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);
const both = (key: string, names: Readonly<Record<string, string>>) => {
  const [a, b] = key.split('|');
  return `${names[a!] ?? '?'} y ${names[b!] ?? '?'}`;
};

/** El mejor de un recuento: cuánto lleva y quién es. */
function best(map: ReadonlyMap<string, number>, label: (k: string) => string): Progress {
  let top: [string, number] | null = null;
  for (const e of map) if (!top || e[1] > top[1]) top = e;
  return top ? { done: top[1], who: label(top[0]) } : { done: 0 };
}

const distinct = (n: number, id: string, title: string, icon: IconName): Badge => ({
  id,
  title,
  description: n === 1 ? 'Juega tu primer juego' : `Juega ${n} juegos distintos`,
  icon,
  group: 'juegos',
  target: n,
  progress: (s) => ({ done: s.played.length }),
});

const winsBy = (n: number, id: string, title: string): Badge => ({
  id,
  title,
  description: n === 1 ? 'Apunta quién gana una partida' : `Un mismo jugador gana ${n} partidas`,
  icon: 'star',
  group: 'ganadores',
  target: n,
  progress: (s) => (n === 1 ? { done: [...s.wins.values()].reduce((a, b) => a + b, 0) } : best(s.wins, (k) => s.names[k] ?? '?')),
});

const together = (n: number, id: string, title: string): Badge => ({
  id,
  title,
  description: `Dos jugadores juegan juntos ${n} partidas`,
  icon: 'pair',
  group: 'pandilla',
  target: n,
  progress: (s) => best(s.pairs, (k) => both(k, s.names)),
});

export const BADGES: readonly Badge[] = [
  distinct(1, 'primer-sello', 'Primer sello', 'seal'),
  distinct(5, 'cinco-sellos', 'Cinco sellos', 'seal'),
  distinct(10, 'diez-sellos', 'Diez sellos', 'ten'),
  distinct(25, 'veinticinco', 'Cuaderno a medias', 'book'),
  distinct(50, 'cincuenta', 'Medio centenar', 'book'),
  distinct(100, 'cien', 'Cien juegos', 'star'),
  { id: 'todas-secciones', title: 'De todo un poco', description: 'Juega al menos un juego de cada sección', icon: 'compass', group: 'juegos', target: Object.keys(SECTION_LABEL).length, progress: (s) => ({ done: new Set(s.played.map((g) => g.seccion)).size }) },

  { id: 'destacados', title: 'Los de siempre', description: 'Juega 10 juegos destacados', icon: 'star', group: 'colecciones', target: 10, ...inSet((g) => g.colecciones.includes('destacados')) },
  { id: 'patio', title: 'Patio de siempre', description: 'Juega 5 juegos tradicionales', icon: 'chalk', group: 'colecciones', target: 5, ...inSet((g) => g.seccion === 'tradicionales') },
  { id: 'kilometros', title: 'Kilómetros de risa', description: 'Juega 10 juegos de viaje', icon: 'car', group: 'colecciones', target: 10, ...inSet((g) => g.colecciones.includes('viaje-coche')) },
  { id: 'mundo', title: 'Vuelta al mundo', description: 'Juega 5 juegos de otros países', icon: 'globe', group: 'colecciones', target: 5, ...inSet((g) => g.colecciones.includes('juegos-del-mundo')) },
  { id: 'fiesta', title: 'Fiesta grande', description: 'Juega 5 juegos de cumpleaños', icon: 'cake', group: 'colecciones', target: 5, ...inSet((g) => g.colecciones.includes('cumpleanos-fiestas')) },
  { id: 'campamento', title: 'Fuego de campamento', description: 'Juega 5 juegos de campamento', icon: 'tent', group: 'colecciones', target: 5, ...inSet((g) => g.colecciones.includes('campamento')) },
  { id: 'linternas', title: 'Noche de linternas', description: 'Juega un juego nocturno', icon: 'moon', group: 'colecciones', target: 1, ...inSet((g) => g.colecciones.includes('nocturnos')) },
  { id: 'equipo', title: 'Buen equipo', description: 'Juega 3 juegos por equipos', icon: 'versus', group: 'colecciones', target: 3, ...inSet((g) => g.organizacion.includes('equipos')) },
  { id: 'rompehielos', title: 'Rompehielos', description: 'Juega 3 juegos para conocerse', icon: 'snow', group: 'colecciones', target: 3, ...inSet((g) => g.colecciones.includes('rompehielos')) },
  { id: 'punteria', title: 'Buena puntería', description: 'Juega 3 juegos de puntería', icon: 'target', group: 'colecciones', target: 3, ...inSet((g) => g.destrezas.includes('punteria')) },
  { id: 'calma', title: 'Con calma', description: 'Juega 5 juegos tranquilos', icon: 'leaf', group: 'colecciones', target: 5, ...inSet((g) => g.intensidad === 'calma') },

  { id: 'diez-partidas', title: 'Diez partidas', description: 'Apunta 10 partidas en el cuaderno', icon: 'calendar', group: 'partidas', target: 10, progress: (s) => ({ done: s.totalPlays }) },
  { id: 'cincuenta-partidas', title: 'Jugones', description: 'Apunta 50 partidas en el cuaderno', icon: 'calendar', group: 'partidas', target: 50, progress: (s) => ({ done: s.totalPlays }) },
  { id: 'cien-partidas', title: 'Cien partidas', description: 'Apunta 100 partidas en el cuaderno', icon: 'calendar', group: 'partidas', target: 100, progress: (s) => ({ done: s.totalPlays }) },
  { id: 'favorito', title: 'El favorito de casa', description: 'Juega 5 veces al mismo juego', icon: 'heart', group: 'partidas', target: 5, progress: (s) => ({ done: s.maxRepeats }) },
  { id: 'otra-vez', title: '¡Otra vez!', description: 'Juega 10 veces al mismo juego', icon: 'reset', group: 'partidas', target: 10, progress: (s) => ({ done: s.maxRepeats }) },
  {
    id: 'tarde-de-juegos',
    title: 'Tarde de juegos',
    description: 'Juega 3 juegos distintos el mismo día',
    icon: 'sun',
    group: 'partidas',
    target: 3,
    progress: (s) => {
      const byDay = new Map<string, Set<string>>();
      for (const x of s.sessions) {
        const day = x.at.slice(0, 10);
        byDay.set(day, (byDay.get(day) ?? new Set()).add(x.game));
      }
      return { done: Math.max(0, ...[...byDay.values()].map((v) => v.size)) };
    },
  },

  winsBy(1, 'primera-victoria', 'Primera victoria'),
  winsBy(5, 'cinco-victorias', 'Racha de suerte'),
  winsBy(10, 'campeon', 'Campeón de la casa'),
  {
    id: 'muchos-ganadores',
    title: 'Hoy gano yo',
    description: '4 jugadores distintos ganan alguna partida',
    icon: 'people',
    group: 'ganadores',
    target: 4,
    progress: (s) => ({ done: s.wins.size }),
  },

  {
    id: 'primera-vez-con',
    title: 'Compañeros de juego',
    description: 'Juega por primera vez con alguien y firmad juntos',
    icon: 'user-plus',
    group: 'pandilla',
    target: 1,
    progress: (s) => {
      const first = [...s.pairs.keys()][0];
      return first ? { done: 1, who: both(first, s.names) } : { done: 0 };
    },
  },
  together(10, 'pareja-de-jugones', 'Pareja de jugones'),
  together(25, 'inseparables', 'Inseparables'),
  {
    id: 'pandilla',
    title: 'La pandilla',
    description: 'Firman 5 jugadores distintos en el cuaderno',
    icon: 'crowd',
    group: 'pandilla',
    target: 5,
    progress: (s) => ({ done: new Set(s.sessions.flatMap((x) => x.players)).size }),
  },
  {
    id: 'gran-corro',
    title: 'Gran corro',
    description: 'Una partida con 6 jugadores o más firmando',
    icon: 'one',
    group: 'pandilla',
    target: 6,
    progress: (s) => ({ done: Math.max(0, ...s.sessions.map((x) => x.players.length)) }),
  },
];

export interface BadgeProgress {
  readonly badge: Badge;
  readonly done: number;
  /** Objetivo real: nunca mayor que los juegos que existen de ese tipo. */
  readonly target: number;
  readonly earned: boolean;
  readonly who?: string;
}

function statsOf(games: readonly Juego[], input: BadgeInput): Stats {
  const byId = new Map(games.map((g) => [g.id, g]));
  const played = Object.keys(input.plays)
    .map((id) => byId.get(id))
    .filter((g): g is Juego => g !== undefined);
  const sessions = Object.entries(input.plays).flatMap(([game, p]) => (p.sessions ?? []).map((x) => ({ ...x, game })));
  sessions.sort((a, b) => a.at.localeCompare(b.at));
  const wins = new Map<string, number>();
  const pairs = new Map<string, number>();
  for (const x of sessions) {
    for (const w of x.winners) wins.set(w, (wins.get(w) ?? 0) + 1);
    for (let i = 0; i < x.players.length; i++)
      for (let j = i + 1; j < x.players.length; j++) {
        const k = pairKey(x.players[i]!, x.players[j]!);
        pairs.set(k, (pairs.get(k) ?? 0) + 1);
      }
  }
  const counts = Object.values(input.plays).map((p) => p.count);
  return {
    games,
    played,
    sessions,
    totalPlays: counts.reduce((a, b) => a + b, 0),
    maxRepeats: Math.max(0, ...counts),
    wins,
    pairs,
    names: input.names,
  };
}

export function badgeProgress(games: readonly Juego[], input: BadgeInput): BadgeProgress[] {
  const stats = statsOf(games, input);
  return BADGES.map((badge) => {
    const target = Math.max(1, Math.min(badge.target, badge.cap ? badge.cap(games) : badge.target));
    const p = badge.progress(stats);
    const done = Math.min(target, p.done);
    return { badge, done, target, earned: done >= target, ...(p.who && done >= target ? { who: p.who } : {}) };
  });
}

/** Insignias que se acaban de conseguir al pasar de `before` a `after`. */
export function newlyEarned(games: readonly Juego[], before: BadgeInput, after: BadgeInput): BadgeProgress[] {
  const was = new Set(badgeProgress(games, before).filter((b) => b.earned).map((b) => b.badge.id));
  return badgeProgress(games, after).filter((b) => b.earned && !was.has(b.badge.id));
}

/** Para la pantalla de sellos: las conseguidas más recientes no se saben, así que primero las conseguidas y luego las más cerca de lograrse. */
export function highlightBadges(all: readonly BadgeProgress[], n = 4): BadgeProgress[] {
  const pending = all.filter((b) => !b.earned).sort((a, b) => b.done / b.target - a.done / a.target);
  const earned = all.filter((b) => b.earned);
  return [...earned.slice(-2), ...pending].slice(0, n);
}
