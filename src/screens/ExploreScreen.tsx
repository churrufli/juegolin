import { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { GAMES, DURATION_SHORT, DESTACADOS, agesLabel, gameById, playersLabel } from '../domain/catalog';
import { dayKey, daily } from '../domain/daily';
import { recommendFrom } from '../domain/recommend';
import { QUICK_FILTERS, activeCount, isSelected, toggleValue } from '../domain/filters';
import type { Juego } from '../domain/types';
import { playedSet, shortDate, useJournal } from '../store/journalStore';
import { useTheme } from '../store/settingsStore';
import { Button, GameArt, IconButton, Screen, Spiral, Stamp, useStyles } from '../ui/components';
import { tap } from '../ui/feedback';
import { GameStrip } from '../ui/GameStrip';
import { Icon } from '../ui/icons';
import { gutter, radius, space, type Theme } from '../ui/theme';
import { openGame, pushOverlay, resetFilters, setFilters, useUiStore } from '../ui/uiStore';
import { resetAssistant } from './AssistantScreen';
import { FiltersSheet } from './FiltersSheet';
import { useFilteredGames } from './useFilteredGames';

const LOGO_MARK = require('../../assets/logo-simbolo.png');
const LOGO_TEXT = require('../../assets/logo-texto.png');

export function ExploreScreen() {
  const theme = useTheme();
  const s = useStyles(makeStyles);
  const { width, fontScale } = useWindowDimensions();
  const filters = useUiStore((st) => st.filters);
  const games = useFilteredGames();
  const plays = useJournal((st) => st.plays);
  const favorites = useJournal((st) => st.favorites);
  const [sheet, setSheet] = useState(false);
  const columns = fontScale >= 1.3 || width < 360 ? 1 : 2;
  const count = activeCount(filters);
  // Parecidos a lo último que habéis jugado (solo en la portada, sin búsqueda ni filtros).
  const recs = useMemo(() => {
    const recent = Object.entries(plays)
      .sort(([, a], [, b]) => b.last.localeCompare(a.last))
      .map(([id]) => gameById(id))
      .filter((g): g is Juego => g !== undefined);
    return recommendFrom(recent, GAMES, playedSet(plays));
  }, [plays]);
  const home = count === 0 && !filters.query;
  const showRecs = recs.length > 0 && home;
  const today = dayKey();
  const day = useMemo(() => daily(GAMES, today), [today]);

  const surprise = () => {
    const pool = games.length > 0 ? games : GAMES;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick) openGame(pick.id);
  };

  const header = (
    <View style={s.header}>
      <View style={s.topRow}>
        <View style={s.brand} accessible accessibilityRole="header" accessibilityLabel="Juegolín">
          <Image source={LOGO_MARK} style={s.logoMark} resizeMode="contain" />
          <Image source={LOGO_TEXT} style={[s.logoText, { tintColor: theme.c.ink }]} resizeMode="contain" />
        </View>
        <IconButton icon="dice" label="Sorpréndeme: abre un juego al azar" onPress={surprise} />
      </View>
      <Text style={s.title} accessibilityRole="header">
        ¿A qué jugamos hoy?
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Asistente: te ayudo a elegir juego con unas preguntas"
        onPress={() => {
          tap();
          resetAssistant();
          pushOverlay({ name: 'assistant' });
        }}
        style={({ pressed }) => [s.assistant, { opacity: pressed ? 0.85 : 1 }]}
      >
        <View style={s.assistantIcon}>
          <Icon name="spark" size={26} color={theme.c.onInk} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={s.assistantTitle}>¿No sabéis a qué jugar?</Text>
          <Text style={s.assistantText}>Te ayudo a elegir con unas preguntas</Text>
        </View>
        <Icon name="chevron" size={22} color={theme.c.ink} />
      </Pressable>
      <View style={s.search}>
        <Icon name="search" size={20} color={theme.c.inkSoft} />
        <TextInput
          value={filters.query}
          onChangeText={(query) => setFilters({ query })}
          placeholder="Busca un juego…"
          placeholderTextColor={theme.c.inkSoft}
          accessibilityLabel="Buscar juego por nombre"
          style={s.input}
          returnKeyType="search"
          autoCorrect={false}
        />
        {filters.query ? <IconButton icon="close" label="Borrar búsqueda" size={40} onPress={() => setFilters({ query: '' })} style={{ borderWidth: 0 }} /> : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.quickRow} style={{ marginHorizontal: -gutter }}>
        {QUICK_FILTERS.map((q) => {
          const on = isSelected(filters.selection, q.key, q.value);
          return (
            <Pressable
              key={q.id}
              accessibilityRole="checkbox"
              accessibilityLabel={q.label}
              accessibilityState={{ checked: on }}
              onPress={() => {
                tap();
                setFilters({ selection: toggleValue(filters.selection, q.key, q.value) });
              }}
              style={({ pressed }) => [s.quick, { opacity: pressed ? 0.75 : 1 }]}
            >
              <View style={[s.quickIcon, on && { backgroundColor: theme.c.ink, borderColor: theme.c.ink }]}>
                <Icon name={q.icon} size={28} color={on ? theme.c.onInk : theme.c.ink} />
              </View>
              <Text style={[s.quickLabel, on && { color: theme.c.ink, fontFamily: theme.t.bodyStrong.fontFamily }]} numberOfLines={2}>
                {q.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {home ? <GameOfDay game={day.game} played={!!plays[day.game.id]} /> : null}
      {showRecs ? (
        <View style={{ gap: space.s }}>
          <Text style={s.recsTitle} accessibilityRole="header">
            Parecidos a lo que jugáis
          </Text>
          <GameStrip games={recs} label="Juegos recomendados" />
        </View>
      ) : null}
      {home ? (
        <View style={{ gap: space.s }}>
          <View style={s.sectionHead}>
            <Icon name="star" size={24} color={theme.c.ink} />
            <Text style={s.recsTitle} accessibilityRole="header">
              Destacados
            </Text>
          </View>
          <GameStrip games={DESTACADOS} label="Juegos destacados: los clásicos que se juegan en España" />
        </View>
      ) : null}
      {home
        ? day.sections.map((sec) => (
            <View key={sec.theme.id} style={{ gap: space.s }}>
              <View style={s.sectionHead}>
                <Icon name={sec.theme.icon} size={24} color={theme.c.ink} />
                <Text style={s.recsTitle} accessibilityRole="header">
                  {sec.theme.title}
                </Text>
              </View>
              <GameStrip games={sec.games} label={sec.theme.title} />
            </View>
          ))
        : null}
      {home ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="El kit de Juegolín: el material de casa que piden los juegos"
          onPress={() => {
            tap();
            pushOverlay({ name: 'kit' });
          }}
          style={({ pressed }) => [s.assistant, { opacity: pressed ? 0.85 : 1 }]}
        >
          <View style={[s.assistantIcon, { backgroundColor: theme.c.surfaceAlt }]}>
            <Icon name="box" size={26} color={theme.c.ink} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={s.assistantTitle}>El kit de Juegolín</Text>
            <Text style={s.assistantText}>El material de casa que piden los juegos</Text>
          </View>
          <Icon name="chevron" size={22} color={theme.c.ink} />
        </Pressable>
      ) : null}
      {home ? <Text style={s.recsTitle} accessibilityRole="header">Todos los juegos</Text> : null}
      <View style={s.resultsRow}>
        <Text style={s.results} accessibilityLiveRegion="polite">
          {games.length === 1 ? '1 juego' : `${games.length} juegos`}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={count > 0 ? `Filtros, ${count} activos` : 'Filtros'}
          onPress={() => {
            tap();
            setSheet(true);
          }}
          style={({ pressed }) => [s.filterButton, count > 0 && { backgroundColor: theme.c.ink, borderColor: theme.c.ink }, { opacity: pressed ? 0.75 : 1 }]}
        >
          <Icon name="sliders" size={20} color={count > 0 ? theme.c.onInk : theme.c.ink} />
          <Text style={[s.filterText, count > 0 && { color: theme.c.onInk }]}>{count > 0 ? `Filtros · ${count}` : 'Filtros'}</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <Screen>
      <FlatList
        key={columns}
        data={games}
        numColumns={columns}
        keyExtractor={(g) => g.id}
        ListHeaderComponent={header}
        columnWrapperStyle={columns > 1 ? { gap: space.m } : undefined}
        contentContainerStyle={s.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyTitle}>Ningún juego encaja</Text>
            <Text style={s.emptyText}>Prueba a quitar algún filtro o a buscar otra palabra.</Text>
            <Button label="Quitar filtros" variant="secondary" onPress={() => resetFilters()} />
          </View>
        }
        renderItem={({ item }) => <GameCard game={item} wide={columns === 1} played={plays[item.id]} favorite={favorites.includes(item.id)} />}
      />
      <FiltersSheet open={sheet} onClose={() => setSheet(false)} />
    </Screen>
  );
}

/** El juego del día: cambia cada día a medianoche. */
function GameOfDay({ game, played }: { game: Juego; played: boolean }) {
  const s = useStyles(makeStyles);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Juego del día: ${game.nombre}. ${game.resumen}`}
      onPress={() => {
        tap();
        openGame(game.id);
      }}
      style={({ pressed }) => [s.daily, { opacity: pressed ? 0.85 : 1 }]}
    >
      <Text style={s.dailyOverline}>Juego del día</Text>
      <GameArt game={game} height={150} />
      <Text style={s.dailyName}>{game.nombre}</Text>
      <Text style={s.dailyText}>{game.resumen}</Text>
      <Text style={s.dailyMeta}>{`${agesLabel(game)} · ${playersLabel(game)} · ${DURATION_SHORT[game.duracion]}${played ? ' · ya jugado' : ''}`}</Text>
    </Pressable>
  );
}

function GameCard({ game, wide, played, favorite }: { game: Juego; wide: boolean; played?: { count: number; last: string }; favorite: boolean }) {
  const theme = useTheme();
  const s = useStyles(makeStyles);
  const meta = `${agesLabel(game)} · ${playersLabel(game)}`;
  const label = [game.nombre, game.resumen, `${agesLabel(game)}, ${playersLabel(game)} jugadores, ${DURATION_SHORT[game.duracion].replace('<', 'menos de').replace('+', 'más de ')}`, game.soloEnCoche ? 'Para jugar yendo en coche' : null, played ? 'Jugado' : null, favorite ? 'Favorito' : null]
    .filter(Boolean)
    .join('. ');
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Abre la ficha del juego"
      onPress={() => {
        tap();
        openGame(game.id);
      }}
      style={({ pressed }) => [s.card, wide && s.cardWide, { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] }]}
    >
      <Spiral rings={wide ? 12 : 7} />
      <View style={wide ? { width: 110 } : undefined}>
        <GameArt game={game} height={wide ? 100 : 118} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={s.cardTitle}>{game.nombre}</Text>
        <Text style={s.cardMeta}>{meta}</Text>
        <View style={s.cardTime}>
          <Icon name="clock" size={14} color={theme.c.inkSoft} />
          <Text style={s.cardMeta}>{DURATION_SHORT[game.duracion]}</Text>
        </View>
        {wide ? (
          <Text style={s.cardMeta} numberOfLines={2}>
            {game.resumen}
          </Text>
        ) : null}
      </View>
      {played ? (
        <View style={s.cardStamp} pointerEvents="none">
          <Stamp date={shortDate(played.last)} count={played.count} size={58} rotate={-14} />
        </View>
      ) : null}
      {favorite ? (
        <View style={s.cardFav} pointerEvents="none">
          <Icon name="bookmark-filled" size={22} color={theme.c.stamp} />
        </View>
      ) : null}
    </Pressable>
  );
}

const makeStyles = ({ c, t }: Theme) =>
  StyleSheet.create({
    list: { paddingHorizontal: gutter, paddingBottom: 120, gap: space.m },
    header: { gap: space.l, paddingTop: space.m, paddingBottom: space.s },
    topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    assistant: { flexDirection: 'row', alignItems: 'center', gap: space.m, padding: space.m, borderRadius: radius.card, backgroundColor: c.surface, borderWidth: c.border, borderColor: c.line },
    assistantIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center' },
    assistantTitle: { ...t.bodyStrong, color: c.ink },
    assistantText: { ...t.caption, color: c.inkSoft },
    recsTitle: { ...t.title, color: c.ink },
    sectionHead: { flexDirection: 'row', alignItems: 'center', gap: space.s },
    daily: { padding: space.l, gap: space.xs, borderRadius: radius.card, backgroundColor: c.surface, borderWidth: 2, borderColor: c.ink },
    dailyOverline: { ...t.hand, color: c.hueText.coral },
    dailyName: { ...t.display, color: c.ink, fontSize: 28, lineHeight: 34 },
    dailyText: { ...t.body, color: c.ink },
    dailyMeta: { ...t.caption, color: c.inkSoft },
    brand: { flexDirection: 'row', alignItems: 'center', gap: space.m },
    logoMark: { width: 79, height: 33 },
    logoText: { width: 150, height: 38 },
    title: { ...t.display, color: c.ink },
    search: { flexDirection: 'row', alignItems: 'center', gap: space.s, minHeight: 52, paddingLeft: space.l, paddingRight: space.xs, borderRadius: radius.pill, backgroundColor: c.surface, borderWidth: c.border, borderColor: c.lineStrong },
    input: { flex: 1, ...t.body, color: c.ink, paddingVertical: space.s },
    quickRow: { paddingHorizontal: gutter, gap: space.m },
    quick: { width: 76, alignItems: 'center', gap: space.xs },
    quickIcon: { width: 64, height: 64, borderRadius: 22, backgroundColor: c.surface, borderWidth: c.border, borderColor: c.line, alignItems: 'center', justifyContent: 'center' },
    quickLabel: { ...t.caption, color: c.inkSoft, textAlign: 'center' },
    resultsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.m },
    results: { ...t.bodyStrong, color: c.ink },
    filterButton: { flexDirection: 'row', alignItems: 'center', gap: space.s, minHeight: 44, paddingHorizontal: space.l, borderRadius: radius.pill, borderWidth: c.border, borderColor: c.lineStrong },
    filterText: { ...t.label, color: c.ink },
    card: { flex: 1, backgroundColor: c.surface, borderRadius: radius.card, borderWidth: c.border, borderColor: c.line, padding: space.m, gap: space.s },
    cardWide: { flexDirection: 'row', alignItems: 'center', gap: space.m },
    cardTitle: { ...t.title, color: c.ink },
    cardMeta: { ...t.caption, color: c.inkSoft },
    cardTime: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    cardStamp: { position: 'absolute', top: space.s, right: space.s },
    cardFav: { position: 'absolute', top: space.m, left: space.m },
    empty: { alignItems: 'center', gap: space.m, paddingVertical: space.xxl },
    emptyTitle: { ...t.headline, color: c.ink, textAlign: 'center' },
    emptyText: { ...t.body, color: c.inkSoft, textAlign: 'center' },
  });
