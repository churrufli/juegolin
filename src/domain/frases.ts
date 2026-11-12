/** Frases para cerrar la partida, sin nombres: una para quien gana, otra para el resto y otra para todos. */
import data from '../data/frases.json';

export interface Cheers {
  readonly winners: string;
  /** Solo si alguien no ha ganado. */
  readonly others: string | null;
  readonly all: string;
}

const pick = (list: readonly string[], rand: () => number): string => list[Math.floor(rand() * list.length) % list.length] ?? list[0] ?? '';

/** Sin ganadores no hay frases. `players` es cuántos han jugado. */
export function cheersFor(winners: number, players: number, rand: () => number = Math.random): Cheers | null {
  if (winners === 0) return null;
  // «los dos habéis…» solo encaja cuando han jugado dos
  const group = players === 2 ? data.frasesTodos : data.frasesTodos.filter((f) => !f.includes('los dos'));
  return {
    winners: pick(data.frasesGanadores, rand),
    others: players > winners ? pick(data.frasesNoGanadores, rand) : null,
    all: pick(group, rand),
  };
}
