import { useMemo, type ReactNode } from 'react';
import { Animated, Image, Pressable, StyleSheet, Switch, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { SECTION_HUE } from '../domain/catalog';
import { describePlayer, type Player, type Shape } from '../domain/players';
import type { Juego } from '../domain/types';
import { useTheme } from '../store/settingsStore';
import { tap } from './feedback';
import { Icon, type IconName } from './icons';
import { ILLUSTRATIONS } from './illustrations';
import { brand, gutter, minTouch, radius, space, WASH_SHAPES, type Hue, type Theme } from './theme';

/** Estilos que dependen del tema: se recalculan solo cuando cambia el estilo o la letra. */
export function useStyles<T>(factory: (theme: Theme) => T): T {
  const theme = useTheme();
  return useMemo(() => factory(theme), [factory, theme]);
}

const PAPER = require('../../assets/papel.png');

export function Screen({ children, style, edges = ['top'] }: { children: ReactNode; style?: StyleProp<ViewStyle>; edges?: Edge[] }) {
  const { c } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={edges}>
      {/* Grano de papel muy suave: se nota de cerca y no estorba al leer. */}
      {c.paper > 0 ? <Image source={PAPER} resizeMode="repeat" style={[StyleSheet.absoluteFill, { width: '100%', height: '100%', tintColor: c.ink, opacity: c.paper }]} accessible={false} /> : null}
      <View style={[{ flex: 1 }, style]}>{children}</View>
    </SafeAreaView>
  );
}

export function SectionLabel({ children, style, icon }: { children: ReactNode; style?: StyleProp<TextStyle>; icon?: IconName }) {
  const { c, t } = useTheme();
  const label = (
    <Text style={[t.overline, { color: c.inkSoft }, !icon && style]} accessibilityRole="header">
      {children}
    </Text>
  );
  if (!icon) return label;
  // icono pequeño en el color del rótulo: orienta sin llamar la atención
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 6 }, style as StyleProp<ViewStyle>]}>
      <Icon name={icon} size={16} color={c.inkSoft} />
      {label}
    </View>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  style,
  accessibilityHint,
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}) {
  const { c, t } = useTheme();
  const filled = variant === 'primary' || variant === 'danger';
  const bg = variant === 'primary' ? c.ink : variant === 'danger' ? c.danger : 'transparent';
  const fg = filled ? c.onInk : c.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [
        {
          minHeight: 50,
          paddingHorizontal: space.l,
          paddingVertical: space.s,
          borderRadius: radius.pill,
          backgroundColor: bg,
          borderWidth: variant === 'secondary' ? c.border : 0,
          borderColor: c.ink,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: space.s,
          opacity: disabled ? 0.45 : pressed ? 0.78 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {icon && <Icon name={icon} size={20} color={fg} />}
      <Text style={[t.bodyStrong, { color: fg, textAlign: 'center', flexShrink: 1 }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
        {label}
      </Text>
    </Pressable>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  selected,
  size = minTouch,
  style,
}: {
  icon: IconName;
  onPress: () => void;
  label: string;
  selected?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={selected === undefined ? undefined : { selected }}
      hitSlop={4}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: c.surface,
          borderWidth: c.border,
          borderColor: c.line,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      <Icon name={icon} size={22} color={c.ink} />
    </Pressable>
  );
}

/** Etiqueta que se activa y desactiva (filtros, opciones). */
export function Chip({ label, selected, onPress, icon }: { label: string; selected: boolean; onPress: () => void; icon?: IconName }) {
  const { c, t } = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => ({
        minHeight: 44,
        paddingHorizontal: space.l,
        paddingVertical: space.s,
        borderRadius: radius.pill,
        borderWidth: c.border,
        borderColor: selected ? c.ink : c.lineStrong,
        backgroundColor: selected ? c.ink : 'transparent',
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.xs,
        opacity: pressed ? 0.75 : 1,
      })}
    >
      {icon ? <Icon name={icon} size={18} color={selected ? c.onInk : c.ink} /> : selected ? <Icon name="check" size={16} color={c.onInk} /> : null}
      <Text style={[t.label, { color: selected ? c.onInk : c.ink }]}>{label}</Text>
    </Pressable>
  );
}

/** Etiqueta informativa (no se toca). */
export function Tag({ label, icon }: { label: string; icon?: IconName }) {
  const { c, t } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: space.m, paddingVertical: 6, borderRadius: radius.pill, borderWidth: c.border, borderColor: c.line }}>
      {icon && <Icon name={icon} size={16} color={c.inkSoft} />}
      <Text style={[t.caption, { color: c.ink }]}>{label}</Text>
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return <View style={[{ backgroundColor: c.surface, borderRadius: radius.card, borderWidth: c.border, borderColor: c.line, padding: space.l }, style]}>{children}</View>;
}

