import { suggest, fitScore } from '../assistant';
import { GAMES, gameById } from '../catalog';
import { recommendFrom, similarTo, similarity } from '../recommend';

const g = (id: string) => gameById(id)!;

describe('recomendaciones', () => {
  it('un juego no se recomienda a sí mismo y la similitud es simétrica', () => {
    expect(similarity(g('rayuela'), g('rayuela'))).toBe(0);
    expect(similarity(g('rayuela'), g('chapas'))).toBe(similarity(g('chapas'), g('rayuela')));
    expect(similarTo(g('rayuela'), GAMES).map((x) => x.id)).not.toContain('rayuela');
  });

  it('a un juego de viaje le salen sobre todo juegos de viaje', () => {
    const veo = similarTo(g('veo-veo'), GAMES, new Set(), 4);
    expect(veo.filter((x) => x.colecciones.includes('viaje-coche')).length).toBeGreaterThanOrEqual(3);
  });

  it('la pantalla principal solo propone juegos sin jugar', () => {
    const played = new Set(['rayuela', 'chapas']);
    const recs = recommendFrom([g('rayuela'), g('chapas')], GAMES, played);
    expect(recs).toHaveLength(8);
    expect(recs.some((x) => played.has(x.id))).toBe(false);
    expect(recommendFrom([], GAMES, played)).toEqual([]);
  });
});

describe('asistente', () => {
  it('en el coche solo propone juegos de viaje', () => {
    const r = suggest(GAMES, { where: 'coche', players: 4 });
    expect(r.length).toBeGreaterThan(5);
    expect(r.every((x) => x.colecciones.includes('viaje-coche'))).toBe(true);
  });

  it('respeta el número de jugadores', () => {
    expect(suggest(GAMES, { players: 2 }).every((x) => x.participantes.min <= 2)).toBe(true);
  });

  it('sin material y con ganas de correr, arriba salen juegos movidos sin material', () => {
    const top = suggest(GAMES, { players: 8, where: 'fuera', energy: 'correr', material: 'nada' }).slice(0, 5);
    expect(top.every((x) => x.materiales.includes('ninguno') && x.intensidad === 'alta')).toBe(true);
    expect(fitScore(g('veo-veo'), { where: 'coche' })).not.toBeNull();
  });
});
