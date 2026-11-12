import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Modal, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Player } from '../domain/players';
import { useTheme } from '../store/settingsStore';
import { Button, Chip, Screen, useStyles } from '../ui/components';
import { thump, tap } from '../ui/feedback';
import { useReducedMotion } from '../ui/motion';
import { brand, gutter, space, type Theme } from '../ui/theme';

const RING = 112;
const WAIT_MS = 2200;
const COLORS = [brand.coral, brand.turquoise, brand.yellow, brand.green];

interface Finger {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly color: string;
}

/**
 * «Un dedo cada uno»: todos ponen un dedo en la pantalla, se espera un momento quietos
 * y la app escoge uno al azar. Luego se puede decir de quién era para que empiece.
 */
export function FingerPicker({ open, players, onClose, onPick }: { open: boolean; players: readonly Player[]; onClose: () => void; onPick: (id: string) => void }) {
  const { c } = useTheme();
  const s = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const [fingers, setFingers] = useState<readonly Finger[]>([]);
  const [chosen, setChosen] = useState<string | null>(null);
  const colorOf = useRef(new Map<string, string>());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spin = useRef(new Animated.Value(0)).current;
  const grow = useRef(new Animated.Value(0)).current;
  const countdown = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!open || reduced) return;
    const loop = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [open, reduced, spin]);

  const reset = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    colorOf.current.clear();
    setFingers([]);
    setChosen(null);
    grow.setValue(0);
    countdown.setValue(0);
  };
  useEffect(() => {
    if (!open) reset();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const choose = (list: readonly Finger[]) => {
    const winner = list[Math.floor(Math.random() * list.length)]!;
    setChosen(winner.id);
    thump();
    AccessibilityInfo.announceForAccessibility('Ya está: empieza el dedo que se ha quedado en la pantalla');
    grow.setValue(0);
    Animated.spring(grow, { toValue: 1, useNativeDriver: true, bounciness: 9, speed: 7 }).start();
  };

  const track = (e: GestureResponderEvent) => {
    if (chosen) {
      // con el dedo ya elegido, solo esperamos a que todos levanten la mano
      if (e.nativeEvent.touches.length === 0) setFingers((f) => f.filter((x) => x.id === chosen));
      return;
    }
    const next = Array.from(e.nativeEvent.touches).map((t) => {
      const id = String(t.identifier);
      if (!colorOf.current.has(id)) colorOf.current.set(id, COLORS[colorOf.current.size % COLORS.length]!);
      return { id, x: t.pageX, y: t.pageY, color: colorOf.current.get(id)! };
    });
    const changed = next.length !== fingers.length || next.some((f) => !fingers.find((g) => g.id === f.id));
    setFingers(next);
    if (!changed) return;
    if (next.length > fingers.length) tap();
    if (timer.current) clearTimeout(timer.current);
    countdown.stopAnimation();
    countdown.setValue(0);
    if (next.length >= 2) {
      Animated.timing(countdown, { toValue: 1, duration: WAIT_MS, easing: Easing.linear, useNativeDriver: false }).start();
      timer.current = setTimeout(() => choose(next), WAIT_MS);
    }
  };

  const message = chosen
    ? '¡Este dedo empieza!'
    : fingers.length === 0
      ? 'Poned todos un dedo en la pantalla'
      : fingers.length === 1
        ? 'Falta alguien más…'
        : '¡Quietos! No levantéis el dedo…';

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Modal visible={open} animationType={reduced ? 'none' : 'fade'} statusBarTranslucent navigationBarTranslucent onRequestClose={onClose}>
      <Screen edges={['top', 'bottom']}>
        <View style={StyleSheet.absoluteFill} onTouchStart={track} onTouchMove={track} onTouchEnd={track} onTouchCancel={track} />
        {fingers.map((f) => {
          const won = chosen === f.id;
          const lost = chosen !== null && !won;
          return (
            <Animated.View
              key={f.id}
              pointerEvents="none"
              style={[
                s.finger,
                {
                  left: f.x - RING / 2,
                  top: f.y - RING / 2 - insets.top,
                  opacity: lost ? 0.12 : 1,
                  transform: won ? [{ scale: grow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] }) }] : [],
                },
              ]}
            >
              <View style={[s.fill, { backgroundColor: f.color }]} />
              <Animated.View style={[s.dashed, { borderColor: c.ink, transform: [{ rotate }] }]} />
              <View style={[s.dot, { backgroundColor: c.ink }]} />
              {won && !reduced ? (
                <Animated.View
                  style={[
                    s.burst,
                    { borderColor: f.color, opacity: grow.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }), transform: [{ scale: grow.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] }) }] },
                  ]}
                />
              ) : null}
              {won ? <Text style={s.you}>¡Tú!</Text> : null}
            </Animated.View>
          );
        })}
        <View pointerEvents="box-none" style={[s.top, { paddingTop: space.l }]}>
          <Text style={s.title} accessibilityRole="header" accessibilityLiveRegion="polite">
            {message}
          </Text>
          {!chosen ? (
            <Text style={s.hint}>Cuando estéis todos, quedaos quietos un momento y la app elegirá un dedo al azar.</Text>
          ) : null}
          {!chosen && fingers.length >= 2 ? (
            <View style={s.bar}>
              <Animated.View style={[s.barFill, { width: countdown.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
            </View>
          ) : null}
        </View>
        {chosen && fingers.length <= 1 ? (
          <View style={[s.bottom, { paddingBottom: space.l }]}>
            {players.length > 0 ? (
              <>
                <Text style={s.question}>¿De quién era el dedo?</Text>
                <View style={s.chips}>
                  {players.map((p) => (
                    <Chip key={p.id} label={p.name} icon="check" selected={false} onPress={() => onPick(p.id)} />
                  ))}
                </View>
              </>
            ) : null}
            <View style={{ flexDirection: 'row', gap: space.m }}>
              <Button label="Otra vez" icon="reset" variant="secondary" onPress={reset} style={{ flex: 1 }} />
              <Button label="Cerrar" onPress={onClose} style={{ flex: 1 }} />
            </View>
          </View>
        ) : !chosen && fingers.length === 0 ? (
          <View style={[s.bottom, { paddingBottom: space.l }]}>
            <Button label="Cerrar" variant="secondary" onPress={onClose} />
          </View>
        ) : null}
      </Screen>
    </Modal>
  );
}

const makeStyles = ({ c, t }: Theme) =>
  StyleSheet.create({
    top: { position: 'absolute', left: 0, right: 0, top: 0, paddingHorizontal: gutter, gap: space.s, alignItems: 'center' },
    title: { ...t.handLarge, color: c.ink, textAlign: 'center' },
    hint: { ...t.body, color: c.inkSoft, textAlign: 'center' },
    bar: { width: '70%', height: 8, borderRadius: 4, backgroundColor: c.surfaceAlt, overflow: 'hidden', marginTop: space.s },
    barFill: { height: 8, borderRadius: 4, backgroundColor: c.ink },
    bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: gutter, gap: space.m, backgroundColor: c.bg, paddingTop: space.l, borderTopWidth: 1, borderColor: c.line },
    question: { ...t.title, color: c.ink },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
    finger: { position: 'absolute', width: RING, height: RING, alignItems: 'center', justifyContent: 'center' },
    fill: { position: 'absolute', width: RING, height: RING, borderRadius: RING / 2, opacity: 0.85, borderWidth: c.border + 1, borderColor: c.ink },
    dashed: { position: 'absolute', width: RING - 22, height: RING - 22, borderRadius: (RING - 22) / 2, borderWidth: 2, borderStyle: 'dashed' },
    dot: { width: 10, height: 10, borderRadius: 5 },
    burst: { position: 'absolute', width: RING, height: RING, borderRadius: RING / 2, borderWidth: 6 },
    you: { ...t.hand, position: 'absolute', bottom: -34, color: c.ink, transform: [{ rotate: '-6deg' }] },
  });
