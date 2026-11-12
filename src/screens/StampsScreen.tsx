import { useMemo } from 'react';
import { BadgeRow } from './BadgesScreen';
import { FlatList, Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { badgeProgress, highlightBadges } from '../domain/badges';
import { GAMES, SECTION_HUE } from '../domain/catalog';
import type { Juego } from '../domain/types';
import { badgeInput, playedSet, shortDate, signatureCounts, useJournal, type Play } from '../store/journalStore';
import { useTheme } from '../store/settingsStore';
import { Button, PlayerShape, ProgressBar, Screen, SectionLabel, useStyles } from '../ui/components';
import { tap } from '../ui/feedback';
import { Icon } from '../ui/icons';
import { ILLUSTRATIONS } from '../ui/illustrations';
import { brand, gutter, radius, space, type Theme } from '../ui/theme';
import { openGame, pushOverlay } from '../ui/uiStore';

export function StampsScreen() {
  const theme = useTheme();
  const s = useStyles(makeStyles);
  const { fontScale, width } = useWindowDimensions();
  const plays = useJournal((st) => st.plays);
  const people = useJournal((st) => st.players);
  const counts = useMemo(() => signatureCounts(plays), [plays]);
  const signers = people.filter((p) => (counts.get(p.id) ?? 0) > 0).sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0));
  const played = useMemo(() => playedSet(plays), [plays]);
  const allBadges = useMemo(() => badgeProgress(GAMES, badgeInput({ plays, players: people })), [plays, people]);
  const badges = highlightBadges(allBadges);
  const earnedCount = allBadges.filter((b) => b.earned).length;
  const done = GAMES.filter((g) => played.has(g.id)).length;
  // Casillas grandes para que se vean bien los dibujos, también los de los juegos sin jugar.
  const columns = fontScale >= 1.3 || width < 360 ? 1 : 2;
  // Primero los jugados (el último arriba), luego el resto por nombre.
  const ordered = useMemo(
    () => [...GAMES].sort((a, b) => (plays[b.id]?.last ?? '').localeCompare(plays[a.id]?.last ?? '')),
    [plays],
  );

  const header = (
    <View style={s.header}>
      <View>
        <Text style={s.overline}>Mi cuaderno</Text>
        <Text style={s.title} accessibilityRole="header">
          Sellos de juegos
        </Text>
      </View>
      <Text style={s.lead}>
        {done === 0 ? 'Todavía no hay sellos. Cuando juguéis a algo, pulsad «Ya jugado» en su ficha.' : `${done} de ${GAMES.length} juegos jugados. Sin prisa: el cuaderno no caduca.`}
      </Text>
      <ProgressBar value={done / GAMES.length} hue="coral" />

      {signers.length > 0 ? (
        <>
          <SectionLabel icon="pencil" style={{ marginTop: space.m }}>Firmas</SectionLabel>
          <View style={s.signers}>
            {signers.map((p, i) => {
              const n = counts.get(p.id) ?? 0;
              return (
                <View key={p.id} style={[s.signer, i > 0 && { borderTopWidth: 1 }]} accessible accessibilityLabel={`${p.name} ha firmado ${n} ${n === 1 ? 'juego' : 'juegos'}`}>
                  <PlayerShape shape={p.shape} color={p.color} size={26} />
                  <Text style={s.signerName} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <Text style={s.count}>{n === 1 ? '1 juego' : `${n} juegos`}</Text>
                </View>
              );
            })}
          </View>
        </>
      ) : null}

      <SectionLabel icon="seal" style={{ marginTop: space.m }}>Insignias</SectionLabel>
      <View style={{ gap: space.s }}>
        {badges.map((b) => (
          <BadgeRow key={b.badge.id} item={b} />
        ))}
        <Button label={`Ver todas las insignias · ${earnedCount} de ${allBadges.length}`} icon="star" variant="secondary" onPress={() => pushOverlay({ name: 'badges' })} />
      </View>
      <SectionLabel icon="book" style={{ marginTop: space.m }}>Todos los juegos</SectionLabel>
    </View>
  );

  return (
    <Screen>
      <FlatList
        key={columns}
        data={ordered}
        numColumns={columns}
        keyExtractor={(g) => g.id}
        ListHeaderComponent={header}
        columnWrapperStyle={{ gap: space.s }}
        contentContainerStyle={s.list}
        renderItem={({ item }) => <StampCell game={item} play={plays[item.id]} />}
      />
    </Screen>
  );
}

