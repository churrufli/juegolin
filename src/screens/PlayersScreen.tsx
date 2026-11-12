import { useState } from 'react';
import { AccessibilityInfo, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MAX_NAME, PLAYER_COLORS, SHAPES, SHAPE_LABEL, cleanName, describePlayer, type Player } from '../domain/players';
import { addPlayer, removePlayer, updatePlayer, useJournal } from '../store/journalStore';
import { useTheme } from '../store/settingsStore';
import { Button, Card, IconButton, PlayerShape, Screen, useStyles } from '../ui/components';
import { askDialog } from '../ui/Dialog';
import { tap } from '../ui/feedback';
import { gutter, radius, space, type Theme } from '../ui/theme';
import { popOverlay } from '../ui/uiStore';

/** Jugadores de siempre: nombre, color y forma. */
export function PlayersScreen() {
  const theme = useTheme();
  const s = useStyles(makeStyles);
  const players = useJournal((st) => st.players);
  const [name, setName] = useState('');

  const add = () => {
    const p = addPlayer(name);
    setName('');
    AccessibilityInfo.announceForAccessibility(`${describePlayer(p)} añadido`);
  };

  return (
    <Screen>
      <View style={s.topBar}>
        <IconButton icon="back" label="Volver" onPress={popOverlay} />
      </View>
      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        <Text style={s.title} accessibilityRole="header">
          Jugadores de siempre
        </Text>
        <Text style={s.hint}>Cada jugador tiene un color y una forma, para distinguirlos también sin color.</Text>
        <View style={s.addRow}>
          <TextInput
            value={name}
            onChangeText={setName}
            onSubmitEditing={() => name.trim() && add()}
            placeholder="Nombre nuevo"
            placeholderTextColor={theme.c.inkSoft}
            maxLength={MAX_NAME}
            accessibilityLabel="Nombre del jugador nuevo"
            style={s.input}
            returnKeyType="done"
          />
          <Button label="Añadir" icon="plus" onPress={add} disabled={!name.trim()} />
        </View>
        {players.map((p) => (
          <PlayerEditor key={p.id} player={p} />
        ))}
      </ScrollView>
    </Screen>
  );
}

function PlayerEditor({ player }: { player: Player }) {
  const theme = useTheme();
  const s = useStyles(makeStyles);
  const [name, setName] = useState(player.name);
  const commit = () => {
    const clean = cleanName(name);
    if (clean && clean !== player.name) updatePlayer(player.id, { name: clean });
    else setName(player.name);
  };
  const remove = async () => {
    if (await askDialog(`¿Quitar a ${player.name}?`, 'Dejará de salir en la lista de jugadores.', 'Quitar', { destructive: true, icon: 'trash' })) removePlayer(player.id);
  };

  return (
    <Card style={{ gap: space.m }}>
      <View style={s.nameRow}>
        <PlayerShape shape={player.shape} color={player.color} size={34} />
        <TextInput value={name} onChangeText={setName} onEndEditing={commit} onBlur={commit} maxLength={MAX_NAME} accessibilityLabel={`Nombre de ${player.name}`} style={[s.input, s.nameInput]} />
        <IconButton icon="trash" label={`Quitar a ${player.name}`} onPress={remove} />
      </View>
      <View style={s.swatches} accessibilityRole="radiogroup" accessibilityLabel={`Color de ${player.name}`}>
        {PLAYER_COLORS.map((c) => {
          const on = c.hex === player.color;
          return (
            <Pressable
              key={c.hex}
              accessibilityRole="radio"
              accessibilityLabel={c.label}
              accessibilityState={{ selected: on, checked: on }}
              onPress={() => {
                tap();
                updatePlayer(player.id, { color: c.hex });
              }}
              style={[s.swatch, { borderColor: on ? theme.c.ink : theme.c.lineStrong, borderWidth: on ? 3 : theme.c.border }]}
            >
              <View style={[s.swatchFill, { backgroundColor: c.hex }]} />
            </Pressable>
          );
        })}
      </View>
      <View style={s.swatches} accessibilityRole="radiogroup" accessibilityLabel={`Forma de ${player.name}`}>
        {SHAPES.map((shape) => {
          const on = shape === player.shape;
          return (
            <Pressable
              key={shape}
              accessibilityRole="radio"
              accessibilityLabel={SHAPE_LABEL[shape]}
              accessibilityState={{ selected: on, checked: on }}
              onPress={() => {
                tap();
                updatePlayer(player.id, { shape });
              }}
              style={[s.swatch, { borderColor: on ? theme.c.ink : 'transparent', borderWidth: on ? 3 : 0, backgroundColor: on ? theme.c.surfaceAlt : 'transparent' }]}
            >
              <PlayerShape shape={shape} color={player.color} size={26} />
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}

const makeStyles = ({ c, t }: Theme) =>
  StyleSheet.create({
    topBar: { paddingHorizontal: gutter - 4, paddingTop: space.s },
    body: { paddingHorizontal: gutter, paddingBottom: 60, gap: space.m },
    title: { ...t.display, color: c.ink },
    hint: { ...t.body, color: c.inkSoft },
    addRow: { flexDirection: 'row', gap: space.s, alignItems: 'center', flexWrap: 'wrap' },
    input: { flexGrow: 1, flexBasis: 160, minHeight: 52, ...t.body, color: c.ink, paddingHorizontal: space.l, borderRadius: radius.pill, borderWidth: c.border, borderColor: c.lineStrong, backgroundColor: c.surface },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: space.m },
    nameInput: { ...t.hand, flexBasis: 0, flex: 1, backgroundColor: c.bg },
    swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
    swatch: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    swatchFill: { width: 32, height: 32, borderRadius: 16 },
  });
