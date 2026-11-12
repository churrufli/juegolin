import data from '../data/games.json';
import type { Hue } from '../ui/theme';
import type { Duracion, Juego, Seccion } from './types';

/** Artículos que no cuentan al ordenar («La rayuela» va con la R). */
const ARTICLE = /^(el|la|los|las|un|una)\s+/i;

/** Minúsculas y sin tildes, para buscar y ordenar. */
export const fold = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[¿?¡!«»"]/g, '')
    .toLocaleLowerCase('es')
    .trim();

export const sortKey = (nombre: string): string => fold(nombre).replace(ARTICLE, '');

export const byName = (a: Juego, b: Juego): number => sortKey(a.nombre).localeCompare(sortKey(b.nombre), 'es');

export const GAMES: readonly Juego[] = [...(data.juegos as unknown as Juego[])].sort(byName);

const INDEX = new Map(GAMES.map((g) => [g.id, g]));

export const gameById = (id: string): Juego | undefined => INDEX.get(id);

/** «Destacados»: los juegos más clásicos que se juegan en España, de más a menos conocido. */
export const DESTACADOS: readonly Juego[] = (data.destacados.destacados as string[]).map((id) => INDEX.get(id)).filter((g): g is Juego => g !== undefined);

export const SECTION_LABEL: Record<Seccion, string> = {
  presentacion: 'Para conocerse',
  tradicionales: 'Tradicionales',
  acecho: 'Acecho',
  'grandes-juegos': 'Grandes juegos',
  nocturnos: 'Nocturnos',
  agilidad: 'Agilidad',
  viaje: 'De viaje',
  tranquilos: 'Tranquilos',
};

/** Tono de cada sección: turquesa calma y viaje, coral movimiento, amarillo tradición, verde aire libre. */
export const SECTION_HUE: Record<Seccion, Hue> = {
  presentacion: 'yellow',
  tradicionales: 'yellow',
  acecho: 'green',
  'grandes-juegos': 'coral',
  nocturnos: 'green',
  agilidad: 'coral',
  viaje: 'turquoise',
  tranquilos: 'turquoise',
};

export const DURATION_SHORT: Record<Duracion, string> = { expres: '< 5 min', media: '5–15 min', larga: '+15 min' };

export function playersLabel(g: Juego): string {
  const { min, max } = g.participantes;
  if (max === null) return min <= 1 ? 'Cualquier número' : `${min} o más`;
  if (min === max) return `${min}`;
  return `${min}–${max}`;
}

export function agesLabel(g: Juego): string {
  if (g.edades.includes('familia') && g.edades.length === 1) return 'Toda la familia';
  const nums = g.edades.filter((e) => e !== 'familia').sort((a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10));
  const first = nums[0];
  if (!first) return 'Toda la familia';
  return `${first.split('-')[0]}+ años`;
}
