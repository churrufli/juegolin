import { fold } from './catalog';
import type { IconName } from '../ui/icons';
import type { Juego } from './types';

/** Campos del juego que se filtran por etiquetas. */
export type FilterKey =
  | 'edades'
  | 'entorno'
  | 'espacio'
  | 'intensidad'
  | 'destrezas'
  | 'materiales'
  | 'grupo'
  | 'organizacion'
  | 'duracion'
  | 'ruido'
  | 'dificultad'
  | 'habilidades'
  | 'colecciones';

export interface FilterGroup {
  readonly key: FilterKey;
  readonly title: string;
  readonly options: readonly { readonly value: string; readonly label: string; readonly icon: IconName }[];
}

/** Los diez filtros de la spec, en el orden en que se muestran. */
export const FILTER_GROUPS: readonly FilterGroup[] = [
  {
    key: 'edades',
    title: 'Edad',
    options: [
      { value: '3-5', label: '3 a 5 años', icon: 'age3' },
      { value: '6-8', label: '6 a 8 años', icon: 'age6' },
      { value: '9-12', label: '9 a 12 años', icon: 'age9' },
      { value: 'familia', label: 'Toda la familia', icon: 'family' },
    ],
  },
  {
    key: 'entorno',
    title: 'Dónde',
    options: [
      { value: 'exterior', label: 'Al aire libre', icon: 'sun' },
      { value: 'interior', label: 'Dentro de casa o aula', icon: 'house' },
    ],
  },
  {
    key: 'espacio',
    title: 'Espacio',
    options: [
      { value: 'reducido', label: 'Poco espacio', icon: 'compress' },
      { value: 'amplio', label: 'Mucho espacio', icon: 'expand' },
    ],
  },
  {
    key: 'intensidad',
    title: 'Movimiento',
    options: [
      { value: 'alta', label: 'Correr y saltar', icon: 'run' },
      { value: 'moderada', label: 'Moderado', icon: 'walk' },
      { value: 'calma', label: 'Con calma', icon: 'leaf' },
    ],
  },
  {
    key: 'destrezas',
    title: 'Destreza',
    options: [
      { value: 'fuerza', label: 'Fuerza', icon: 'weight' },
      { value: 'punteria', label: 'Puntería', icon: 'target' },
      { value: 'equilibrio', label: 'Equilibrio', icon: 'balance' },
    ],
  },
  {
    key: 'materiales',
    title: 'Material',
    options: [
      { value: 'ninguno', label: 'Sin material', icon: 'hand' },
      { value: 'papel', label: 'Papel y lápiz', icon: 'pencil' },
      { value: 'objetos', label: 'Cosas de casa', icon: 'box' },
      { value: 'musica', label: 'Música', icon: 'music' },
      { value: 'aro', label: 'Aro', icon: 'hoop' },
      { value: 'globos', label: 'Globos', icon: 'balloon' },
      { value: 'sillas', label: 'Sillas', icon: 'chair' },
      { value: 'canicas', label: 'Canicas', icon: 'marbles' },
      { value: 'goma', label: 'Goma elástica', icon: 'elastic' },
      { value: 'peonza', label: 'Peonza', icon: 'top' },
      { value: 'bolos', label: 'Bolos', icon: 'pin' },
      { value: 'monedas', label: 'Monedas', icon: 'coin' },
      { value: 'tiza', label: 'Tiza', icon: 'chalk' },
      { value: 'cuerda', label: 'Cuerda', icon: 'rope' },
      { value: 'pelota', label: 'Pelota', icon: 'ball' },
      { value: 'panuelo', label: 'Pañuelo', icon: 'scarf' },
      { value: 'chapas', label: 'Chapas', icon: 'cap' },
      { value: 'sacos', label: 'Sacos', icon: 'sack' },
      { value: 'latas', label: 'Latas', icon: 'can' },
      { value: 'piedra', label: 'Piedra', icon: 'stone' },
      { value: 'saquitos', label: 'Saquitos', icon: 'beanbag' },
      { value: 'linterna', label: 'Linterna', icon: 'flashlight' },
      { value: 'cintas', label: 'Cintas', icon: 'ribbon' },
      { value: 'banderas', label: 'Banderas', icon: 'flag' },
      { value: 'palos', label: 'Palos', icon: 'stick' },
      { value: 'tarjetas', label: 'Tarjetas', icon: 'cards' },
      { value: 'cuaderno', label: 'Cuaderno', icon: 'notebook' },
      { value: 'silbato', label: 'Silbato', icon: 'whistle' },
      { value: 'mapa', label: 'Mapa', icon: 'map' },
      { value: 'brujula', label: 'Brújula', icon: 'compass' },
      { value: 'reflectantes', label: 'Reflectantes', icon: 'vest' },
    ],
  },
  {
    key: 'grupo',
    title: 'Cuántos sois',
    options: [
      { value: 'individual-parejas', label: 'Solo o en pareja', icon: 'pair' },
      { value: 'pequeno', label: '3 a 5', icon: 'people' },
      { value: 'grande', label: 'Grupo grande', icon: 'crowd' },
    ],
  },
  {
    key: 'organizacion',
    title: 'Cómo se juega',
    options: [
      { value: 'todos-contra-todos', label: 'Todos contra todos', icon: 'scatter' },
      { value: 'equipos', label: 'Por equipos', icon: 'versus' },
      { value: 'todos-contra-uno', label: 'Todos contra uno', icon: 'one' },
      { value: 'cooperativo', label: 'Todos juntos', icon: 'heart' },
    ],
  },
  {
    key: 'duracion',
    title: 'Duración',
    options: [
      { value: 'expres', label: 'Menos de 5 min', icon: 'bolt' },
      { value: 'media', label: '5 a 15 min', icon: 'clock' },
      { value: 'larga', label: 'Más de 15 min', icon: 'hourglass' },
    ],
  },
  {
    key: 'ruido',
    title: 'Ruido',
    options: [
      { value: 'silencioso', label: 'Silencioso', icon: 'quiet' },
      { value: 'medio', label: 'Normal', icon: 'speaker' },
      { value: 'ruidoso', label: 'Alborotado', icon: 'loud' },
    ],
  },
  {
    key: 'dificultad',
    title: 'Reglas',
    options: [
      { value: 'muy-facil', label: 'Muy fáciles', icon: 'bars1' },
      { value: 'intermedia', label: 'Intermedias', icon: 'bars2' },
      { value: 'estrategica', label: 'Con estrategia', icon: 'bars3' },
    ],
  },
  {
    key: 'habilidades',
    title: 'Qué se trabaja',
    options: [
      { value: 'cooperacion', label: 'Cooperación', icon: 'heart' },
      { value: 'reflejos', label: 'Reflejos', icon: 'bolt' },
      { value: 'estrategia', label: 'Estrategia', icon: 'bulb' },
      { value: 'expresion', label: 'Expresión y creatividad', icon: 'palette' },
      { value: 'coordinacion', label: 'Coordinación', icon: 'juggle' },
      { value: 'atencion', label: 'Atención', icon: 'eye' },
    ],
  },
  {
    key: 'colecciones',
    title: 'Colecciones',
    options: [
      { value: 'destacados', label: 'Destacados', icon: 'star' },
      { value: 'clasicos-del-patio', label: 'Clásicos del patio', icon: 'chalk' },
      { value: 'viaje-coche', label: 'De viaje y coche', icon: 'car' },
      { value: 'cumpleanos-fiestas', label: 'Cumpleaños y fiestas', icon: 'cake' },
      { value: 'juegos-del-mundo', label: 'Juegos del mundo', icon: 'globe' },
      { value: 'campamento', label: 'Campamento', icon: 'tent' },
      { value: 'rompehielos', label: 'Para romper el hielo', icon: 'snow' },
      { value: 'nocturnos', label: 'De noche', icon: 'moon' },
    ],
  },
];

