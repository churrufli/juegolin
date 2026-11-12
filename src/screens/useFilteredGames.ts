import { useMemo } from 'react';
import { GAMES } from '../domain/catalog';
import { matches } from '../domain/filters';
import type { Juego } from '../domain/types';
import { playedSet, useJournal } from '../store/journalStore';
import { useUiStore } from '../ui/uiStore';

/** Juegos que cumplen la búsqueda y los filtros activos. */
export function useFilteredGames(): readonly Juego[] {
  const filters = useUiStore((s) => s.filters);
  const plays = useJournal((s) => s.plays);
  const favorites = useJournal((s) => s.favorites);
  return useMemo(() => {
    const ctx = { favorites: new Set(favorites), played: playedSet(plays) };
    return GAMES.filter((g) => matches(g, filters, ctx));
  }, [filters, plays, favorites]);
}
