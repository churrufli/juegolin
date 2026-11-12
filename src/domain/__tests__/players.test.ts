import { PLAYER_COLORS, SHAPES, cleanName, createPlayer, describePlayer, sanitizePlayers, type Player } from '../players';

describe('jugadores', () => {
  it('reparte color y forma distintos a los primeros', () => {
    const list: Player[] = [];
    for (let i = 0; i < SHAPES.length; i++) list.push(createPlayer(`J${i}`, list));
    expect(new Set(list.map((p) => p.color)).size).toBe(Math.min(SHAPES.length, PLAYER_COLORS.length));
    expect(new Set(list.map((p) => p.shape)).size).toBe(SHAPES.length);
  });

  it('limpia nombres', () => {
    expect(cleanName('  Lucía   María  ')).toBe('Lucía María');
    expect(cleanName('a'.repeat(40))).toHaveLength(16);
    expect(createPlayer('   ', []).name).toBe('Jugador 1');
  });

  it('describe para TalkBack', () => {
    expect(describePlayer({ id: 'x', name: 'Nico', color: PLAYER_COLORS[3]!.hex, shape: 'star' })).toBe('Nico, estrella verde');
  });

  it('descarta datos corruptos', () => {
    expect(sanitizePlayers([{ id: 'a', name: 'Ana', color: '#000000', shape: 'blob' }, null, { name: 'sin id' }])).toEqual([
      { id: 'a', name: 'Ana', color: PLAYER_COLORS[0]!.hex, shape: 'circle' },
    ]);
  });
});