function StampCell({ game, play }: { game: Juego; play?: Play }) {
  const last = play?.last;
  const people = useJournal((st) => st.players);
  const signed = (play?.signers ?? []).map((id) => people.find((p) => p.id === id)).filter((p) => p !== undefined);
  const theme = useTheme();
  const s = useStyles(makeStyles);
  const on = !!last;
  const hue = SECTION_HUE[game.seccion];
  const source = ILLUSTRATIONS[game.id];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${game.nombre}, ${on ? `jugado el ${shortDate(last)}${signed.length > 0 ? `, firmado por ${signed.map((p) => p.name).join(', ')}` : ''}` : 'sin jugar'}`}
      onPress={() => {
        tap();
        openGame(game.id);
      }}
      style={({ pressed }) => [s.cell, { opacity: pressed ? 0.7 : 1 }]}
    >
      <View
        style={[
          s.seal,
          on
            ? { backgroundColor: theme.c.washOpacity > 0 ? brand[hue] : theme.c.surface, borderColor: theme.c.hueText[hue], borderStyle: 'solid' }
            : { borderColor: theme.c.lineStrong, borderStyle: 'dashed' },
        ]}
      >
        {source ? (
          <Image source={source} resizeMode="contain" style={{ width: '78%', height: '78%', tintColor: on && theme.c.washOpacity > 0 ? '#2B2724' : on ? theme.c.ink : theme.c.inkSoft, opacity: on ? 1 : 0.7 }} />
        ) : (
          <Icon name={game.soloEnCoche ? 'car' : 'people'} size={34} color={theme.c.ink} />
        )}
      </View>
      <Text style={[s.cellName, !on && { color: theme.c.inkSoft }]} numberOfLines={2}>
        {game.nombre}
      </Text>
      {signed.length > 0 ? (
        <View style={s.cellSigners} accessible={false}>
          {signed.slice(0, 5).map((p) => (
            <PlayerShape key={p.id} shape={p.shape} color={p.color} size={16} />
          ))}
          {signed.length > 5 ? <Text style={s.count}>+{signed.length - 5}</Text> : null}
        </View>
      ) : null}
    </Pressable>
  );
}

const makeStyles = ({ c, t }: Theme) =>
  StyleSheet.create({
    list: { paddingHorizontal: gutter, paddingBottom: 120, gap: space.m },
    header: { gap: space.m, paddingTop: space.l },
    overline: { ...t.overline, color: c.inkSoft },
    title: { ...t.display, color: c.ink },
    lead: { ...t.body, color: c.inkSoft },
    badge: { flexDirection: 'row', alignItems: 'center', gap: space.m, padding: space.m, borderRadius: radius.card, backgroundColor: c.surface, borderWidth: c.border, borderColor: c.line },
    badgeIcon: { width: 48, height: 48, borderRadius: 24, borderWidth: c.border, borderStyle: 'dashed', borderColor: c.lineStrong, alignItems: 'center', justifyContent: 'center' },
    badgeTitle: { ...t.bodyStrong, color: c.ink },
    badgeText: { ...t.caption, color: c.inkSoft },
    done: { ...t.hand, color: c.hueText.yellow },
    count: { ...t.label, color: c.inkSoft },
    cell: { flex: 1, alignItems: 'center', gap: space.xs, paddingVertical: space.s },
    seal: { width: 132, height: 132, borderRadius: 66, borderWidth: 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    cellName: { ...t.caption, color: c.ink, textAlign: 'center' },
    cellSigners: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 3, alignItems: 'center' },
    signers: { borderRadius: radius.card, backgroundColor: c.surface, borderWidth: c.border, borderColor: c.line, paddingHorizontal: space.l },
    signer: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 52, borderColor: c.line },
    signerName: { ...t.hand, color: c.ink, flex: 1 },
  });
