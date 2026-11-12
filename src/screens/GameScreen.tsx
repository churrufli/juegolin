import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { DURATION_SHORT, GAMES, SECTION_HUE, SECTION_LABEL, agesLabel, gameById, playersLabel } from '../domain/catalog';
import { similarTo } from '../domain/recommend';
import { montajeOf } from '../domain/montajes';
import { cheersFor } from '../domain/frases';
import { joinNames } from '../domain/players';
import type { Herramienta, Juego } from '../domain/types';
import { playedSet, shortDate, stampGame, toggleFavorite, unstampGame, useJournal } from '../store/journalStore';
import { dispatchMatch } from '../store/matchStore';
import { useTheme } from '../store/settingsStore';
import { Button, GameArt, IconButton, Screen, Stamp, Tag, useStyles } from '../ui/components';
import { showCelebration } from '../ui/Celebration';
import { askDialog, showNote } from '../ui/Dialog';
import { thump } from '../ui/feedback';
import { Icon } from '../ui/icons';
import { MONTAJE_SVG } from '../ui/montajes';
import { GameStrip } from '../ui/GameStrip';
import { ENTER, useReducedMotion } from '../ui/motion';
import { gutter, radius, space, type Theme } from '../ui/theme';
import { markStamped, popOverlay, pushOverlay, setTab, useUiStore } from '../ui/uiStore';
import { SignSheet } from './SignSheet';
import { SignatureBook } from './SignatureBook';

const TOOL_LABEL: Record<Herramienta, string> = { turnos: 'turnos', marcador: 'marcador', sorteo: 'sorteo', temporizador: 'temporizador' };

export function GameScreen({ id }: { id: string }) {
  const game = gameById(id);
  if (!game) return null;
  return <GameView game={game} />;
}

/** Pone el sello, recoge las firmas, anima la ficha y avisa de las insignias nuevas. */
export function celebrateStamp(game: Juego, playerIds: readonly string[] = [], winners: readonly string[] = []): void {
  const { earned, newSigners } = stampGame(game.id, playerIds, winners);
  markStamped(game.id);
  thump();
  const people = useJournal.getState().players;
  const names = newSigners.map((id) => people.find((p) => p.id === id)?.name).filter((n): n is string => !!n);
  const body = names.length > 0 ? `${joinNames(names)} ${names.length === 1 ? 'firma' : 'firman'} en ${game.nombre}.` : `${game.nombre} ya está en tu cuaderno.`;
  const first = earned[0];
  showNote(first ? `¡Insignia nueva: ${first.badge.title}!` : '¡Sello nuevo!', body);
  const cheers = cheersFor(winners.length, playerIds.length);
  if (cheers) showCelebration(game.nombre, cheers);
}

