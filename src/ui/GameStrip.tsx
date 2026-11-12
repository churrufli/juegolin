import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DURATION_SHORT, playersLabel } from '../domain/catalog';
import type { Juego } from '../domain/types';
import { GameArt, Spiral, useStyles } from './components';
import { tap } from './feedback';
import { gutter, radius, space, type Theme } from './theme';
import { openGame } from './uiStore';

/** Fila de juegos pequeños que se desliza en horizontal: recomendaciones y parecidos. */
export function GameStrip({ games, label }: { games: readonly Juego[]; label: string }) {
  const s = useStyles(makeStyles);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row} style={{ marginHorizontal: -gutter }} accessibilityLabel={label}>
      {games.map((g) => (
        <Pressable
          key={g.id}
          accessibilityRole="button"
          accessibilityLabel={`${g.nombre}. ${g.resumen}${g.soloEnCoche ? '. Para jugar yendo en coche' : ''}`}
          onPress={() => {
            tap();
            openGame(g.id);
          }}
          style={({ pressed }) => [s.card, { opacity: pressed ? 0.8 : 1 }]}
        >
          <Spiral rings={5} />
          <GameArt game={g} height={86} />
          <Text style={s.name} numberOfLines={2}>
            {g.nombre}
          </Text>
          <Text style={s.meta} numberOfLines={1}>
            {`${playersLabel(g)} · ${DURATION_SHORT[g.duracion]}`}
          </Text>
        </Pressable>
      ))}
      <View style={{ width: gutter - space.m }} />
    </ScrollView>
  );
}

const makeStyles = ({ c, t }: Theme) =>
  StyleSheet.create({
    row: { paddingLeft: gutter, gap: space.m, paddingTop: 10 },
    card: { width: 150, padding: space.m, gap: 4, borderRadius: radius.card, backgroundColor: c.surface, borderWidth: c.border, borderColor: c.line },
    name: { ...t.bodyStrong, color: c.ink },
    meta: { ...t.caption, color: c.inkSoft },
  });
