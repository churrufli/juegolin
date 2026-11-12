import { create } from 'zustand';
import type { Player } from '../domain/players';

/** Partida en curso del asistente: quién juega, a quién le toca y los puntos. Vive solo en memoria. */
export interface Match {
  readonly gameId: string | null;
  readonly players: readonly Player[];
  readonly scores: Readonly<Record<string, number>>;
  readonly turn: number;
  readonly round: number;
  readonly started: boolean;
  /** Ya se sabe quién empieza (se ha sorteado o ya se ha pasado el turno). */
  readonly decided: boolean;
}

export const EMPTY_MATCH: Match = { gameId: null, players: [], scores: {}, turn: 0, round: 1, started: false, decided: false };

export type MatchAction =
  | { type: 'setup'; gameId: string | null; players: readonly Player[] }
  | { type: 'start' }
  | { type: 'next' }
  | { type: 'first'; id: string }
  | { type: 'score'; id: string; delta: number }
  | { type: 'reset' };

export function matchReducer(m: Match, a: MatchAction): Match {
  switch (a.type) {
    case 'setup':
      return { ...EMPTY_MATCH, gameId: a.gameId, players: a.players };
    case 'start':
      if (m.players.length === 0) return m;
      return { ...m, started: true, decided: m.players.length < 2, turn: 0, round: 1, scores: Object.fromEntries(m.players.map((p) => [p.id, 0])) };
    case 'next': {
      if (m.players.length === 0) return m;
      const turn = (m.turn + 1) % m.players.length;
      return { ...m, decided: true, turn, round: turn === 0 ? m.round + 1 : m.round };
    }
    case 'first': {
      const turn = m.players.findIndex((p) => p.id === a.id);
      if (turn < 0) return m;
      return { ...m, decided: true, turn, round: 1 };
    }
    case 'score':
      return { ...m, scores: { ...m.scores, [a.id]: Math.max(0, (m.scores[a.id] ?? 0) + a.delta) } };
    case 'reset':
      return EMPTY_MATCH;
  }
}

/** Quién va ganando: los que tienen más puntos (vacío si nadie ha puntuado). */
export function leaders(m: Match): Player[] {
  const best = Math.max(0, ...m.players.map((p) => m.scores[p.id] ?? 0));
  if (best === 0) return [];
  return m.players.filter((p) => (m.scores[p.id] ?? 0) === best);
}

export const useMatch = create<Match>()(() => EMPTY_MATCH);
export const dispatchMatch = (a: MatchAction): void => useMatch.setState((m) => matchReducer(m, a), true);
