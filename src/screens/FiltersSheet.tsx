import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { GAMES } from '../domain/catalog';
import { availableGroups, isSelected, toggleValue } from '../domain/filters';
import { Button, Chip, IconButton, SectionLabel, useStyles } from '../ui/components';
import { Sheet } from '../ui/motion';
import { space, type Theme } from '../ui/theme';
import { resetFilters, setFilters, useUiStore } from '../ui/uiStore';
import { useFilteredGames } from './useFilteredGames';

const GROUPS = availableGroups(GAMES);

export function FiltersSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useStyles(makeStyles);
  const filters = useUiStore((st) => st.filters);
  const results = useFilteredGames().length;
  const players = filters.players;

  const footer = (
    <View style={s.footer}>
      <Button label="Quitar todo" variant="secondary" onPress={resetFilters} style={{ flex: 1 }} />
      <Button label={results === 1 ? 'Ver 1 juego' : `Ver ${results} juegos`} onPress={onClose} style={{ flex: 1.4 }} />
    </View>
  );

  return (
    <Sheet open={open} onClose={onClose} title="Filtros" footer={footer}>
      <ScrollView contentContainerStyle={s.body}>
        <View style={s.group}>
          <SectionLabel icon="people">Jugadores</SectionLabel>
          <View style={s.stepper}>
            <IconButton icon="minus" label="Un jugador menos" onPress={() => setFilters({ players: players === null ? null : players <= 1 ? null : players - 1 })} />
            <Text style={s.stepperValue} accessibilityLiveRegion="polite" accessibilityLabel={players === null ? 'Cualquier número de jugadores' : `${players} jugadores`}>
              {players === null ? 'Cualquiera' : players === 1 ? '1 jugador' : `${players} jugadores`}
            </Text>
            <IconButton icon="plus" label="Un jugador más" onPress={() => setFilters({ players: players === null ? 2 : Math.min(40, players + 1) })} />
          </View>
          <View style={s.chips}>
            <Chip label="Mis favoritos" icon="bookmark" selected={filters.onlyFavorites} onPress={() => setFilters({ onlyFavorites: !filters.onlyFavorites })} />
            <Chip label="Sin jugar todavía" icon="seal" selected={filters.onlyUnplayed} onPress={() => setFilters({ onlyUnplayed: !filters.onlyUnplayed })} />
          </View>
        </View>
        {GROUPS.map((g) => (
          <View key={g.key} style={s.group}>
            <SectionLabel>{g.title}</SectionLabel>
            <View style={s.chips}>
              {g.options.map((o) => (
                <Chip
                  key={o.value}
                  label={o.label}
                  icon={o.icon}
                  selected={isSelected(filters.selection, g.key, o.value)}
                  onPress={() => setFilters({ selection: toggleValue(filters.selection, g.key, o.value) })}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </Sheet>
  );
}

const makeStyles = ({ c, t }: Theme) =>
  StyleSheet.create({
    body: { gap: space.xl, paddingBottom: space.xl },
    group: { gap: space.m },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
    stepper: { flexDirection: 'row', alignItems: 'center', gap: space.m },
    stepperValue: { ...t.bodyStrong, color: c.ink, minWidth: 130, textAlign: 'center' },
    footer: { flexDirection: 'row', gap: space.m, paddingTop: space.m, borderTopWidth: 1, borderColor: c.line },
  });
