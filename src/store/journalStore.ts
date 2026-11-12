import { create } from 'zustand';
import { newlyEarned, type BadgeInput, type BadgeProgress, type Session } from '../domain/badges';
import { GAMES } from '../domain/catalog';
import { createPlayer, sanitizePlayers, type Player } from '../domain/players';
import { jsonFile } from '../storage/jsonFile';

/** Un sello: cuántas veces se ha jugado un juego y cuándo fue la última. */
export interface Play {
  readonly count: number;
  /** Fecha de la última vez, ISO. */
  readonly last: string;
  /** Nota corta opcional («Ganó la abuela»). */
  readonly note?: string;
  /** Jugadores que han firmado este juego en el cuaderno (ids de jugadores de siempre), en orden de firma. */
  readonly signers?: readonly string[];
  /** Páginas del cuaderno de firmas: una por partida, de la más vieja a la más nueva. */
  readonly sessions?: readonly Session[];
}

/** Como mucho se guardan tantas páginas por juego (las más recientes). */
export const MAX_SESSIONS = 100;

const ids = (v: unknown): string[] => (Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === 'string'))] : []);

function sanitizeSessions(raw: unknown): Session[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .flatMap((x): Session[] => {
      if (typeof x !== 'object' || x === null) return [];
      const r = x as Record<string, unknown>;
      if (typeof r.at !== 'string' || Number.isNaN(Date.parse(r.at))) return [];
      const players = ids(r.players);
      return [{ at: r.at, players, winners: ids(r.winners).filter((w) => players.includes(w)) }];
    })
    .slice(-MAX_SESSIONS);
}

export interface Journal {
  readonly plays: Readonly<Record<string, Play>>;
  readonly favorites: readonly string[];
  /** Jugadores de siempre. */
  readonly players: readonly Player[];
}

export const EMPTY_JOURNAL: Journal = { plays: {}, favorites: [], players: [] };

const KNOWN = new Set(GAMES.map((g) => g.id));

export function sanitizeJournal(raw: unknown): Journal {
  if (typeof raw !== 'object' || raw === null) return EMPTY_JOURNAL;
  const r = raw as Record<string, unknown>;
  const plays: Record<string, Play> = {};
  if (typeof r.plays === 'object' && r.plays !== null) {
    for (const [id, p] of Object.entries(r.plays as Record<string, unknown>)) {
      if (typeof p !== 'object' || p === null) continue;
      const q = p as Record<string, unknown>;
      if (typeof q.count !== 'number' || q.count < 1 || typeof q.last !== 'string') continue;
      const signers = ids(q.signers);
      const sessions = sanitizeSessions(q.sessions);
      plays[id] = {
        count: Math.floor(q.count),
        last: q.last,
        ...(typeof q.note === 'string' && q.note ? { note: q.note.slice(0, 80) } : {}),
        ...(signers.length > 0 ? { signers } : {}),
        ...(sessions.length > 0 ? { sessions } : {}),
      };
    }
  }
  const favorites = Array.isArray(r.favorites) ? r.favorites.filter((x): x is string => typeof x === 'string' && KNOWN.has(x)) : [];
  return { plays, favorites: [...new Set(favorites)], players: sanitizePlayers(r.players) };
}

const file = jsonFile('cuaderno.json', EMPTY_JOURNAL, sanitizeJournal);

export const useJournal = create<Journal & { hydrated: boolean }>()(() => ({ ...EMPTY_JOURNAL, hydrated: false }));

const save = (patch: Partial<Journal>): Promise<void> => {
  useJournal.setState(patch);
  const { plays, favorites, players } = useJournal.getState();
  return file.write({ plays, favorites, players });
};

export async function hydrateJournal(): Promise<void> {
  const j = await file.read();
  useJournal.setState({ ...j, hydrated: true });
}

export const playedSet = (plays: Readonly<Record<string, Play>>): ReadonlySet<string> => new Set(Object.keys(plays));

/** Resultado de sellar: insignias nuevas y quién ha firmado por primera vez. */
export interface StampResult {
  readonly earned: BadgeProgress[];
  readonly newSigners: readonly string[];
}

/** Lo que necesitan las insignias: los sellos y el nombre de cada jugador. */
export const badgeInput = (j: Pick<Journal, 'plays' | 'players'>): BadgeInput => ({ plays: j.plays, names: Object.fromEntries(j.players.map((p) => [p.id, p.name])) });

/**
 * Pone el sello en un juego y abre una página en su cuaderno de firmas: fecha y hora, quién ha jugado
 * y quién ha ganado. Cada jugador que aún no había firmado ese juego deja su primera firma.
 */
export function stampGame(id: string, players: readonly string[] = [], winners: readonly string[] = [], now = new Date()): StampResult {
  const journal = useJournal.getState();
  const { plays } = journal;
  const prev = plays[id];
  const who = [...new Set(players)];
  const signed = prev?.signers ?? [];
  const newSigners = who.filter((p) => !signed.includes(p));
  const signers = [...signed, ...newSigners];
  const session: Session = { at: now.toISOString(), players: who, winners: [...new Set(winners)].filter((w) => who.includes(w)) };
  const sessions = [...(prev?.sessions ?? []), session].slice(-MAX_SESSIONS);
  const next: Play = {
    count: (prev?.count ?? 0) + 1,
    last: now.toISOString(),
    ...(prev?.note ? { note: prev.note } : {}),
    ...(signers.length > 0 ? { signers } : {}),
    sessions,
  };
  const updated = { ...plays, [id]: next };
  void save({ plays: updated });
  return { earned: newlyEarned(GAMES, badgeInput(journal), badgeInput({ plays: updated, players: journal.players })), newSigners };
}

/** Cuántos juegos ha firmado cada jugador. */
export function signatureCounts(plays: Readonly<Record<string, Play>>): ReadonlyMap<string, number> {
  const counts = new Map<string, number>();
  for (const p of Object.values(plays)) for (const s of p.signers ?? []) counts.set(s, (counts.get(s) ?? 0) + 1);
  return counts;
}

export function unstampGame(id: string): void {
  const { [id]: _, ...rest } = useJournal.getState().plays;
  void save({ plays: rest });
}

export const clearStamps = (): Promise<void> => save({ plays: {} });

export function toggleFavorite(id: string): boolean {
  const { favorites } = useJournal.getState();
  const on = !favorites.includes(id);
  void save({ favorites: on ? [...favorites, id] : favorites.filter((f) => f !== id) });
  return on;
}

export function addPlayer(name: string): Player {
  const { players } = useJournal.getState();
  const p = createPlayer(name, players);
  void save({ players: [...players, p] });
  return p;
}

export function updatePlayer(id: string, patch: Partial<Omit<Player, 'id'>>): void {
  const { players } = useJournal.getState();
  void save({ players: sanitizePlayers(players.map((p) => (p.id === id ? { ...p, ...patch } : p))) });
}

export function removePlayer(id: string): void {
  void save({ players: useJournal.getState().players.filter((p) => p.id !== id) });
}

/** «22 oct». */
export const shortDate = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
};
