import { useKeepAwake } from 'expo-keep-awake';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { gameById } from '../domain/catalog';
import { describePlayer, MAX_NAME, type Player } from '../domain/players';
import { SORTEOS } from '../domain/sorteos';
import type { Herramienta } from '../domain/types';
import { addPlayer, useJournal } from '../store/journalStore';
import { dispatchMatch, leaders, useMatch } from '../store/matchStore';
import { useTheme } from '../store/settingsStore';
import { Button, Card, Chip, IconButton, PlayerBadge, PlayerShape, Screen, SectionLabel, Segmented, Wash, useStyles } from '../ui/components';
import { askDialog, showNote } from '../ui/Dialog';
import { alarm, tap } from '../ui/feedback';
import { Icon, type IconName } from '../ui/icons';
import { ILLUSTRATIONS } from '../ui/illustrations';
import { useReducedMotion } from '../ui/motion';
import { gutter, radius, space, type Theme } from '../ui/theme';
import { popOverlay } from '../ui/uiStore';
import { FingerPicker } from './FingerPicker';
import { celebrateStamp } from './GameScreen';

const ALL_TOOLS: readonly Herramienta[] = ['turnos', 'marcador', 'sorteo', 'temporizador'];
const TOOL_NAME: Record<Herramienta, string> = { turnos: 'Turnos', marcador: 'Puntos', sorteo: 'Sorteo', temporizador: 'Tiempo' };
const TOOL_ICON: Record<Herramienta, IconName> = { turnos: 'next', marcador: 'ten', sorteo: 'shuffle', temporizador: 'timer' };

/** Asistente en directo: turnos, marcador, sorteo y temporizador. Con `gameId` viene de una ficha. */
export function PlayScreen({ gameId }: { gameId: string | null }) {
  useKeepAwake();
  const s = useStyles(makeStyles);
  const match = useMatch();
  const game = gameId ? gameById(gameId) : undefined;
  const suggested = game && game.herramientas.length > 0 ? game.herramientas : ALL_TOOLS;
  // cada herramienta se puede poner y quitar; al principio, las que pide el juego
  const [chosen, setChosen] = useState<readonly Herramienta[] | null>(null);
  const tools = ALL_TOOLS.filter((t) => (chosen ?? suggested).includes(t));
  const toggleTool = (t: Herramienta) => {
    tap();
    setChosen(tools.includes(t) ? tools.filter((x) => x !== t) : [...tools, t]);
  };
  const usesPlayers = tools.includes('turnos') || tools.includes('marcador') || tools.includes('sorteo');
  const [help, setHelp] = useState(false);

  useEffect(() => {
    if (match.gameId !== (gameId ?? null)) dispatchMatch({ type: 'setup', gameId: gameId ?? null, players: [] });
  }, [gameId, match.gameId]);

  const finish = async () => {
    const top = leaders(match);
    const winner = top.length === 1 ? `Ha ganado ${top[0]!.name}.` : top.length > 1 ? `Empate entre ${top.map((p) => p.name).join(' y ')}.` : '';
    const message = game ? `${winner} Firmarán en el cuaderno de ${game.nombre}.`.trim() : winner || 'Se borrarán los puntos de esta partida.';
    const ok = await askDialog('¿Terminamos la partida?', message, game ? 'Terminar y sellar' : 'Terminar', {
      cancel: 'Seguir jugando',
      art: game ? ILLUSTRATIONS[game.id] : undefined,
      icon: 'flag',
    });
    if (!ok) return;
    dispatchMatch({ type: 'reset' });
    if (game) {
      celebrateStamp(game, match.players.map((p) => p.id), top.map((p) => p.id));
      popOverlay();
    }
  };

  return (
    <Screen>
      <View style={s.topBar}>
        {gameId ? <IconButton icon="back" label="Volver a la ficha" onPress={popOverlay} /> : <View />}
        {match.started ? <Button label="Terminar" variant="secondary" onPress={finish} style={{ minHeight: 44 }} /> : null}
      </View>
      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        <View>
          <Text style={s.overline}>{match.started ? `Partida · ronda ${match.round}` : 'Asistente de juego'}</Text>
          <Text style={s.title} accessibilityRole="header">
            {game ? game.nombre : 'Partida rápida'}
          </Text>
        </View>
        <ToolBar tools={tools} onToggle={toggleTool} />
        {!match.started || help ? <HowTo game={!!game} /> : null}
        {usesPlayers && match.started && !match.decided ? <WhoStarts /> : null}
        {usesPlayers ? match.started ? <Running tools={tools} /> : <Setup /> : null}
        {tools.includes('sorteo') && match.started ? <Draw players={match.players} /> : null}
        {tools.includes('temporizador') ? <Timer /> : null}
        {match.started ? (
          <Button label={help ? 'Ocultar la ayuda' : '¿Cómo se usa esta pantalla?'} icon="spark" variant="secondary" onPress={() => setHelp(!help)} />
        ) : null}
      </ScrollView>
    </Screen>
  );
}

