/** Jugadores: nombre, color y forma. La forma permite distinguirlos sin depender del color (daltonismo, contraste alto). */
export const SHAPES = [
  'circle', 'square', 'triangle', 'star', 'heart', 'diamond', 'moon', 'drop', 'bolt', 'cloud',
  'flower', 'leaf', 'hexagon', 'cross', 'house', 'crown', 'bell', 'fish', 'apple', 'pentagon',
] as const;
export type Shape = (typeof SHAPES)[number];

export const SHAPE_LABEL: Record<Shape, string> = {
  circle: 'círculo',
  square: 'cuadrado',
  triangle: 'triángulo',
  star: 'estrella',
  heart: 'corazón',
  diamond: 'rombo',
  moon: 'luna',
  drop: 'gota',
  bolt: 'rayo',
  cloud: 'nube',
  flower: 'flor',
  leaf: 'hoja',
  hexagon: 'hexágono',
  cross: 'cruz',
  house: 'casa',
  crown: 'corona',
  bell: 'campana',
  fish: 'pez',
  apple: 'manzana',
  pentagon: 'pentágono',
};

export interface PlayerColor {
  readonly hex: string;
  readonly label: string;
}

/** Los cinco de la marca más tres de apoyo para grupos grandes. Siempre se pintan con borde de tinta. */
export const PLAYER_COLORS: readonly PlayerColor[] = [
  { hex: '#FB645D', label: 'coral' },
  { hex: '#85E9E1', label: 'turquesa' },
  { hex: '#FFE461', label: 'amarillo' },
  { hex: '#9DDE60', label: 'verde' },
  { hex: '#FDFBFF', label: 'blanco' },
  { hex: '#C9B6F2', label: 'lila' },
  { hex: '#FFB067', label: 'naranja' },
  { hex: '#8FB8F2', label: 'azul' },
];

export interface Player {
  readonly id: string;
  readonly name: string;
  readonly color: string;
  readonly shape: Shape;
}

export const MAX_NAME = 16;

export const colorLabel = (hex: string): string => PLAYER_COLORS.find((c) => c.hex === hex)?.label ?? 'de color';

/** «Lucía, estrella verde»: lo que lee TalkBack. */
export const describePlayer = (p: Player): string => `${p.name}, ${SHAPE_LABEL[p.shape]} ${colorLabel(p.color)}`;

export const cleanName = (name: string): string => name.replace(/\s+/g, ' ').trim().slice(0, MAX_NAME);

let seq = 0;
export const newId = (): string => `${Date.now().toString(36)}${(seq++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** Siguiente aspecto libre: el primer color y la primera forma que nadie usa; si se acaban, se repiten en orden. */
export function nextLook(existing: readonly Player[]): { color: string; shape: Shape } {
  const n = existing.length;
  const color = PLAYER_COLORS.find((c) => !existing.some((p) => p.color === c.hex))?.hex ?? PLAYER_COLORS[n % PLAYER_COLORS.length]!.hex;
  const shape = SHAPES.find((sh) => !existing.some((p) => p.shape === sh)) ?? SHAPES[n % SHAPES.length]!;
  return { color, shape };
}

export function createPlayer(name: string, existing: readonly Player[]): Player {
  return { id: newId(), name: cleanName(name) || `Jugador ${existing.length + 1}`, ...nextLook(existing) };
}

export function sanitizePlayers(raw: unknown): Player[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((p): Player[] => {
    if (typeof p !== 'object' || p === null) return [];
    const r = p as Record<string, unknown>;
    if (typeof r.id !== 'string' || typeof r.name !== 'string') return [];
    const name = cleanName(r.name);
    if (!name) return [];
    const color = typeof r.color === 'string' && PLAYER_COLORS.some((c) => c.hex === r.color) ? r.color : PLAYER_COLORS[0]!.hex;
    const shape = SHAPES.includes(r.shape as Shape) ? (r.shape as Shape) : 'circle';
    return [{ id: r.id, name, color, shape }];
  });
}

/** «Lucía», «Lucía y Mateo», «Lucía, Mateo y Vera». */
export function joinNames(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`;
}
