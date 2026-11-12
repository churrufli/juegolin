import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { IconButton, Screen, useStyles } from '../ui/components';
import { HowToUse } from '../ui/HowToUse';
import { gutter, space, type Theme } from '../ui/theme';
import { popOverlay } from '../ui/uiStore';

export function ManualScreen() {
  const s = useStyles(makeStyles);
  return (
    <Screen>
      <View style={s.topBar}>
        <IconButton icon="back" label="Volver" onPress={popOverlay} />
      </View>
      <ScrollView contentContainerStyle={s.body}>
        <Text style={s.title} accessibilityRole="header">
          Cómo se usa
        </Text>
        <Text style={s.lead}>Juegolín es un cuaderno de juegos de siempre: buscas, juegas y lo apuntas.</Text>
        <HowToUse />
      </ScrollView>
    </Screen>
  );
}

const makeStyles = ({ c, t }: Theme) =>
  StyleSheet.create({
    topBar: { flexDirection: 'row', paddingHorizontal: gutter - 4, paddingTop: space.s },
    body: { paddingHorizontal: gutter, paddingBottom: 60, gap: space.m },
    title: { ...t.display, color: c.ink },
    lead: { ...t.body, color: c.inkSoft },
  });