export type Selection = Readonly<Partial<Record<FilterKey, readonly string[]>>>;

export interface Filters {
  readonly query: string;
  readonly selection: Selection;
  /** Número de jugadores: el juego tiene que admitirlo. null = cualquiera. */
  readonly players: number | null;
  readonly onlyFavorites: boolean;
  readonly onlyUnplayed: boolean;
}

export const EMPTY_FILTERS: Filters = { query: '', selection: {}, players: null, onlyFavorites: false, onlyUnplayed: false };

const valuesOf = (game: Juego, key: FilterKey): readonly string[] => {
  const v = game[key];
  return typeof v === 'string' ? [v] : v;
};

export function matchesQuery(game: Juego, query: string): boolean {
  const q = fold(query);
  if (!q) return true;
  const haystack = fold([game.nombre, ...game.alias, game.resumen].join(' '));
  return q.split(/\s+/).every((word) => haystack.includes(word));
}

export const fitsPlayers = (game: Juego, n: number): boolean => n >= game.participantes.min && (game.participantes.max === null || n <= game.participantes.max);

/**
 * Dentro de un mismo grupo basta con una etiqueta (O); entre grupos tienen que cumplirse todas (Y).
 */
export function matches(game: Juego, f: Filters, ctx: { favorites: ReadonlySet<string>; played: ReadonlySet<string> }): boolean {
  if (!matchesQuery(game, f.query)) return false;
  if (f.players !== null && !fitsPlayers(game, f.players)) return false;
  if (f.onlyFavorites && !ctx.favorites.has(game.id)) return false;
  if (f.onlyUnplayed && ctx.played.has(game.id)) return false;
  for (const [key, wanted] of Object.entries(f.selection) as [FilterKey, readonly string[]][]) {
    if (wanted.length === 0) continue;
    const have = valuesOf(game, key);
    if (!wanted.some((w) => have.includes(w))) return false;
  }
  return true;
}

