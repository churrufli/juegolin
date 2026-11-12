import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GAMES } from '../domain/catalog';
import { EMPTY_FILTERS } from '../domain/filters';
import { kitOf } from '../domain/kit';
import { useTheme } from '../store/settingsStore';
import { IconButton, Screen, useStyles } from '../ui/components';
import { tap } from '../ui/feedback';
import { Icon } from '../ui/icons';
import { gutter, radius, space, type Theme } from '../ui/theme';
import { popOverlay, setTab, useUiStore } from '../ui/uiStore';

/** El kit de Juegolín: lo que piden los juegos y casi seguro tenéis en casa. Cada cosa lleva a sus juegos. */
export function KitScreen() {
  const theme = useTheme();
  const s = useStyles(makeStyles);
  const kit = useMemo(() => kitOf(GAMES), []);
  const open = (value: string) => {
    tap();
    useUiStore.setState({ filters: { ...EMPTY_FILTERS, selection: { materiales: [value] } } });
    setTab('explore');
  };
  return (
    <Screen>
      <View style={s.topBar}>
        <IconButton icon="back" label="Volver" onPress={popOverlay} />
      </View>
      <ScrollView contentContainerStyle={s.body}>
        <Text style={s.overline}>Material de casa</Text>
        <Text style={s.title} accessibilityRole="header">
          El kit de Juegolín
        </Text>
        <Text style={s.lead}>Lo que piden los juegos, empezando por lo que sirve para más juegos. Toca una cosa para ver los juegos que la usan.</Text>
        <View style={s.list}>
          {kit.map((k, i) => (
            <Pressable
              key={k.value}
              accessibilityRole="button"
              accessibilityLabel={`${k.label}: ${k.games === 1 ? '1 juego' : `${k.games} juegos`}`}
              onPress={() => open(k.value)}
              style={({ pressed }) => [s.row, i === kit.length - 1 && { borderBottomWidth: 0 }, { opacity: pressed ? 0.7 : 1 }]}
            >
              <View style={s.icon}>
                <Icon name={k.icon} size={24} color={theme.c.ink} />
              </View>
              <Text style={s.label}>{k.label}</Text>
              <Text style={s.count}>{k.games === 1 ? '1 juego' : `${k.games} juegos`}</Text>
              <Icon name="chevron" size={20} color={theme.c.inkSoft} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const makeStyles = ({ c, t }: Theme) =>
  StyleSheet.create({
    topBar: { flexDirection: 'row', paddingHorizontal: gutter - 4, paddingTop: space.s },
    body: { paddingHorizontal: gutter, paddingTop: space.m, paddingBottom: 60, gap: space.s },
    overline: { ...t.overline, color: c.inkSoft },
    title: { ...t.display, color: c.ink },
    lead: { ...t.body, color: c.inkSoft, marginBottom: space.s },
    list: { borderRadius: radius.card, backgroundColor: c.surface, borderWidth: c.border, borderColor: c.line, paddingHorizontal: space.m },
    row: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 60, borderBottomWidth: 1, borderColor: c.line },
    icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: c.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
    label: { ...t.bodyStrong, color: c.ink, flex: 1 },
    count: { ...t.caption, color: c.inkSoft },
  });
