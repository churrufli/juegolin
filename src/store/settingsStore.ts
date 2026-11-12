import { Appearance } from 'react-native';
import { create } from 'zustand';
import { jsonFile } from '../storage/jsonFile';
import { STYLE_NAMES, TYPE_NAMES, makeTheme, type StyleName, type Theme, type TypeName } from '../ui/theme';

export interface Settings {
  /** Automático: Papiro con el móvil en modo claro y Pizarra en modo oscuro. */
  readonly auto: boolean;
  /** Estilo elegido a mano (cuando no es automático). */
  readonly style: StyleName;
  readonly type: TypeName;
  /** Animaciones mínimas aunque el sistema no lo pida. */
  readonly calm: boolean;
  readonly vibration: boolean;
}

export const DEFAULT_SETTINGS: Settings = { auto: true, style: 'papiro', type: 'cuento', calm: false, vibration: true };

export function sanitizeSettings(raw: unknown): Settings {
  if (typeof raw !== 'object' || raw === null) return DEFAULT_SETTINGS;
  const r = raw as Record<string, unknown>;
  return {
    // Los ajustes guardados antes de existir «automático» pasan a automático.
    auto: typeof r.auto === 'boolean' ? r.auto : DEFAULT_SETTINGS.auto,
    style: STYLE_NAMES.includes(r.style as StyleName) ? (r.style as StyleName) : DEFAULT_SETTINGS.style,
    type: TYPE_NAMES.includes(r.type as TypeName) ? (r.type as TypeName) : DEFAULT_SETTINGS.type,
    calm: typeof r.calm === 'boolean' ? r.calm : DEFAULT_SETTINGS.calm,
    vibration: typeof r.vibration === 'boolean' ? r.vibration : DEFAULT_SETTINGS.vibration,
  };
}

/** El estilo que se ve: en automático depende del modo claro u oscuro del móvil. */
export const effectiveStyle = (s: Settings, scheme = Appearance.getColorScheme()): StyleName => (s.auto ? (scheme === 'dark' ? 'pizarra' : 'papiro') : s.style);

const themeFor = (s: Settings): Theme => makeTheme(effectiveStyle(s), s.type);

const file = jsonFile('ajustes.json', DEFAULT_SETTINGS, sanitizeSettings);

interface SettingsStore {
  readonly settings: Settings;
  readonly theme: Theme;
  readonly hydrated: boolean;
}

export const useSettingsStore = create<SettingsStore>()(() => ({
  settings: DEFAULT_SETTINGS,
  theme: themeFor(DEFAULT_SETTINGS),
  hydrated: false,
}));

export const getSettings = (): Settings => useSettingsStore.getState().settings;
export const useSettings = (): Settings => useSettingsStore((s) => s.settings);
export const useTheme = (): Theme => useSettingsStore((s) => s.theme);

export async function hydrateSettings(): Promise<void> {
  const settings = await file.read();
  useSettingsStore.setState({ settings, theme: themeFor(settings), hydrated: true });
}

export function updateSettings(patch: Partial<Settings>): Promise<void> {
  const settings = sanitizeSettings({ ...getSettings(), ...patch });
  useSettingsStore.setState({ settings, theme: themeFor(settings) });
  return file.write(settings);
}

// Al cambiar el móvil entre claro y oscuro, el tema automático cambia solo.
Appearance.addChangeListener(() => {
  const { settings } = useSettingsStore.getState();
  if (settings.auto) useSettingsStore.setState({ theme: themeFor(settings) });
});
