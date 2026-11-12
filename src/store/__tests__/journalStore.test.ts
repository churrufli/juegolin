jest.mock('../../storage/jsonFile', () => ({
  jsonFile: <T,>(_: string, fallback: T) => ({ read: async () => fallback, write: async () => undefined }),
}));

import { sanitizeJournal, signatureCounts, stampGame, useJournal, EMPTY_JOURNAL } from '../journalStore';

describe('cuaderno de firmas', () => {
  beforeEach(() => useJournal.setState({ ...EMPTY_JOURNAL, hydrated: true }));

  it('cada jugador firma una sola vez por juego', () => {
    const first = stampGame('rayuela', ['ana', 'bea']);
    expect(first.newSigners).toEqual(['ana', 'bea']);
    expect(first.earned.map((b) => b.badge.id)).toContain('primer-sello');
    const second = stampGame('rayuela', ['bea', 'carlos']);
    expect(second.newSigners).toEqual(['carlos']);
    const play = useJournal.getState().plays.rayuela!;
    expect(play.count).toBe(2);
    expect(play.signers).toEqual(['ana', 'bea', 'carlos']);
  });

  it('sellar sin jugadores no añade firmas', () => {
    expect(stampGame('sogatira').newSigners).toEqual([]);
    expect(useJournal.getState().plays.sogatira!.signers).toBeUndefined();
  });

  it('cuenta los juegos firmados por jugador', () => {
    stampGame('rayuela', ['ana']);
    stampGame('sogatira', ['ana', 'bea']);
    const counts = signatureCounts(useJournal.getState().plays);
    expect(counts.get('ana')).toBe(2);
    expect(counts.get('bea')).toBe(1);
  });

  it('limpia firmas corruptas al leer', () => {
    const j = sanitizeJournal({ plays: { rayuela: { count: 1, last: '2026-10-22T10:00:00Z', signers: ['a', 3, 'a', 'b'] } } });
    expect(j.plays.rayuela!.signers).toEqual(['a', 'b']);
  });
});
