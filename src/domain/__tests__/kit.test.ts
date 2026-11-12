import { GAMES } from '../catalog';
import { kitOf } from '../kit';

describe('kit', () => {
  it('lista el material que piden los juegos, sin «ninguno» y de más a menos juegos', () => {
    const kit = kitOf(GAMES);
    expect(kit.length).toBeGreaterThan(10);
    expect(kit.some((k) => (k.value as string) === 'ninguno')).toBe(false);
    expect(kit.every((k, i) => i === 0 || kit[i - 1]!.games >= k.games)).toBe(true);
    expect(kit.every((k) => k.games > 0)).toBe(true);
    const used = new Set(GAMES.flatMap((g) => g.materiales).filter((m) => m !== 'ninguno'));
    expect(new Set(kit.map((k) => k.value))).toEqual(used);
  });
});
