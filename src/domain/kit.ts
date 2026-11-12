/** El kit de Juegolín: el material de casa que piden los juegos, primero lo que sirve para más juegos. */
import { FILTER_GROUPS } from './filters';
import type { Juego, Material } from './types';
import type { IconName } from '../ui/icons';

const ORDER: readonly Material[] = [
  'papel', 'monedas', 'piedra', 'canicas', 'chapas', 'tiza', 'tarjetas', 'cuaderno', 'panuelo', 'cintas', 'silbato', 'linterna',
  'cuerda', 'goma', 'peonza', 'globos', 'pelota', 'saquitos', 'banderas', 'mapa', 'brujula', 'reflectantes', 'palos', 'latas',
  'bolos', 'musica', 'aro', 'sacos', 'sillas', 'objetos',
];

export interface KitItem {
  readonly value: Material;
  readonly label: string;
  readonly icon: IconName;
  readonly games: number;
}

/** Solo lo que pide algún juego, de más a menos juegos; a igualdad, lo más pequeño primero. */
export function kitOf(games: readonly Juego[]): KitItem[] {
  const options = FILTER_GROUPS.find((g) => g.key === 'materiales')?.options ?? [];
  return ORDER.map((value) => {
    const o = options.find((x) => x.value === value);
    return { value, label: o?.label ?? value, icon: (o?.icon ?? 'box') as IconName, games: games.filter((g) => g.materiales.includes(value)).length };
  })
    .filter((k) => k.games > 0)
    .sort((a, b) => b.games - a.games);
}
