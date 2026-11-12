import { friendlyDate, longDate, timeOf } from '../dates';

const now = new Date(2026, 9, 23, 12, 0);
const ago = (days: number, hour = 10) => new Date(2026, 9, 23 - days, hour, 5).toISOString();

describe('fechas amigables', () => {
  it('días cercanos', () => {
    expect(friendlyDate(ago(0), now)).toBe('hoy');
    expect(friendlyDate(ago(1, 23), now)).toBe('ayer');
    expect(friendlyDate(ago(2), now)).toBe('anteayer');
    expect(friendlyDate(ago(4), now)).toBe('hace 4 días');
    expect(friendlyDate(ago(9), now)).toBe('la semana pasada');
    expect(friendlyDate(ago(20), now)).toBe('hace 2 semanas');
  });

  it('meses y años', () => {
    expect(friendlyDate(new Date(2026, 8, 10).toISOString(), now)).toBe('el mes pasado');
    expect(friendlyDate(new Date(2026, 4, 10).toISOString(), now)).toBe('hace 5 meses');
    expect(friendlyDate(new Date(2025, 3, 10).toISOString(), now)).toBe('el año pasado');
    expect(friendlyDate(new Date(2023, 3, 10).toISOString(), now)).toBe('hace 3 años');
    expect(friendlyDate('mal', now)).toBe('');
  });

  it('hora y fecha larga', () => {
    expect(timeOf(new Date(2026, 9, 23, 18, 5).toISOString())).toBe('18:05');
    expect(longDate(new Date(2026, 9, 23).toISOString())).toBe('viernes 23 de octubre');
  });
});
