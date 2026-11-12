import { PLAYER_COLORS } from '../../domain/players';
import { HUES, PALETTES, STYLE_NAMES } from '../theme';

const luminance = (hex: string): number => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
};

const contrast = (a: string, b: string): number => {
  const [lo, hi] = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (hi! + 0.05) / (lo! + 0.05);
};

describe.each(STYLE_NAMES)('contraste WCAG AA del estilo %s', (name) => {
  const p = PALETTES[name];
  const grounds: [string, string][] = [
    ['fondo', p.bg],
    ['tarjeta', p.surface],
  ];

  it.each(grounds)('texto y secundario ≥ 4,5:1 sobre %s', (_, bg) => {
    expect(contrast(p.ink, bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(p.inkSoft, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it('secundario ≥ 4,5:1 sobre la pista de los selectores', () => {
    expect(contrast(p.inkSoft, p.surfaceAlt)).toBeGreaterThanOrEqual(4.5);
  });

  it('texto del botón principal ≥ 4,5:1', () => {
    expect(contrast(p.onInk, p.ink)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(p.onInk, p.danger)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(grounds)('sellos, avisos y bordes de control sobre %s', (_, bg) => {
    expect(contrast(p.stamp, bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(p.danger, bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(p.lineStrong, bg)).toBeGreaterThanOrEqual(3);
  });

  it.each(HUES)('texto de color %s ≥ 4,5:1 sobre fondo y tarjeta', (hue) => {
    expect(contrast(p.hueText[hue], p.bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(p.hueText[hue], p.surface)).toBeGreaterThanOrEqual(4.5);
  });

  it('texto de la notita ≥ 4,5:1', () => {
    expect(contrast(p.ink, p.note)).toBeGreaterThanOrEqual(4.5);
  });
});

it.each(PLAYER_COLORS)('la tinta oscura se lee sobre el color de jugador $label', ({ hex }) => {
  expect(contrast('#2B2724', hex)).toBeGreaterThanOrEqual(4.5);
});