/** Las cuatro herramientas como interruptores: se ven las que pide el juego y se pueden poner o quitar. */
function ToolBar({ tools, onToggle }: { tools: readonly Herramienta[]; onToggle: (t: Herramienta) => void }) {
  const theme = useTheme();
  const s = useStyles(makeStyles);
  return (
    <View style={{ gap: space.s }}>
      <View style={s.toolRow} accessibilityRole="toolbar" accessibilityLabel="Herramientas de la partida">
        {ALL_TOOLS.map((t) => {
          const on = tools.includes(t);
          return (
            <Pressable
              key={t}
              accessibilityRole="switch"
              accessibilityLabel={TOOL_NAME[t]}
              accessibilityState={{ checked: on }}
              onPress={() => onToggle(t)}
              style={({ pressed }) => [s.tool, { opacity: pressed ? 0.75 : 1 }]}
            >
              <View style={[s.toolIcon, on && { backgroundColor: theme.c.ink, borderColor: theme.c.ink }]}>
                <Icon name={TOOL_ICON[t]} size={24} color={on ? theme.c.bg : theme.c.inkSoft} />
              </View>
              <Text style={[s.toolLabel, on && { color: theme.c.ink, fontFamily: theme.t.bodyStrong.fontFamily }]}>{TOOL_NAME[t]}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[s.hintSmall, { textAlign: 'center' }]}>Toca una herramienta para ponerla o quitarla.</Text>
    </View>
  );
}

/** Para qué sirve el asistente y cómo se usa, en cuatro pasos. */
function HowTo({ game }: { game: boolean }) {
  const s = useStyles(makeStyles);
  const steps = [
    ['people', 'Elegid quién juega', 'Tocad los nombres o añadid uno nuevo. Cada jugador tiene su color y su forma.'],
    ['hand', 'Decidid quién empieza', 'A piedra, papel o tijera, a pares o nones, con un dedo cada uno en la pantalla… La app os recuerda las normas.'],
    ['next', 'Jugad', 'Pulsad «Siguiente» para pasar el turno y usad + y − para los puntos. El sorteo y el temporizador también ayudan.'],
    ['seal', 'Terminad', game ? 'Con «Terminar», cada uno firma en el cuaderno del juego y queda apuntado quién ganó.' : 'Con «Terminar» se ve quién ha ganado y se borra la partida.'],
  ] as const;
  return (
    <Card style={{ gap: space.m }}>
      <SectionLabel icon="spark">Cómo funciona</SectionLabel>
      <Text style={s.muted}>Este ayudante lleva la partida por vosotros: a quién le toca, los puntos, los sorteos y el tiempo. Así solo tenéis que jugar.</Text>
      {steps.map(([icon, title, body], i) => (
        <View key={title} style={s.step}>
          <View style={s.stepNum}>
            <Text style={s.stepNumText}>{i + 1}</Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s }}>
              <Icon name={icon} size={20} color={s.stepTitle.color as string} />
              <Text style={s.stepTitle}>{title}</Text>
            </View>
            <Text style={s.muted}>{body}</Text>
          </View>
        </View>
      ))}
    </Card>
  );
}

/** «¿Quién empieza?»: echarlo a suertes como siempre y marcar quién ha ganado. */
function WhoStarts() {
  const s = useStyles(makeStyles);
  const match = useMatch();
  const [method, setMethod] = useState<string | null>(null);
  const [fingers, setFingers] = useState(false);
  const sorteo = SORTEOS.find((x) => x.id === method);
  const first = (id: string) => {
    tap();
    dispatchMatch({ type: 'first', id });
    const p = match.players.find((x) => x.id === id);
    if (p) showNote(`¡Empieza ${p.name}!`, 'Pulsad «Siguiente» cuando acabe su turno.');
  };
  const random = () => {
    const p = match.players[Math.floor(Math.random() * match.players.length)];
    if (p) first(p.id);
  };
  return (
    <Card style={{ gap: space.m }}>
      <SectionLabel icon="hand">¿Quién empieza?</SectionLabel>
      <Text style={s.muted}>Echadlo a suertes como queráis. Elegid una forma y os recordamos las normas.</Text>
      <View style={s.ways}>
        {SORTEOS.map((x) => (
          <WayTile key={x.id} icon={x.icono} title={x.nombre} sub={x.para} selected={method === x.id} onPress={() => setMethod(method === x.id ? null : x.id)} />
        ))}
        <WayTile icon="hand" title="Un dedo cada uno" sub="En la pantalla" selected={false} onPress={() => setFingers(true)} />
        <WayTile icon="shuffle" title="Que elija la app" sub="Al azar" selected={false} onPress={random} />
      </View>
      {sorteo ? (
        <View style={s.rules}>
          <Text style={s.rulesTitle}>
            {sorteo.nombre} <Text style={s.rulesFor}>· {sorteo.para}</Text>
          </Text>
          {sorteo.normas.map((n, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: space.s }}>
              <Text style={s.rulesBullet}>{i + 1}.</Text>
              <Text style={[s.muted, { flex: 1 }]}>{n}</Text>
            </View>
          ))}
        </View>
      ) : null}
      <Text style={s.question}>¿Quién ha ganado? Empieza esa persona</Text>
      <View style={s.playerGrid}>
        {match.players.map((p) => (
          <Pressable key={p.id} accessibilityRole="button" accessibilityLabel={`Empieza ${describePlayer(p)}`} onPress={() => first(p.id)} style={s.playerPick}>
            <PlayerShape shape={p.shape} color={p.color} size={24} />
            <Text style={s.playerPickName} numberOfLines={1}>
              {p.name}
            </Text>
          </Pressable>
        ))}
      </View>
      <FingerPicker
        open={fingers}
        players={match.players}
        onClose={() => setFingers(false)}
        onPick={(id) => {
          setFingers(false);
          first(id);
        }}
      />
    </Card>
  );
}