/** Selector de una opción entre varias (letra, tiempos). */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  format,
  label,
  compact = false,
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  format: (value: T) => string;
  label: string;
  /** Todas las opciones en una sola fila, aunque sean estrechas. */
  compact?: boolean;
}) {
  const { c, t } = useTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={{ flexDirection: 'row', flexWrap: compact ? 'nowrap' : 'wrap', padding: 4, borderRadius: radius.input + 4, backgroundColor: c.surfaceAlt, gap: 4 }}>
      {options.map((o) => {
        const on = o === value;
        return (
          <Pressable
            key={String(o)}
            accessibilityRole="radio"
            accessibilityLabel={format(o)}
            accessibilityState={{ selected: on, checked: on }}
            onPress={() => {
              tap();
              onChange(o);
            }}
            style={{
              flexGrow: 1,
              flexBasis: 0,
              minWidth: compact ? 0 : 72,
              minHeight: 44,
              borderRadius: radius.input,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: compact ? 2 : space.s,
              backgroundColor: on ? c.surface : 'transparent',
              borderWidth: on ? c.border : 0,
              borderColor: c.ink,
            }}
          >
            <Text style={[t.label, { color: on ? c.ink : c.inkSoft, textAlign: 'center' }]}>{format(o)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SwitchRow({ label, hint, value, onChange, last }: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void; last?: boolean }) {
  const { c, t } = useTheme();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ checked: value }}
      onPress={() => {
        tap();
        onChange(!value);
      }}
      style={{ minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: space.m, paddingVertical: space.m, borderBottomWidth: last ? 0 : 1, borderColor: c.line }}
    >
      <View style={{ flex: 1 }}>
        <Text style={[t.bodyStrong, { color: c.ink }]}>{label}</Text>
        {hint ? <Text style={[t.caption, { color: c.inkSoft }]}>{hint}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        importantForAccessibility="no"
        accessible={false}
        trackColor={{ false: c.surfaceAlt, true: c.ink }}
        thumbColor={value ? c.onInk : c.lineStrong}
      />
    </Pressable>
  );
}

export function ProgressBar({ value, hue }: { value: number; hue: Hue }) {
  const { c } = useTheme();
  return (
    <View style={{ height: 8, borderRadius: 4, backgroundColor: c.surfaceAlt, overflow: 'hidden' }} accessible={false}>
      <View style={{ width: `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`, height: 8, borderRadius: 4, backgroundColor: c.hueText[hue] }} />
    </View>
  );
}

/** Mancha de acuarela irregular. */
export function Wash({ hue, variant = 0, style }: { hue: Hue; variant?: number; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  if (c.washOpacity === 0) return null;
  const [a, b, d, e] = WASH_SHAPES[Math.abs(variant) % WASH_SHAPES.length]!;
  return (
    <View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          backgroundColor: brand[hue],
          opacity: c.washOpacity,
          borderTopLeftRadius: `${a}%`,
          borderTopRightRadius: `${b}%`,
          borderBottomRightRadius: `${d}%`,
          borderBottomLeftRadius: `${e}%`,
        } as ViewStyle,
        style,
      ]}
    />
  );
}

const variantOf = (id: string): number => [...id].reduce((n, ch) => n + ch.charCodeAt(0), 0);

/** Dibujo del juego sobre su mancha de color. Si no hay dibujo, un icono grande de la sección. */
/** Espiral de cuaderno encuadernado en el borde de arriba de una tarjeta. Decorativa. */
export function Spiral({ rings = 8 }: { rings?: number }) {
  const { c } = useTheme();
  return (
    <View pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants" style={{ position: 'absolute', top: -9, left: 14, right: 14, flexDirection: 'row', justifyContent: 'space-between' }}>
      {Array.from({ length: rings }, (_, i) => (
        <Svg key={i} width={12} height={20} viewBox="0 0 12 20">
          <Circle cx={5} cy={14} r={2.2} fill={c.bg} stroke={c.line} strokeWidth={1} />
          <Path d="M5 14C5 5 10 3 10 9" stroke={c.lineStrong} strokeOpacity={0.6} strokeWidth={1.6} strokeLinecap="round" fill="none" />
        </Svg>
      ))}
    </View>
  );
}

export function GameArt({ game, height, dim }: { game: Juego; height: number; dim?: boolean }) {
  const { c } = useTheme();
  const source = ILLUSTRATIONS[game.id];
  const hue = SECTION_HUE[game.seccion];
  const v = variantOf(game.id);
  const icon: IconName = game.soloEnCoche ? 'car' : game.materiales.includes('papel') ? 'pencil' : 'people';
  return (
    <View style={{ height, alignItems: 'center', justifyContent: 'center', opacity: dim ? 0.28 : 1 }} accessible={false} importantForAccessibility="no-hide-descendants">
      <Wash hue={hue} variant={v} style={{ top: '14%', bottom: '6%', left: '14%', right: '12%' }} />
      {source ? (
        <Image source={source} resizeMode="contain" style={{ width: '100%', height: '100%', tintColor: c.ink }} />
      ) : (
        <Icon name={icon} size={Math.round(height * 0.42)} color={c.ink} />
      )}
      {game.soloEnCoche ? (
        // Solo los juegos que necesitan ir en coche llevan el coche; los de viaje que valen en cualquier sitio, no.
        <View style={{ position: 'absolute', left: 0, top: 0, width: 30, height: 30, borderRadius: 15, backgroundColor: c.surface, borderWidth: c.border, borderColor: c.ink, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="car" size={18} color={c.ink} />
        </View>
      ) : null}
    </View>
  );
}

/** Sello de goma «Jugado». */
export function Stamp({ date, count, size = 96, rotate = -12, scale }: { date: string; count: number; size?: number; rotate?: number; scale?: Animated.Value }) {
  const { c, t } = useTheme();
  const k = size / 96;
  const transform = [{ rotate: `${rotate}deg` }, ...(scale ? [{ scale: scale.interpolate({ inputRange: [0, 1], outputRange: [1.5, 1] }) }] : [])];
  return (
    <Animated.View
      accessible
      accessibilityLabel={`Jugado ${count === 1 ? 'una vez' : `${count} veces`}, la última el ${date}`}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2.5 * k,
        borderColor: c.stamp,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: c.surface,
        opacity: scale ?? 0.94,
        transform,
      }}
    >
      <View style={{ position: 'absolute', top: 5 * k, left: 5 * k, right: 5 * k, bottom: 5 * k, borderRadius: size, borderWidth: 1.2 * k, borderColor: c.stamp }} />
      <Text style={{ fontFamily: t.overline.fontFamily, fontSize: 10 * k, letterSpacing: 1.4 * k, color: c.stamp }} allowFontScaling={false}>
        JUGADO
      </Text>
      <Text style={{ fontFamily: t.hand.fontFamily, fontSize: 26 * k, lineHeight: 28 * k, color: c.stamp }} allowFontScaling={false}>
        {date}
      </Text>
      {count > 1 ? (
        <Text style={{ fontFamily: t.overline.fontFamily, fontSize: 10 * k, letterSpacing: 1 * k, color: c.stamp }} allowFontScaling={false}>
          × {count}
        </Text>
      ) : null}
    </Animated.View>
  );
}

/** Forma de jugador rellena de su color con borde de tinta. */
export function PlayerShape({ shape, color, size = 28 }: { shape: Shape; color: string; size?: number }) {
  const { c } = useTheme();
  const p = { fill: color, stroke: c.ink, strokeWidth: 1.6, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 26 26" accessible={false}>
      {shape === 'circle' && <Circle cx={13} cy={13} r={10} {...p} />}
      {shape === 'square' && <Rect x={3.5} y={3.5} width={19} height={19} rx={5} {...p} />}
      {shape === 'triangle' && <Path d="M13 3l10.5 19h-21z" {...p} />}
      {shape === 'star' && <Path d="M13 2.5l3.1 6.6 7.2.8-5.4 4.9 1.5 7.1L13 18.3l-6.4 3.6 1.5-7.1-5.4-4.9 7.2-.8z" {...p} />}
      {shape === 'heart' && <Path d="M13 22S3 15.8 3 9.3C3 6.4 5.2 4.3 7.9 4.3c2.2 0 3.9 1.3 5.1 3 1.2-1.7 2.9-3 5.1-3 2.7 0 4.9 2.1 4.9 5 0 6.5-10 12.7-10 12.7z" {...p} />}
      {shape === 'diamond' && <Path d="M13 2.5l9.5 10.5L13 23.5 3.5 13z" {...p} />}
      {shape === 'moon' && <Path d="M16.5 3.1A10 10 0 1 0 22.9 16.5 7.5 7.5 0 0 1 16.5 3.1z" {...p} />}
      {shape === 'drop' && <Path d="M13 2.5S5 11.5 5 16a8 8 0 0 0 16 0c0-4.5-8-13.5-8-13.5z" {...p} />}
      {shape === 'bolt' && <Path d="M15.5 2.5 5.5 14.5h6.5L10 23.5l10.5-12.5h-6.5z" {...p} />}
      {shape === 'cloud' && <Path d="M7.5 20.5h11.5a4.5 4.5 0 0 0 .6-8.96A6.2 6.2 0 0 0 7.8 10.1 5.2 5.2 0 0 0 7.5 20.5z" {...p} />}
      {shape === 'flower' && (
        <>
          {[0, 72, 144, 216, 288].map((a) => (
            <Circle key={a} cx={13 + 5.6 * Math.sin((a * Math.PI) / 180)} cy={13 - 5.6 * Math.cos((a * Math.PI) / 180)} r={4.4} {...p} />
          ))}
          <Circle cx={13} cy={13} r={3.6} {...p} fill={c.surface} />
        </>
      )}
      {shape === 'leaf' && (
        <>
          <Path d="M3.5 22.5C3.5 11 10 4 22.5 3.5 22 16 15 22.5 3.5 22.5z" {...p} />
          <Path d="M3.5 22.5 14 12" {...p} fill="none" />
        </>
      )}
      {shape === 'hexagon' && <Path d="M13 2.5l9.1 5.25v10.5L13 23.5l-9.1-5.25V7.75z" {...p} />}
      {shape === 'cross' && <Path d="M10 3.5h6V10h6.5v6H16v6.5h-6V16H3.5v-6H10z" {...p} />}
      {shape === 'house' && <Path d="M13 3 2.5 12H6v10.5h14V12h3.5z" {...p} />}
      {shape === 'crown' && <Path d="M3.5 20.5 3 7.5l5.5 5L13 4l4.5 8.5 5.5-5-.5 13z" {...p} />}
      {shape === 'bell' && (
        <>
          <Circle cx={13} cy={21} r={2.3} {...p} />
          <Path d="M13 3c-4.2 0-6.5 3.2-6.5 7.5v4.5L3.5 19h19l-3-4v-4.5C19.5 6.2 17.2 3 13 3z" {...p} />
        </>
      )}
      {shape === 'fish' && <Path d="M2.5 13c3-5 9.5-7 14.5-3.5L23 5v16l-6-4.5C12 20 5.5 18 2.5 13z" {...p} />}
      {shape === 'apple' && (
        <>
          <Path d="M13 8.5c-2-1.8-7-2-8.5 2.5-1.5 4.5 1.5 11.5 5 12 1.5.2 2.3-.6 3.5-.6s2 .8 3.5.6c3.5-.5 6.5-7.5 5-12-1.5-4.5-6.5-4.3-8.5-2.5z" {...p} />
          <Path d="M13 8.5c0-2.5 1-4.5 3-5.5" {...p} fill="none" />
        </>
      )}
      {shape === 'pentagon' && <Path d="M13 2.5l10 7.26-3.82 11.74H6.82L3 9.76z" {...p} />}
    </Svg>
  );
}

export function PlayerBadge({ player, size = 28, style }: { player: Player; size?: number; style?: StyleProp<ViewStyle> }) {
  const { c, t } = useTheme();
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: space.s }, style]} accessible accessibilityLabel={describePlayer(player)}>
      <PlayerShape shape={player.shape} color={player.color} size={size} />
      <Text style={[t.hand, { color: c.ink, flexShrink: 1 }]} numberOfLines={1}>
        {player.name}
      </Text>
    </View>
  );
}

export const screenPadding = { paddingHorizontal: gutter } as const;
