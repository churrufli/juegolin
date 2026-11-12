import type { TextStyle } from 'react-native';

/**
 * Tokens de Juegolín: «cuaderno de papiro». Tinta suave sobre papel viejo.
 * Regla 90/10: el texto y los fondos son siempre papel y tinta; los cinco colores de la marca solo
 * aparecen como manchas detrás de los dibujos, en los jugadores y en los sellos.
 * Los contrastes de cada estilo se comprueban en src/ui/__tests__/theme.test.ts.
 */

/** Los cinco colores de la marca (logo). */
export const brand = {
  turquoise: '#85E9E1',
  coral: '#FB645D',
  yellow: '#FFE461',
  green: '#9DDE60',
  white: '#FDFBFF',
} as const;

export type Hue = 'turquoise' | 'coral' | 'yellow' | 'green';
export const HUES: readonly Hue[] = ['turquoise', 'coral', 'yellow', 'green'];

export type StyleName = 'papiro' | 'pizarra' | 'lapices' | 'contraste';
export const STYLE_NAMES: readonly StyleName[] = ['papiro', 'pizarra', 'lapices', 'contraste'];

export interface Palette {
  readonly label: string;
  readonly description: string;
  readonly dark: boolean;
  /** Fondo de todas las pantallas. */
  readonly bg: string;
  /** Tarjetas, diálogos, barra inferior. */
  readonly surface: string;
  /** Pistas de selectores, barras de progreso vacías. */
  readonly surfaceAlt: string;
  /** Texto principal, iconos y relleno del botón principal. */
  readonly ink: string;
  /** Texto secundario. */
  readonly inkSoft: string;
  /** Texto sobre `ink` (botón principal, chip activo). */
  readonly onInk: string;
  /** Bordes decorativos de tarjetas. */
  readonly line: string;
  /** Bordes de controles (≥ 3:1 sobre bg y surface). */
  readonly lineStrong: string;
  /** Grosor de bordes de controles. */
  readonly border: number;
  /** Manchas de color detrás de los dibujos. 0 = sin manchas. */
  readonly washOpacity: number;
  /** Opacidad del grano de papel del fondo (0 = liso). */
  readonly paper: number;
  /** Color de texto para cada tono, legible sobre bg y surface. */
  readonly hueText: Readonly<Record<Hue, string>>;
  /** Tinta de los sellos y de los avisos. */
  readonly stamp: string;
  readonly danger: string;
  /** Fondo del velo de los diálogos. */
  readonly scrim: string;
  /** Papel de las notitas. */
  readonly note: string;
}

export const PALETTES: Record<StyleName, Palette> = {
  papiro: {
    label: 'Papiro',
    description: 'Tinta sobre papel viejo',
    dark: false,
    bg: '#F5EDDB',
    surface: '#FDFBFF',
    surfaceAlt: '#EBDFC6',
    ink: '#2B2724',
    inkSoft: '#5E564D',
    onInk: '#FDFBFF',
    line: '#DDD0B6',
    lineStrong: '#8A7E6E',
    border: 1.5,
    washOpacity: 0.6,
    paper: 0.07,
    hueText: { turquoise: '#1D6E68', coral: '#B23A33', yellow: '#7A5F00', green: '#40701A' },
    stamp: '#B23A33',
    danger: '#B23A33',
    scrim: 'rgba(43,39,36,0.45)',
    note: '#FFF4B8',
  },
  pizarra: {
    label: 'Pizarra',
    description: 'Tiza sobre verde, para la noche',
    dark: true,
    bg: '#1E2725',
    surface: '#28332F',
    surfaceAlt: '#34403C',
    ink: '#EDE8DC',
    inkSoft: '#BDB7AA',
    onInk: '#1E2725',
    line: '#3B4844',
    lineStrong: '#84918B',
    border: 1.5,
    washOpacity: 0.22,
    paper: 0.08,
    hueText: { turquoise: '#85E9E1', coral: '#FF9E98', yellow: '#FFE461', green: '#B5E88A' },
    stamp: '#FF9E98',
    danger: '#FF9E98',
    scrim: 'rgba(0,0,0,0.6)',
    note: '#3B4632',
  },
  lapices: {
    label: 'Lápices',
    description: 'Más color, para los peques',
    dark: false,
    bg: '#FFFDF6',
    surface: '#FFFFFF',
    surfaceAlt: '#F1ECDF',
    ink: '#2B2724',
    inkSoft: '#5E564D',
    onInk: '#FFFFFF',
    line: '#E6DECB',
    lineStrong: '#8A7E6E',
    border: 1.5,
    washOpacity: 0.9,
    paper: 0.05,
    hueText: { turquoise: '#1D6E68', coral: '#B23A33', yellow: '#7A5F00', green: '#40701A' },
    stamp: '#B23A33',
    danger: '#B23A33',
    scrim: 'rgba(43,39,36,0.45)',
    note: '#FFF0A0',
  },
  contraste: {
    label: 'Contraste alto',
    description: 'Blanco y negro puros',
    dark: false,
    bg: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceAlt: '#E6E6E6',
    ink: '#000000',
    inkSoft: '#1F1F1F',
    onInk: '#FFFFFF',
    line: '#000000',
    lineStrong: '#000000',
    border: 2,
    washOpacity: 0,
    paper: 0,
    hueText: { turquoise: '#00524D', coral: '#8E1A12', yellow: '#4D3B00', green: '#244A0B' },
    stamp: '#000000',
    danger: '#8E1A12',
    scrim: 'rgba(0,0,0,0.7)',
    note: '#FFFFFF',
  },
};