function GameView({ game }: { game: Juego }) {
  const theme = useTheme();
  const { c } = theme;
  const s = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const play = useJournal((st) => st.plays[game.id]);
  const favorite = useJournal((st) => st.favorites.includes(game.id));
  const justStamped = useUiStore((st) => st.justStamped === game.id);
  const stampIn = useRef(new Animated.Value(1)).current;
  const hue = SECTION_HUE[game.seccion];
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    if (!justStamped) return;
    markStamped(null);
    if (reduced) return;
    stampIn.setValue(0);
    Animated.timing(stampIn, { toValue: 1, duration: 260, easing: ENTER, useNativeDriver: true }).start();
  }, [justStamped, reduced, stampIn]);

  const startMatch = () => {
    dispatchMatch({ type: 'setup', gameId: game.id, players: [] });
    pushOverlay({ name: 'play', gameId: game.id });
  };

  const removeStamp = async () => {
    const ok = await askDialog('¿Quitar el sello?', `${game.nombre} volverá a aparecer como no jugado.`, 'Quitar sello', { destructive: true, icon: 'seal' });
    if (ok) unstampGame(game.id);
  };

  const steps: { title: string; items: readonly string[] }[] = [
    { title: 'Preparación', items: game.pasos.preparacion },
    { title: 'Cómo se juega', items: game.pasos.comoSeJuega },
    { title: 'Cómo se gana', items: game.pasos.comoSeGana },
  ];

  return (
    <Screen>
      <View style={s.topBar}>
        <View style={{ flexDirection: 'row', gap: space.s }}>
          <IconButton icon="back" label="Volver" onPress={popOverlay} />
          <IconButton icon="house" label="Ir al inicio" onPress={() => setTab('explore')} />
        </View>
        <IconButton
          icon={favorite ? 'bookmark-filled' : 'bookmark'}
          label={favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          selected={favorite}
          onPress={() => {
            const on = toggleFavorite(game.id);
            AccessibilityInfo.announceForAccessibility(on ? 'Guardado en favoritos' : 'Quitado de favoritos');
          }}
        />
      </View>
      <ScrollView contentContainerStyle={[s.body, { paddingBottom: 140 + insets.bottom }]}>
        <View>
          <GameArt game={game} height={230} />
          {play ? (
            <Pressable onPress={removeStamp} accessibilityHint="Toca para quitar el sello" style={s.stamp} hitSlop={8}>
              <Stamp date={shortDate(play.last)} count={play.count} size={104} scale={stampIn} />
            </Pressable>
          ) : null}
        </View>
        <Text style={[s.overline, { color: c.hueText[hue] }]}>{SECTION_LABEL[game.seccion]}</Text>
        <Text style={s.title} accessibilityRole="header">
          {game.nombre}
        </Text>
        {game.alias.length > 0 ? <Text style={s.alias}>También: {game.alias.join(', ')}</Text> : null}
        <Text style={s.summary}>{game.resumen}</Text>
        <View style={s.tags}>
          <Tag icon="people" label={`${agesLabel(game)}`} />
          <Tag icon="user-plus" label={`${playersLabel(game)} jugadores`} />
          <Tag icon="clock" label={DURATION_SHORT[game.duracion]} />
          <Tag icon={game.entorno.includes('exterior') ? 'sun' : 'house'} label={game.entorno.map((e) => (e === 'exterior' ? 'Fuera' : 'Dentro')).join(' o ')} />
          <Tag icon="hand" label={game.materiales.includes('ninguno') ? 'Sin material' : game.materialesDetalle} />
          {game.soloEnCoche ? <Tag icon="car" label="Solo yendo en coche" /> : null}
        </View>
        {game.participantes.nota ? <Text style={s.note}>{game.participantes.nota}</Text> : null}

        {play ? <SignatureBook game={game} play={play} /> : null}

        {game.requiereAdulto || game.seguridad ? (
          <View style={s.safety} accessible accessibilityRole="summary">
            <Icon name={game.seguridad ? 'warning' : 'adult'} size={26} color={c.danger} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={s.safetyTitle}>{game.seguridad ? 'Ojo con la seguridad' : 'Con un adulto'}</Text>
              {game.seguridad ? <Text style={s.safetyText}>{game.seguridad}</Text> : null}
              {game.requiereAdulto ? <Text style={s.safetyText}>Este juego necesita que un adulto lo organice.</Text> : null}
            </View>
          </View>
        ) : null}

        <MontajeCard game={game} />

        {steps.map((step, i) => (
          <View key={step.title} style={s.step}>
            <View style={s.stepHead}>
              <View style={s.stepNumber}>
                <Text style={s.stepNumberText}>{i + 1}</Text>
              </View>
              <Text style={s.stepTitle} accessibilityRole="header">
                {step.title}
              </Text>
            </View>
            {step.items.map((item, j) => (
              <View key={j} style={s.bullet}>
                <View style={s.dot} />
                <Text style={s.stepText}>{item}</Text>
              </View>
            ))}
          </View>
        ))}

        {game.variantes.length > 0 ? (
          <View style={s.variants}>
            <View style={s.stepHead}>
              <Icon name="shuffle" size={24} color={c.ink} />
              <Text style={s.stepTitle} accessibilityRole="header">
                Otras formas de jugar
              </Text>
            </View>
            {game.variantes.map((v, j) => (
              <View key={j} style={s.bullet}>
                <View style={s.dot} />
                <Text style={s.stepText}>{v}</Text>
              </View>
            ))}
          </View>
        ) : null}
        <SimilarGames game={game} />
      </ScrollView>

      <View style={[s.actions, { paddingBottom: insets.bottom + space.l }]}>
        {game.herramientas.length > 0 ? (
          <Button
            label="Empezar"
            icon="play"
            onPress={startMatch}
            accessibilityHint={`Abre el asistente con ${game.herramientas.map((h) => TOOL_LABEL[h]).join(', ')}`}
            style={{ flex: 1 }}
          />
        ) : null}
        <Button label={play ? 'Otra vez' : 'Ya jugado'} icon="seal" variant="secondary" onPress={() => setSigning(true)} accessibilityHint="Elige quién ha jugado y pon el sello" style={{ flex: 1 }} />
      </View>
      <SignSheet
        game={game}
        open={signing}
        onClose={() => setSigning(false)}
        onSign={(ids, winners) => {
          setSigning(false);
          celebrateStamp(game, ids, winners);
        }}
      />
    </Screen>
  );
}

