import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Easing, Modal, PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings, useTheme } from '../store/settingsStore';
import { gutter, motion, radius, space, type Theme } from './theme';

/** Curvas suaves: entrar decelerando, salir acelerando. Nada de rebotes. */
export const ENTER = Easing.bezier(0.2, 0.7, 0.2, 1);
export const EXIT = Easing.bezier(0.4, 0, 1, 1);

let systemReduced = false;
const listeners = new Set<(v: boolean) => void>();
void AccessibilityInfo.isReduceMotionEnabled()
  .then((v) => {
    systemReduced = v;
    listeners.forEach((l) => l(v));
  })
  .catch(() => undefined);
AccessibilityInfo.addEventListener('reduceMotionChanged', (v) => {
  systemReduced = v;
  listeners.forEach((l) => l(v));
});

/** «Quitar animaciones» del sistema o «Animaciones mínimas» de Opciones: solo fundidos cortos. */
export function useReducedMotion(): boolean {
  const calm = useSettings().calm;
  const [value, setValue] = useState(systemReduced);
  useEffect(() => {
    listeners.add(setValue);
    setValue(systemReduced);
    return () => {
      listeners.delete(setValue);
    };
  }, []);
  return value || calm;
}

/**
 * Cómo entra una pantalla:
 * - rise: sube y crece un poco (abrir una ficha, el asistente).
 * - back: vuelve desde la izquierda (cerrar una pantalla).
 * - left / right: se desliza desde ese lado (cambiar de pestaña).
 * - fade: solo fundido.
 * Con «Animaciones mínimas» o si el móvil lo pide, todo es un fundido corto.
 */
export type Enter = 'rise' | 'back' | 'left' | 'right' | 'fade';

const SHIFT: Record<Enter, { x: number; y: number; scale: number }> = {
  rise: { x: 0, y: 28, scale: 0.97 },
  back: { x: -28, y: 0, scale: 0.99 },
  left: { x: -36, y: 0, scale: 1 },
  right: { x: 36, y: 0, scale: 1 },
  fade: { x: 0, y: 0, scale: 0.99 },
};

/** Anima la entrada de cada pantalla sin librería de navegación: cuando cambia `id`, el contenido nuevo entra. */
export function Scene({ id, enter, children }: { id: string; enter: Enter; children: ReactNode }) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(1)).current;
  const shown = useRef(id);
  const pending = useRef(false);
  const kind = useRef<Enter>(enter);

  if (shown.current !== id) {
    shown.current = id;
    kind.current = enter;
    pending.current = true;
    progress.setValue(0);
  }

  useEffect(() => {
    if (!pending.current) return;
    pending.current = false;
    // Rápida y sutil: 220 ms con frenada suave al final.
    const anim = Animated.timing(progress, { toValue: 1, duration: reduced ? motion.fast : 220, easing: ENTER, useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [id, progress, reduced]);

  const shift = reduced ? SHIFT.fade : SHIFT[kind.current];
  const opacity = progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 1, 1] });
  const transform = reduced
    ? []
    : [
        { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [shift.x, 0] }) },
        { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [shift.y, 0] }) },
        { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [shift.scale, 1] }) },
      ];
  return <Animated.View style={{ flex: 1, opacity, transform }}>{children}</Animated.View>;
}

/** Valor que pasa de 0 a 1 al montar (o al cambiar `key`), para pequeñas entradas dentro de una pantalla. */
export function useEntrance(delay = 0, key: unknown = null): Animated.Value {
  const reduced = useReducedMotion();
  const value = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  useEffect(() => {
    if (reduced) {
      value.setValue(1);
      return;
    }
    value.setValue(0);
    const anim = Animated.timing(value, { toValue: 1, duration: motion.slow, delay, easing: ENTER, useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [delay, key, reduced, value]);
  return value;
}

/** Hoja inferior. Se cierra tocando fuera, deslizando hacia abajo o con «atrás». */
export function Sheet({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const reduced = useReducedMotion();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(open);
  const progress = useRef(new Animated.Value(0)).current;
  const drag = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open) {
      setVisible(true);
      drag.setValue(0);
      Animated.timing(progress, { toValue: 1, duration: reduced ? motion.fast : motion.slow, easing: ENTER, useNativeDriver: true }).start();
    } else if (visible) {
      Animated.timing(progress, { toValue: 0, duration: motion.fast, easing: EXIT, useNativeDriver: true }).start(({ finished }) => {
        if (finished) setVisible(false);
      });
    }
  }, [open, drag, progress, reduced, visible]);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 6 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => drag.setValue(Math.max(0, g.dy)),
      onPanResponderRelease: (_, g) => {
        if (g.dy > 90 || g.vy > 0.8) onCloseRef.current();
        else Animated.spring(drag, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start();
      },
    }),
  ).current;

  if (!visible) return null;
  const translateY = Animated.add(progress.interpolate({ inputRange: [0, 1], outputRange: [reduced ? 0 : height * 0.4, 0] }), drag);
  return (
    <Modal transparent visible animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={onClose}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: theme.c.scrim, opacity: progress }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Cerrar" />
      </Animated.View>
      <Animated.View
        style={[styles.sheet, { maxHeight: height * 0.9, paddingBottom: insets.bottom + space.l, opacity: reduced ? progress : 1, transform: [{ translateY }] }]}
        accessibilityViewIsModal
      >
        <View {...pan.panHandlers} style={styles.handleArea}>
          <View style={styles.handle} />
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
        </View>
        <View style={{ flexShrink: 1 }}>{children}</View>
        {footer}
      </Animated.View>
    </Modal>
  );
}

const makeStyles = ({ c, t }: Theme) =>
  StyleSheet.create({
    sheet: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: c.surface,
      borderTopLeftRadius: radius.sheet,
      borderTopRightRadius: radius.sheet,
      borderTopWidth: c.border,
      borderColor: c.line,
      paddingHorizontal: gutter,
    },
    handleArea: { alignItems: 'center', paddingTop: space.s, paddingBottom: space.m },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: c.lineStrong, marginBottom: space.m },
    title: { ...t.headline, color: c.ink, alignSelf: 'flex-start' },
  });
