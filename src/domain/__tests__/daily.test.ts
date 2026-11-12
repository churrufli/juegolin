import { GAMES } from '../catalog';
import { THEMES, dayKey, daily } from '../daily';

describe('portada del día', () => {
  it('el mismo día da lo mismo y otro día cambia', () => {
    const a = daily(GAMES, '2026-10-23');
    expect(daily(GAMES, '2026-10-23')).toEqual(a);
    const days = ['2026-10-24', '2026-10-25', '2026-10-26', '2026-10-27'].map((d) => daily(GAMES, d).game.id);
    expect(new Set([a.game.id, ...days]).size).toBeGreaterThan(2);
  });

  it('tres secciones distintas, con juegos que encajan y sin repetir el del día', () => {
    const { game, sections } = daily(GAMES, '2026-10-23');
    expect(new Set(sections.map((s) => s.theme.id)).size).toBe(3);
    for (const s of sections) {
      expect(s.games.length).toBeGreaterThanOrEqual(4);
      expect(s.games.every((g) => s.theme.test(g) && g.id !== game.id)).toBe(true);
    }
  });

  it('todas las secciones tienen juegos suficientes', () => {
    for (const t of THEMES) expect(GAMES.filter(t.test).length).toBeGreaterThanOrEqual(4);
    expect(dayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});
