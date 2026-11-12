import { GAMES, DESTACADOS, agesLabel, fold, gameById, playersLabel, sortKey } from '../catalog';
import { ILLUSTRATIONS } from '../../ui/illustrations';

describe('catálogo', () => {
  it('tiene juegos y todos con id único', () => {
    expect(GAMES.length).toBeGreaterThanOrEqual(400);
    expect(new Set(GAMES.map((g) => g.id)).size).toBe(GAMES.length);
  });

  it('cada ficha tiene los tres pasos', () => {
    for (const g of GAMES) {
      expect(g.pasos.preparacion.length).toBeGreaterThan(0);
      expect(g.pasos.comoSeJuega.length).toBeGreaterThan(0);
      expect(g.pasos.comoSeGana.length).toBeGreaterThan(0);
    }
  });

  it('todas las ilustraciones corresponden a un juego', () => {
    for (const id of Object.keys(ILLUSTRATIONS)) expect(gameById(id)).toBeDefined();
  });

  it('ordena sin artículos ni tildes', () => {
    expect(sortKey('La rayuela')).toBe('rayuela');
    expect(fold('¿Qué dice esta señal?')).toBe('que dice esta senal');
    const names = GAMES.map((g) => sortKey(g.nombre));
    expect([...names].sort((a, b) => a.localeCompare(b, 'es'))).toEqual(names);
  });

  it('resume jugadores y edades', () => {
    const rayuela = gameById('rayuela')!;
    expect(playersLabel(rayuela)).toBe('1–8');
    expect(agesLabel(rayuela)).toBe('6+ años');
    expect(playersLabel(gameById('jaula-pajaro-terremoto')!)).toBe('10 o más');
  });
});

describe('destacados', () => {
  it('destacados: 31 juegos, sin repetir y todos en su colección', () => {
    expect(DESTACADOS).toHaveLength(31);
    expect(new Set(DESTACADOS.map((g) => g.id)).size).toBe(31);
    expect(DESTACADOS.every((g) => g.colecciones.includes('destacados'))).toBe(true);
  });

  it('solo los juegos que necesitan ir en coche llevan el icono', () => {
    expect(GAMES.filter((g) => g.soloEnCoche).length).toBeGreaterThan(0);
    expect(gameById('veo-veo')?.soloEnCoche).toBe(false);
  });
});