export const toggleValue = (selection: Selection, key: FilterKey, value: string): Selection => {
  const current = selection[key] ?? [];
  const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
  return { ...selection, [key]: next };
};

export const isSelected = (selection: Selection, key: FilterKey, value: string): boolean => (selection[key] ?? []).includes(value);

/** Cuántos filtros hay activos (sin contar la búsqueda). */
export const activeCount = (f: Filters): number =>
  Object.values(f.selection).reduce((n, v) => n + (v?.length ?? 0), 0) + (f.players !== null ? 1 : 0) + (f.onlyFavorites ? 1 : 0) + (f.onlyUnplayed ? 1 : 0);

/** Opciones que de verdad tienen algún juego (no se ofrecen filtros que dejan la lista vacía de entrada). */
export function availableGroups(games: readonly Juego[]): readonly FilterGroup[] {
  return FILTER_GROUPS.map((g) => ({ ...g, options: g.options.filter((o) => games.some((game) => valuesOf(game, g.key).includes(o.value))) })).filter(
    (g) => g.options.length > 1,
  );
}

/** Atajos grandes de la pantalla principal: cada uno activa un filtro concreto. */
export interface QuickFilter {
  readonly id: string;
  readonly label: string;
  readonly icon: IconName;
  readonly key: FilterKey;
  readonly value: string;
}

export const QUICK_FILTERS: readonly QuickFilter[] = [
  { id: 'fuera', label: 'Fuera', icon: 'sun', key: 'entorno', value: 'exterior' },
  { id: 'dentro', label: 'Dentro', icon: 'house', key: 'entorno', value: 'interior' },
  { id: 'sin-material', label: 'Sin material', icon: 'hand', key: 'materiales', value: 'ninguno' },
  { id: 'rapidos', label: 'Rápidos', icon: 'clock', key: 'duracion', value: 'expres' },
  { id: 'correr', label: 'Correr', icon: 'run', key: 'intensidad', value: 'alta' },
  { id: 'tranquilos', label: 'Tranquilos', icon: 'leaf', key: 'intensidad', value: 'calma' },
  { id: 'peques', label: 'Peques', icon: 'age3', key: 'edades', value: '3-5' },
  { id: 'viaje', label: 'De viaje', icon: 'car', key: 'colecciones', value: 'viaje-coche' },
  { id: 'equipos', label: 'Equipos', icon: 'versus', key: 'organizacion', value: 'equipos' },
  { id: 'pelota', label: 'Con pelota', icon: 'ball', key: 'materiales', value: 'pelota' },
  { id: 'papel', label: 'Papel y lápiz', icon: 'pencil', key: 'materiales', value: 'papel' },
  { id: 'fiestas', label: 'Fiestas', icon: 'cake', key: 'colecciones', value: 'cumpleanos-fiestas' },
  { id: 'patio', label: 'Del patio', icon: 'chalk', key: 'colecciones', value: 'clasicos-del-patio' },
  { id: 'mundo', label: 'Del mundo', icon: 'globe', key: 'colecciones', value: 'juegos-del-mundo' },
  { id: 'silencio', label: 'Silenciosos', icon: 'quiet', key: 'ruido', value: 'silencioso' },
  { id: 'noche', label: 'De noche', icon: 'moon', key: 'colecciones', value: 'nocturnos' },
  { id: 'campamento', label: 'Campamento', icon: 'tent', key: 'colecciones', value: 'campamento' },
];
