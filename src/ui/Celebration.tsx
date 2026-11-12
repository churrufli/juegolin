import { useEffect, useMemo, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, Modal, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { create } from 'zustand';
import type { Cheers } from '../domain/frases';
import { useTheme } from '../store/settingsStore';
import { Button, Screen, Wash, useStyles } from './components';
import { Icon } from './icons';
import { useReducedMotion } from './motion';
import { brand, gutter, radius, space, type Theme } from './theme';

interface Party {
  readonly id: number;
  readonly game: string;
  readonly cheers: Cheers;
}

const useParty = create<{ party: Party | null }>()(() => ({ party: null }));
let nextId = 1;

/** Pantalla de celebración al terminar la partida: confeti de papel y frases para quien gana, para el resto y para todos. */
export function showCelebration(game: string, cheers: Cheers): void {
  useParty.setState({ party: { id: nextId++, game, cheers } });
}

const close = (): void => useParty.setState({ party: null });

export function CelebrationHost() {
  const party = useParty((s) => s.party);
  if (!party) return null;
  return <CelebrationView key={party.id} party={party} />;
}

const COLORS = [brand.coral, brand.turquoise, brand.yellow, brand.green];
const PIECES = 26;

function CelebrationView({ party }: { party: Party }) {
  const s = useStyles(makeStyles);
  const reduced = useReducedMotion();
  const { cheers } = party;

  useEffect(() => {
    const parts = [cheers.winners, cheers.others, cheers.all].filter(Boolean).join(' ');
    AccessibilityInfo.announceForAccessibility(`Partida terminada. ${parts}`);
  }, [cheers]);

  return (
    <Modal visible animationType={reduced ? 'none' : 'fade'} statusBarTranslucent navigationBarTranslucent onRequestClose={close}>
      <Screen edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={s.body}>
          <View style={s.badge}>
            <Wash hue="yellow" variant={party.id} style={{ left: -14, top: -14, right: -14, bottom: -14 }} />
            <View style={{ zIndex: 1 }}>
              <Icon name="star" size={44} color={s.title.color as string} />
            </View>
          </View>
          <Text style={s.overline}>{party.game}</Text>
          <Text style={s.title} accessibilityRole="header">
            ¡Partida terminada!
          </Text>
          <View style={s.card}>
            <Text style={s.label}>Para quien ha ganado</Text>
            <Text style={s.big}>{cheers.winners}</Text>
          </View>
          {cheers.others ? (
            <View style={s.card}>
              <Text style={s.label}>Para los demás</Text>
              <Text style={s.phrase}>{cheers.others}</Text>
            </View>
          ) : null}
          <View style={s.card}>
            <Text style={s.label}>Para todos</Text>
            <Text style={s.phrase}>{cheers.all}</Text>
          </View>
        </ScrollView>
        {reduced ? null : <Confetti />}
        <View style={s.footer}>
          <Button label="¡A por otra!" icon="play" onPress={close} />
        </View>
      </Screen>
    </Modal>
  );
}

/** Trocitos de papel de colores que caen una sola vez, despacio. */
function Confetti() {
  const { width, height } = useWindowDimensions();
  const { c } = useTheme();
  const pieces = useMemo(
    () =>
      Array.from({ length: PIECES }, (_, i) => ({
        x: Math.random() * width,
        w: 8 + Math.random() * 6,
        h: 12 + Math.random() * 8,
        color: COLORS[i % COLORS.length]!,
        spin: (Math.random() < 0.5 ? -1 : 1) * (180 + Math.random() * 360),
        sway: (Math.random() - 0.5) * 80,
        delay: Math.random() * 900,
        duration: 2600 + Math.random() * 1400,
      })),
    [width],
  );
  const fall = useRef(pieces.map(() => new Animated.Value(0))).current;
  useEffect(() => {
    const anims = fall.map((v, i) => Animated.timing(v, { toValue: 1, duration: pieces[i]!.duration, delay: pieces[i]!.delay, easing: Easing.out(Easing.quad), useNativeDriver: true }));
    Animated.parallel(anims).start();
    return () => anims.forEach((a) => a.stop());
  }, [fall, pieces]);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessible={false} importantForAccessibility="no-hide-descendants">
      {pieces.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: p.x,
            top: -30,
            width: p.w,
            height: p.h,
            borderRadius: 2,
            backgroundColor: p.color,
            borderWidth: 1,
            borderColor: c.ink,
            opacity: fall[i]!.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] }),
            transform: [
              { translateY: fall[i]!.interpolate({ inputRange: [0, 1], outputRange: [0, height + 60] }) },
              { translateX: fall[i]!.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, p.sway, p.sway / 2] }) },
              { rotate: fall[i]!.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.spin}deg`] }) },
            ],
          }}
        />
      ))}
    </View>
  );
}

const makeStyles = ({ c, t }: Theme) =>
  StyleSheet.create({
    body: { paddingHorizontal: gutter, paddingTop: space.xl, paddingBottom: space.xl, gap: space.m, alignItems: 'stretch' },
    badge: { alignSelf: 'center', width: 84, height: 84, alignItems: 'center', justifyContent: 'center', marginBottom: space.s },
    overline: { ...t.overline, color: c.inkSoft, textAlign: 'center' },
    title: { ...t.display, color: c.ink, textAlign: 'center' },
    card: { gap: space.xs, padding: space.l, borderRadius: radius.card, backgroundColor: c.surface, borderWidth: c.border, borderColor: c.line },
    label: { ...t.overline, color: c.inkSoft },
    big: { ...t.handLarge, color: c.ink },
    phrase: { ...t.hand, color: c.ink },
    footer: { paddingHorizontal: gutter, paddingTop: space.m, paddingBottom: space.l, borderTopWidth: 1, borderColor: c.line },
  });
