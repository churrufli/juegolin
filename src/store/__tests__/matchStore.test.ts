import { EMPTY_MATCH, leaders, matchReducer } from '../matchStore';
import type { Player } from '../../domain/players';

const a: Player = { id: 'a', name: 'Ana', color: '#FB645D', shape: 'circle' };
const b: Player = { id: 'b', name: 'Bea', color: '#85E9E1', shape: 'square' };

describe('asistente de partida', () => {
  it('pasa el turno y cuenta rondas', () => {
    let m = matchReducer(EMPTY_MATCH, { type: 'setup', gameId: 'rayuela', players: [a, b] });
    m = matchReducer(m, { type: 'start' });
    expect(m.turn).toBe(0);
    m = matchReducer(m, { type: 'next' });
    expect([m.turn, m.round]).toEqual([1, 1]);
    m = matchReducer(m, { type: 'next' });
    expect([m.turn, m.round]).toEqual([0, 2]);
  });

  it('no deja puntos negativos y calcula quién gana', () => {
    let m = matchReducer(matchReducer(EMPTY_MATCH, { type: 'setup', gameId: null, players: [a, b] }), { type: 'start' });
    m = matchReducer(m, { type: 'score', id: 'a', delta: -1 });
    expect(m.scores.a).toBe(0);
    expect(leaders(m)).toEqual([]);
    m = matchReducer(m, { type: 'score', id: 'b', delta: 2 });
    expect(leaders(m)).toEqual([b]);
  });

  it('no empieza sin jugadores', () => {
    expect(matchReducer(EMPTY_MATCH, { type: 'start' }).started).toBe(false);
  });

  it('quien gana el sorteo empieza la primera ronda', () => {
    let m = matchReducer(matchReducer(EMPTY_MATCH, { type: 'setup', gameId: null, players: [a, b] }), { type: 'start' });
    expect(m.decided).toBe(false);
    m = matchReducer(m, { type: 'first', id: 'b' });
    expect([m.turn, m.round, m.decided]).toEqual([1, 1, true]);
  });
});