/** «Si os ha gustado, probad…»: juegos parecidos, primero los que aún no habéis jugado. */
function SimilarGames({ game }: { game: Juego }) {
  const { c } = useTheme();
  const s = useStyles(makeStyles);
  const plays = useJournal((st) => st.plays);
  // sin los juegos de los que venimos: si no, el primero suele ser la ficha anterior
  const visited = useUiStore((st) => st.overlays.map((o) => (o.name === 'game' ? o.id : '')).join(' '));
  const similar = useMemo(() => {
    const skip = new Set(visited.split(' '));
    return similarTo(game, GAMES.filter((g) => !skip.has(g.id)), playedSet(plays), 6);
  }, [game, plays, visited]);
  return (
    <View style={s.variants}>
      <View style={s.stepHead}>
        <Icon name="spark" size={24} color={c.ink} />
        <Text style={s.stepTitle} accessibilityRole="header">
          Si os gusta, probad también
        </Text>
      </View>
      <GameStrip games={similar} label={`Juegos parecidos a ${game.nombre}`} />
    </View>
  );
}

/** Cómo se dibuja la rayuela en el suelo, cómo se monta el campo… con su dibujo si lo hay. */
function MontajeCard({ game }: { game: Juego }) {
  const { c } = useTheme();
  const s = useStyles(makeStyles);
  const montaje = montajeOf(game.id);
  if (!montaje) return null;
  const raw = MONTAJE_SVG[game.id];
  // El esquema viene en tinta y papel fijos: se pintan con los colores del tema (sirve en Pizarra y Contraste alto).
  const xml = useMemo(() => raw?.replaceAll('#2B2724', c.ink).replaceAll('#FFFFFF', c.surface), [raw, c.ink, c.surface]);
  return (
    <View style={s.step}>
      <View style={s.stepHead}>
        <Icon name="chalk" size={26} color={c.ink} />
        <Text style={s.stepTitle} accessibilityRole="header">
          {montaje.titulo}
        </Text>
      </View>
      {xml ? (
        <View style={s.montaje} accessible accessibilityRole="image" accessibilityLabel={`Esquema: ${montaje.titulo.toLowerCase()} ${game.nombre}. Los números del dibujo son los pasos de abajo.`}>
          <SvgXml xml={xml} width="100%" height="100%" />
        </View>
      ) : null}
      {montaje.pasos.map((paso, j) => (
        <View key={j} style={s.bullet}>
          <View style={s.montajeNumber}>
            <Text style={s.montajeNumberText}>{j + 1}</Text>
          </View>
          <Text style={s.stepText}>{paso}</Text>
        </View>
      ))}
    </View>
  );
}

const makeStyles = ({ c, t }: Theme) =>
  StyleSheet.create({
    topBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: gutter - 4, paddingTop: space.s },
    body: { paddingHorizontal: gutter, gap: space.m },
    stamp: { position: 'absolute', right: 0, bottom: -6 },
    overline: { ...t.overline, marginTop: space.s },
    title: { ...t.display, color: c.ink, marginTop: -space.xs },
    alias: { ...t.caption, color: c.inkSoft },
    summary: { ...t.body, color: c.ink },
    tags: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
    note: { ...t.caption, color: c.inkSoft },
    safety: { flexDirection: 'row', gap: space.m, padding: space.l, borderRadius: radius.card, borderWidth: c.border, borderColor: c.danger, backgroundColor: c.surface, alignItems: 'flex-start' },
    safetyTitle: { ...t.bodyStrong, color: c.ink },
    safetyText: { ...t.body, color: c.ink },
    step: { gap: space.s, backgroundColor: c.surface, borderRadius: radius.card, borderWidth: c.border, borderColor: c.line, padding: space.l },
    stepHead: { flexDirection: 'row', alignItems: 'center', gap: space.m, marginBottom: space.xs },
    stepNumber: { width: 34, height: 34, borderRadius: 17, borderWidth: c.border, borderColor: c.ink, alignItems: 'center', justifyContent: 'center' },
    stepNumberText: { ...t.title, color: c.ink },
    stepTitle: { ...t.title, color: c.ink, flexShrink: 1 },
    bullet: { flexDirection: 'row', gap: space.m, alignItems: 'flex-start' },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.inkSoft, marginTop: 10 },
    stepText: { ...t.body, color: c.ink, flex: 1 },
    variants: { gap: space.s, paddingTop: space.s },
    montaje: { width: '100%', aspectRatio: 4 / 3, marginVertical: space.xs },
    montajeNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
    montajeNumberText: { ...t.label, color: c.bg },
    actions: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: space.m, paddingHorizontal: gutter, paddingTop: space.m, backgroundColor: c.bg, borderTopWidth: 1, borderColor: c.line },
  });