function WayTile({ icon, title, sub, selected, onPress }: { icon: IconName; title: string; sub: string; selected: boolean; onPress: () => void }) {
  const theme = useTheme();
  const s = useStyles(makeStyles);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${sub}`}
      accessibilityState={{ selected }}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [s.way, selected && { borderColor: theme.c.ink, backgroundColor: theme.c.surfaceAlt }, { opacity: pressed ? 0.8 : 1 }]}
    >
      <View style={[s.wayIcon, selected && { backgroundColor: theme.c.ink }]}>
        <Icon name={icon} size={20} color={selected ? theme.c.bg : theme.c.ink} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.wayTitle} numberOfLines={2}>
          {title}
        </Text>
        <Text style={s.waySub} numberOfLines={1}>
          {sub}
        </Text>
      </View>
    </Pressable>
  );
}

function Setup() {
  const theme = useTheme();
  const s = useStyles(makeStyles);
  const saved = useJournal((st) => st.players);
  const match = useMatch();
  const [name, setName] = useState('');
  const chosen = new Set(match.players.map((p) => p.id));

  const toggle = (p: Player) => {
    const players = chosen.has(p.id) ? match.players.filter((x) => x.id !== p.id) : [...match.players, p];
    dispatchMatch({ type: 'setup', gameId: match.gameId, players });
  };
  const add = () => {
    const p = addPlayer(name);
    setName('');
    dispatchMatch({ type: 'setup', gameId: match.gameId, players: [...match.players, p] });
    AccessibilityInfo.announceForAccessibility(`${describePlayer(p)} añadido`);
  };

  return (
    <Card style={{ gap: space.l }}>
      <SectionLabel icon="people">1 · ¿Quién juega?</SectionLabel>
      {saved.length === 0 ? <Text style={s.muted}>Añade los nombres. Se guardan para la próxima vez.</Text> : null}
      <View style={s.playerGrid}>
        {saved.map((p) => {
          const on = chosen.has(p.id);
          return (
            <Pressable
              key={p.id}
              accessibilityRole="checkbox"
              accessibilityLabel={describePlayer(p)}
              accessibilityState={{ checked: on }}
              onPress={() => {
                tap();
                toggle(p);
              }}
              style={[s.playerPick, on && { borderColor: theme.c.ink, backgroundColor: theme.c.surfaceAlt }]}
            >
              <PlayerShape shape={p.shape} color={p.color} size={26} />
              <Text style={s.playerPickName} numberOfLines={1}>
                {p.name}
              </Text>
              {on ? <Icon name="check" size={18} color={theme.c.ink} /> : null}
            </Pressable>
          );
        })}
      </View>
      <View style={s.addRow}>
        <TextInput
          value={name}
          onChangeText={setName}
          onSubmitEditing={() => name.trim() && add()}
          placeholder="Nombre"
          placeholderTextColor={theme.c.inkSoft}
          maxLength={MAX_NAME}
          accessibilityLabel="Nombre del jugador nuevo"
          style={s.input}
          returnKeyType="done"
        />
        <IconButton icon="plus" label="Añadir jugador" onPress={() => (name.trim() ? add() : undefined)} />
      </View>
      <Button
        label={match.players.length === 0 ? 'Elige quién juega' : `Empezar con ${match.players.length}`}
        icon="play"
        disabled={match.players.length === 0}
        onPress={() => dispatchMatch({ type: 'start' })}
      />
    </Card>
  );
}

function Running({ tools }: { tools: readonly Herramienta[] }) {
  const theme = useTheme();
  const s = useStyles(makeStyles);
  const match = useMatch();
  const current = match.players[match.turn];
  const showTurns = tools.includes('turnos');
  const showScore = tools.includes('marcador');

  const next = () => {
    dispatchMatch({ type: 'next' });
    const m = useMatch.getState();
    const p = m.players[m.turn];
    if (p) AccessibilityInfo.announceForAccessibility(`Le toca a ${p.name}`);
  };

  return (
    <>
      {showTurns && current ? (
        <View style={s.turnCard} accessible={false}>
          <View style={s.turnTop}>
            <View style={s.turnShape}>
              <Wash hue="yellow" variant={match.turn} style={{ left: 0, top: 0, right: 0, bottom: 0 }} />
              <View style={{ zIndex: 1 }}>
                <PlayerShape shape={current.shape} color={current.color} size={56} />
              </View>
            </View>
            <View style={{ flex: 1, minWidth: 0 }} accessible accessibilityLabel={`Le toca a ${describePlayer(current)}`}>
              <Text style={s.muted}>Le toca a</Text>
              <Text style={s.turnName} numberOfLines={2}>
                {current.name}
              </Text>
            </View>
          </View>
          <Button label="Siguiente" icon="next" onPress={next} />
          <Text style={s.hintSmall}>Pulsad «Siguiente» cuando acabe su turno.</Text>
        </View>
      ) : null}
      {showScore || showTurns ? (
        <View style={{ gap: space.s }}>
          {match.players.map((p, i) => {
            const score = match.scores[p.id] ?? 0;
            const active = showTurns && i === match.turn;
            return (
              <View key={p.id} style={[s.scoreRow, active && { borderColor: theme.c.ink, borderWidth: 2 }]}>
                <PlayerBadge player={p} style={{ flex: 1 }} />
                {showScore ? (
                  <>
                    <IconButton icon="minus" label={`Restar un punto a ${p.name}`} onPress={() => dispatchMatch({ type: 'score', id: p.id, delta: -1 })} />
                    <Text style={s.score} accessibilityLabel={`${p.name}: ${score} ${score === 1 ? 'punto' : 'puntos'}`} accessibilityLiveRegion="polite">
                      {score}
                    </Text>
                    <IconButton icon="plus" label={`Sumar un punto a ${p.name}`} onPress={() => dispatchMatch({ type: 'score', id: p.id, delta: 1 })} />
                  </>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : null}
    </>
  );
}

function Draw({ players }: { players: readonly Player[] }) {
  const s = useStyles(makeStyles);
  const reduced = useReducedMotion();
  const [shown, setShown] = useState<Player | null>(null);
  const [rolling, setRolling] = useState(false);
  const [fingers, setFingers] = useState(false);
  const pop = useRef(new Animated.Value(1)).current;

  const roll = () => {
    if (players.length === 0 || rolling) return;
    const winner = players[Math.floor(Math.random() * players.length)]!;
    const done = () => {
      setShown(winner);
      setRolling(false);
      AccessibilityInfo.announceForAccessibility(`Sorteo: ${winner.name}`);
      if (!reduced) {
        pop.setValue(0.85);
        Animated.spring(pop, { toValue: 1, useNativeDriver: true, bounciness: 4 }).start();
      }
    };
    if (reduced) return done();
    setRolling(true);
    let i = 0;
    const steps = 10;
    const tick = () => {
      setShown(players[i % players.length]!);
      i++;
      if (i < steps) setTimeout(tick, 60 + i * 12);
      else done();
    };
    tick();
  };

  return (
    <Card style={{ gap: space.m }}>
      <SectionLabel icon="shuffle">Sorteo</SectionLabel>
      <Text style={s.hintSmall}>Para cuando hay que elegir a alguien: quién la liga, quién se la queda, quién sale primero…</Text>
      <Animated.View style={[s.drawResult, { transform: [{ scale: pop }] }]} accessible={!!shown && !rolling} accessibilityLabel={shown ? `Ha salido ${describePlayer(shown)}` : undefined}>
        {shown ? <PlayerBadge player={shown} size={36} /> : <Text style={s.muted}>Toca para elegir a alguien al azar.</Text>}
      </Animated.View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.m }}>
        <Button label="¿Quién la liga?" icon="shuffle" variant="secondary" onPress={roll} disabled={rolling} style={{ flexGrow: 1 }} />
        <Button label="Un dedo cada uno" icon="hand" variant="secondary" onPress={() => setFingers(true)} style={{ flexGrow: 1 }} />
      </View>
      <FingerPicker open={fingers} players={[]} onClose={() => setFingers(false)} onPick={() => setFingers(false)} />
    </Card>
  );
}

const PRESETS = [30, 60, 180, 300] as const;
const fmt = (sec: number): string => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
const presetLabel = (sec: number): string => (sec < 60 ? `${sec} s` : `${sec / 60} min`);

function Timer() {
  const theme = useTheme();
  const s = useStyles(makeStyles);
  const [total, setTotal] = useState<number>(60);
  const [left, setLeft] = useState(60_000);
  const [running, setRunning] = useState(false);
  const end = useRef(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const ms = Math.max(0, end.current - Date.now());
      setLeft(ms);
      if (ms === 0) {
        setRunning(false);
        alarm();
        showNote('¡Tiempo!', 'El temporizador ha terminado.');
      }
    }, 200);
    return () => clearInterval(id);
  }, [running]);

  const toggle = () => {
    if (running) {
      setRunning(false);
      return;
    }
    const base = left === 0 ? total * 1000 : left;
    end.current = Date.now() + base;
    setLeft(base);
    setRunning(true);
  };
  const reset = (sec = total) => {
    setRunning(false);
    setTotal(sec);
    setLeft(sec * 1000);
  };
  const seconds = Math.ceil(left / 1000);
  const fraction = left / (total * 1000);

  return (
    <Card style={{ gap: space.m }}>
      <SectionLabel icon="timer">Temporizador</SectionLabel>
      <Text style={s.hintSmall}>Elegid cuánto dura, por ejemplo para contar en el escondite. Suena y vibra al acabar.</Text>
      <Segmented compact options={PRESETS} value={total as (typeof PRESETS)[number]} onChange={(v) => reset(v)} format={presetLabel} label="Duración del temporizador" />
      <View style={s.timerRow}>
        <Text style={[s.timer, seconds <= 5 && running && { color: theme.c.danger }]} accessibilityRole="timer" accessibilityLabel={`Quedan ${seconds} segundos`}>
          {fmt(seconds)}
        </Text>
        <View style={s.timerBar}>
          <View style={{ width: `${Math.round(fraction * 100)}%`, height: '100%', borderRadius: 6, backgroundColor: theme.c.hueText.turquoise }} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: space.m }}>
        <Button label={running ? 'Pausa' : left === 0 || left === total * 1000 ? 'Empezar' : 'Seguir'} icon={running ? 'pause' : 'play'} onPress={toggle} style={{ flex: 1 }} />
        <IconButton icon="reset" label="Reiniciar temporizador" onPress={() => reset()} size={52} />
      </View>
    </Card>
  );
}

const makeStyles = ({ c, t }: Theme) =>
  StyleSheet.create({
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: gutter - 4, paddingTop: space.s, minHeight: 56 },
    body: { paddingHorizontal: gutter, paddingBottom: 140, gap: space.l },
    overline: { ...t.overline, color: c.inkSoft },
    title: { ...t.display, color: c.ink },
    muted: { ...t.body, color: c.inkSoft },
    playerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
    playerPick: { flexDirection: 'row', alignItems: 'center', gap: space.s, minHeight: 48, paddingHorizontal: space.m, borderRadius: radius.pill, borderWidth: c.border, borderColor: c.lineStrong, maxWidth: '100%' },
    playerPickName: { ...t.hand, color: c.ink, flexShrink: 1 },
    addRow: { flexDirection: 'row', gap: space.s, alignItems: 'center' },
    input: { flex: 1, minHeight: 48, ...t.body, color: c.ink, paddingHorizontal: space.l, borderRadius: radius.pill, borderWidth: c.border, borderColor: c.lineStrong, backgroundColor: c.bg },
    turnCard: { gap: space.m, padding: space.l, borderRadius: radius.card, backgroundColor: c.surface, borderWidth: c.border, borderColor: c.line },
    turnTop: { flexDirection: 'row', alignItems: 'center', gap: space.l },
    turnShape: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center' },
    turnName: { ...t.handLarge, color: c.ink, paddingRight: 12 },
    hintSmall: { ...t.caption, color: c.inkSoft },
    toolRow: { flexDirection: 'row', justifyContent: 'space-between', gap: space.s },
    tool: { flex: 1, alignItems: 'center', gap: space.xs },
    toolIcon: { width: 60, height: 60, borderRadius: 20, backgroundColor: c.surface, borderWidth: c.border, borderColor: c.line, alignItems: 'center', justifyContent: 'center' },
    toolLabel: { ...t.caption, color: c.inkSoft, textAlign: 'center' },
    ways: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
    way: { flexBasis: '47%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: space.s, minHeight: 64, paddingVertical: space.s, paddingHorizontal: space.s + 2, borderRadius: radius.input + 2, borderWidth: c.border, borderColor: c.line, backgroundColor: c.surface },
    wayIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: c.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
    wayTitle: { ...t.label, color: c.ink },
    waySub: { ...t.caption, color: c.inkSoft },
    step: { flexDirection: 'row', gap: space.m, alignItems: 'flex-start' },
    stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
    stepNumText: { ...t.label, color: c.bg },
    stepTitle: { ...t.bodyStrong, color: c.ink },
    question: { ...t.bodyStrong, color: c.ink },
    rules: { gap: space.s, padding: space.m, borderRadius: radius.input, backgroundColor: c.surfaceAlt },
    rulesTitle: { ...t.title, color: c.ink },
    rulesFor: { ...t.caption, color: c.inkSoft },
    rulesBullet: { ...t.bodyStrong, color: c.ink, minWidth: 18 },
    scoreRow: { flexDirection: 'row', alignItems: 'center', gap: space.s, minHeight: 64, paddingLeft: space.l, paddingRight: space.s, borderRadius: radius.input + 2, backgroundColor: c.surface, borderWidth: c.border, borderColor: c.line },
    score: { ...t.headline, color: c.ink, minWidth: 40, textAlign: 'center' },
    drawResult: { minHeight: 56, alignItems: 'center', justifyContent: 'center' },
    timerRow: { gap: space.s },
    timer: { ...t.display, fontSize: (t.display.fontSize ?? 36) * 1.5, lineHeight: (t.display.lineHeight ?? 42) * 1.5, color: c.ink, textAlign: 'center', fontVariant: ['tabular-nums'] },
    timerBar: { height: 12, borderRadius: 6, backgroundColor: c.surfaceAlt, overflow: 'hidden' },
  });