export type TypeName = 'cuento' | 'redonda' | 'grande';
export const TYPE_NAMES: readonly TypeName[] = ['cuento', 'redonda', 'grande'];
export const TYPE_LABELS: Record<TypeName, string> = { cuento: 'Cuento', redonda: 'Redonda', grande: 'Grande' };

export const fonts = {
  storyMedium: 'Fraunces_500Medium',
  storySemibold: 'Fraunces_500Medium',
  body: 'Nunito_400Regular',
  bodySemibold: 'Nunito_700Bold',
  bodyBold: 'Nunito_700Bold',
  bodyHeavy: 'Nunito_800ExtraBold',
  hand: 'Caveat_700Bold',
} as const;

export interface TypeScale {
  readonly display: TextStyle;
  readonly headline: TextStyle;
  readonly title: TextStyle;
  readonly body: TextStyle;
  readonly bodyStrong: TextStyle;
  readonly label: TextStyle;
  readonly caption: TextStyle;
  readonly overline: TextStyle;
  readonly hand: TextStyle;
  readonly handLarge: TextStyle;
}

/** Escala tipográfica. «Cuento» usa Fraunces en los titulares; «Redonda», Nunito; «Grande», Nunito un 20 % mayor. */
export function typeScale(name: TypeName): TypeScale {
  const k = name === 'grande' ? 1.2 : 1;
  const story = name === 'cuento';
  const s = (n: number) => Math.round(n * k);
  const heading = (size: number, lh: number): TextStyle =>
    story
      ? { fontFamily: fonts.storyMedium, fontSize: s(size), lineHeight: s(lh), letterSpacing: -0.3 }
      : { fontFamily: fonts.bodyHeavy, fontSize: s(size - 2), lineHeight: s(lh), letterSpacing: -0.3 };
  return {
    display: heading(36, 42),
    headline: heading(28, 34),
    title: story ? { fontFamily: fonts.storySemibold, fontSize: s(19), lineHeight: s(24) } : { fontFamily: fonts.bodyHeavy, fontSize: s(18), lineHeight: s(24) },
    body: { fontFamily: fonts.body, fontSize: s(16), lineHeight: s(24) },
    bodyStrong: { fontFamily: fonts.bodyBold, fontSize: s(16), lineHeight: s(24) },
    label: { fontFamily: fonts.bodyBold, fontSize: s(14), lineHeight: s(20) },
    caption: { fontFamily: fonts.bodySemibold, fontSize: s(13), lineHeight: s(18) },
    overline: { fontFamily: fonts.bodyHeavy, fontSize: s(12), lineHeight: s(16), letterSpacing: 1.2, textTransform: 'uppercase' },
    hand: { fontFamily: fonts.hand, fontSize: s(24), lineHeight: s(28), paddingRight: 4 },
    handLarge: { fontFamily: fonts.hand, fontSize: s(40), lineHeight: s(44), paddingRight: 6 },
  };
}

export interface Theme {
  readonly name: StyleName;
  readonly c: Palette;
  readonly t: TypeScale;
}

export const makeTheme = (style: StyleName, type: TypeName): Theme => ({ name: style, c: PALETTES[style], t: typeScale(type) });

/** Escala de 4 dp. */
export const space = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32 } as const;

/** Margen lateral de todas las pantallas. */
export const gutter = 20;

export const radius = { sm: 10, input: 16, card: 22, sheet: 28, pill: 999 } as const;

/** Objetivo táctil mínimo (Android/Material). */
export const minTouch = 48;

/** Duraciones de movimiento (ms). Tranquilas a propósito. */
export const motion = { fast: 160, base: 260, slow: 340 } as const;

/** Formas irregulares de las manchas de acuarela (radios por esquina, en % del lado). */
export const WASH_SHAPES: readonly (readonly [number, number, number, number])[] = [
  [58, 42, 50, 50],
  [44, 56, 48, 52],
  [50, 46, 56, 44],
  [54, 48, 42, 58],
];
