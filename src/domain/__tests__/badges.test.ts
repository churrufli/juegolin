import { BADGES, badgeProgress, highlightBadges, newlyEarned, type BadgeInput, type Session } from '../badges';
import { GAMES } from '../catalog';

const EMPTY: BadgeInput = { plays: {}, names: {} };
const names = { a: 'Lucía', b: 'Mateo', c: 'Vera' };
const s = (at: string, players: string[], winners: string[] = []): Session => ({ at, players, winners });
const withPlays = (ids: readonly string[]): BadgeInput => ({ plays: Object.fromEntries(ids.map((id) => [id, { count: 1 }])), names: {} });
const find = (input: BadgeInput, id: string) => badgeProgress(GAMES, input).find((b) => b.badge.id === id)!;

describe('insignias', () => {
  it('sin sellos no hay ninguna y los ids no se repiten', () => {
    expect(badgeProgress(GAMES, EMPTY).some((b) => b.earned)).toBe(false);
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(BADGES.length);
  });

  it('el primer sello da «Primer sello»', () => {
    expect(newlyEarned(GAMES, EMPTY, withPlays(['rayuela'])).map((b) => b.badge.id)).toEqual(['primer-sello']);
  });

  it('cinco tradicionales completan «Patio de siempre»', () => {
    const trad = GAMES.filter((g) => g.seccion === 'tradicionales').slice(0, 5).map((g) => g.id);
    const patio = find(withPlays(trad), 'patio');
    expect(patio.earned).toBe(true);
    expect(patio.target).toBe(5);
  });

  it('jugar con alguien, ganar y repetir pareja', () => {
    const sessions = Array.from({ length: 10 }, (_, i) => s(`2026-10-${String(i + 1).padStart(2, '0')}T18:00:00Z`, ['a', 'b'], i % 2 ? ['a'] : []));
    const input: BadgeInput = { plays: { rayuela: { count: 10, sessions } }, names };
    expect(find(input, 'primera-vez-con')).toMatchObject({ earned: true, who: 'Lucía y Mateo' });
    expect(find(input, 'pareja-de-jugones')).toMatchObject({ earned: true, who: 'Lucía y Mateo' });
    expect(find(input, 'primera-victoria').earned).toBe(true);
    expect(find(input, 'cinco-victorias')).toMatchObject({ earned: true, who: 'Lucía' });
    expect(find(input, 'otra-vez').earned).toBe(true);
    expect(find(input, 'inseparables').earned).toBe(false);
  });

  it('tres juegos el mismo día dan «Tarde de juegos»', () => {
    const day = (id: string) => [id, { count: 1, sessions: [s('2026-10-23T17:00:00Z', ['a'])] }] as const;
    expect(find({ plays: Object.fromEntries(['rayuela', 'chapas', 'canicas'].map(day)), names }, 'tarde-de-juegos').earned).toBe(true);
  });

  it('con todo jugado se consiguen las de juegos y colecciones', () => {
    const all = badgeProgress(GAMES, withPlays(GAMES.map((g) => g.id)));
    for (const b of all.filter((x) => x.badge.group === 'juegos' || x.badge.group === 'colecciones')) expect(b.earned).toBe(true);
  });

  it('la portada de insignias enseña unas pocas', () => {
    expect(highlightBadges(badgeProgress(GAMES, EMPTY))).toHaveLength(4);
  });
});
