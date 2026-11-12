import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { GROUP_LABEL, badgeProgress, type BadgeGroup, type BadgeProgress } from '../domain/badges';
import { GAMES } from '../domain/catalog';
import { badgeInput, useJournal } from '../store/journalStore';
import { useTheme } from '../store/settingsStore';
import { IconButton, ProgressBar, Screen, SectionLabel, useStyles } from '../ui/components';
import { Icon } from '../ui/icons';
import { brand, gutter, radius, space, type Theme } from '../ui/theme';
import { popOverlay } from '../ui/uiStore';

const GROUPS: readonly BadgeGroup[] = ['juegos', 'colecciones', 'partidas', 'ganadores', 'pandilla'];

/** Todas las insignias, por grupos: conseguidas en amarillo y el resto con lo que falta. */
export function BadgesScreen() {
  const s = useStyles(makeStyles);
  const plays = useJournal((st) => st.plays);
  const players = useJournal((st) => st.players);
  const all = useMemo(() => badgeProgress(GAMES, badgeInput({ plays, players })), [plays, players]);
  const earned = all.filter((b) => b.earned).length;
  return (
    <Screen>
      <View style={s.topBar}>
        <IconButton icon="back" label="Volver" onPress={popOverlay} />
      </View>
      <ScrollView contentContainerStyle={s.body}>
        <Text style={s.overline}>Mi cuaderno</Text>
        <Text style={s.title} accessibilityRole="header">
          Insignias
        </Text>
        <Text style={s.lead}>{`${earned} de ${all.length} conseguidas.`}</Text>
        <ProgressBar value={earned / all.length} hue="yellow" />
        {GROUPS.map((g) => (
          <View key={g} style={{ gap: space.s }}>
            <SectionLabel style={{ marginTop: space.m }}>{GROUP_LABEL[g]}</SectionLabel>
            {all
              .filter((b) => b.badge.group === g)
              .map((b) => (
                <BadgeRow key={b.badge.id} item={b} />
              ))}
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

export function BadgeRow({ item: { badge, done, target, earned, who } }: { item: BadgeProgress }) {
  const theme = useTheme();
  const s = useStyles(makeStyles);
  return (
    <View style={s.badge} accessible accessibilityLabel={`${badge.title}. ${badge.description}. ${earned ? `Conseguida${who ? ` por ${who}` : ''}` : `${done} de ${target}`}`}>
      <View style={[s.icon, earned ? { backgroundColor: brand.yellow, borderStyle: 'solid', borderColor: theme.c.dark ? brand.yellow : theme.c.ink } : null]}>
        <Icon name={badge.icon} size={24} color={earned ? '#2B2724' : theme.c.inkSoft} />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={s.badgeTitle}>{badge.title}</Text>
        <Text style={s.badgeText}>{earned && who ? `${badge.description} · ${who}` : badge.description}</Text>
        {!earned && target > 1 ? <ProgressBar value={done / target} hue="turquoise" /> : null}
      </View>
      {earned ? <Text style={s.done}>¡hecho!</Text> : target > 1 ? <Text style={s.count}>{`${done}/${target}`}</Text> : null}
    </View>
  );
}

const makeStyles = ({ c, t }: Theme) =>
  StyleSheet.create({
    topBar: { flexDirection: 'row', paddingHorizontal: gutter - 4, paddingTop: space.s },
    body: { paddingHorizontal: gutter, paddingTop: space.m, paddingBottom: 60, gap: space.s },
    overline: { ...t.overline, color: c.inkSoft },
    title: { ...t.display, color: c.ink },
    lead: { ...t.body, color: c.inkSoft },
    badge: { flexDirection: 'row', alignItems: 'center', gap: space.m, padding: space.m, borderRadius: radius.card, backgroundColor: c.surface, borderWidth: c.border, borderColor: c.line },
    icon: { width: 48, height: 48, borderRadius: 24, borderWidth: c.border, borderStyle: 'dashed', borderColor: c.lineStrong, alignItems: 'center', justifyContent: 'center' },
    badgeTitle: { ...t.bodyStrong, color: c.ink },
    badgeText: { ...t.caption, color: c.inkSoft },
    done: { ...t.hand, color: c.hueText.yellow },
    count: { ...t.label, color: c.inkSoft },
  });
