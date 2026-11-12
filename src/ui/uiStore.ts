import { create } from 'zustand';
import { EMPTY_FILTERS, type Filters } from '../domain/filters';

export type Tab = 'explore' | 'play' | 'stamps' | 'settings';
export const TABS: readonly Tab[] = ['explore', 'play', 'stamps', 'settings'];

export type Overlay =
  | { readonly name: 'game'; readonly id: string }
  | { readonly name: 'play'; readonly gameId: string }
  | { readonly name: 'players' }
  | { readonly name: 'manual' }
  | { readonly name: 'about' }
  | { readonly name: 'assistant' }
  | { readonly name: 'badges' }
  | { readonly name: 'kit' };

interface UiStore {
  readonly tab: Tab;
  readonly overlays: readonly Overlay[];
  readonly filters: Filters;
  /** Juego al que se acaba de poner el sello, para animarlo al volver a su ficha. */
  readonly justStamped: string | null;
}

export const useUiStore = create<UiStore>()(() => ({ tab: 'explore', overlays: [], filters: EMPTY_FILTERS, justStamped: null }));

export const setTab = (tab: Tab): void => useUiStore.setState({ tab, overlays: [] });

export const pushOverlay = (overlay: Overlay): void => useUiStore.setState((s) => ({ overlays: [...s.overlays, overlay] }));

export const popOverlay = (): void => useUiStore.setState((s) => ({ overlays: s.overlays.slice(0, -1) }));

export const openGame = (id: string): void => pushOverlay({ name: 'game', id });

export const setFilters = (patch: Partial<Filters>): void => useUiStore.setState((s) => ({ filters: { ...s.filters, ...patch } }));

export const resetFilters = (): void => useUiStore.setState((s) => ({ filters: { ...EMPTY_FILTERS, query: s.filters.query } }));

export const markStamped = (id: string | null): void => useUiStore.setState({ justStamped: id });
