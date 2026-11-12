import { GAMES, gameById } from '../catalog';
import { EMPTY_FILTERS, activeCount, availableGroups, fitsPlayers, matches, matchesQuery, toggleValue, type Filters } from '../filters';

const ctx = { favorites: new Set<string>(['rayuela']), played: new Set<string>(['sogatira']) };
const run = (f: Partial<Filters>) => GAMES.filter((g) => matches(g, { ...EMPTY_FILTERS, ...f }, ctx)).map((g) => g.id);

describe('filtros', () => {
  it('sin filtros salen todos', () => {
    expect(run({})).toHaveLength(GAMES.length);
  });

  it('busca sin tildes y por alias', () => {
    const rayuela = gameById('rayuela')!;
    expect(matchesQuery(rayuela, 'RAYUELA')).toBe(true);
    expect(matchesQuery(rayuela, 'luche')).toBe(true);
    expect(matchesQuery(gameById('senales-trafico')!, 'senal')).toBe(true);
    expect(matchesQuery(rayuela, 'pelota')).toBe(false);
  });

  it('dentro de un grupo suma (O) y entre grupos restringe (Y)', () => {
    const fuera = run({ selection: { entorno: ['exterior'] } });
    const fueraODentro = run({ selection: { entorno: ['exterior', 'interior'] } });
    const fueraSinMaterial = run({ selection: { entorno: ['exterior'], materiales: ['ninguno'] } });
    expect(fueraODentro.length).toBeGreaterThanOrEqual(fuera.length);
    expect(fueraSinMaterial.length).toBeLessThanOrEqual(fuera.length);
    for (const id of fueraSinMaterial) {
      const g = gameById(id)!;
      expect(g.entorno).toContain('exterior');
      expect(g.materiales).toContain('ninguno');
    }
  });

  it('filtra por número de jugadores', () => {
    const rayuela = gameById('rayuela')!;
    expect(fitsPlayers(rayuela, 1)).toBe(true);
    expect(fitsPlayers(rayuela, 9)).toBe(false);
    expect(fitsPlayers(gameById('jaula-pajaro-terremoto')!, 100)).toBe(true);
    expect(run({ players: 3 })).not.toContain('red-de-pescadores');
  });

  it('favoritos y sin jugar', () => {
    expect(run({ onlyFavorites: true })).toEqual(['rayuela']);
    expect(run({ onlyUnplayed: true })).not.toContain('sogatira');
  });

  it('cuenta los filtros activos y alterna valores', () => {
    let sel = toggleValue({}, 'ruido', 'silencioso');
    expect(sel.ruido).toEqual(['silencioso']);
    sel = toggleValue(sel, 'ruido', 'silencioso');
    expect(sel.ruido).toEqual([]);
    expect(activeCount({ ...EMPTY_FILTERS, selection: { edades: ['3-5', '6-8'] }, players: 4, onlyFavorites: true })).toBe(4);
  });

  it('no ofrece opciones que no tienen ningún juego', () => {
    const groups = availableGroups(GAMES);
    const onlyRayuela = availableGroups([gameById('rayuela')!]).find((g) => g.key === 'materiales')!;
    expect(onlyRayuela.options.map((o) => o.value)).toEqual(['tiza', 'piedra']);
    for (const g of groups) for (const o of g.options) expect(run({ selection: { [g.key]: [o.value] } }).length).toBeGreaterThan(0);
  });
});
