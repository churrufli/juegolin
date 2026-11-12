import * as Haptics from 'expo-haptics';
import { getSettings } from '../store/settingsStore';

/** Vibraciones cortas y opcionales (Opciones → Vibración). Nunca bloquean ni fallan. */
export function tap(): void {
  if (!getSettings().vibration) return;
  Haptics.selectionAsync().catch(() => undefined);
}

export function thump(): void {
  if (!getSettings().vibration) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}

export function alarm(): void {
  if (!getSettings().vibration) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
}
