import { useEffect, useState } from 'react';
import { AccessibilityInfo, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { describePlayer, MAX_NAME } from '../domain/players';
import type { Juego } from '../domain/types';
import { addPlayer, useJournal } from '../store/journalStore';
import { useTheme } from '../store/settingsStore';
import { Button, Chip, IconButton, PlayerShape, useStyles } from '../ui/components';
import { tap } from '../ui/feedback';
import { Icon } from '../ui/icons';
import { Sheet } from '../ui/motion';
import { radius, space, type Theme } from '../ui/theme';

const NONE: readonly string[] = [];

/** «¿Quién ha jugado?»: elige quién firma en el cuaderno antes de poner el sello. */
export function SignSheet({ game, open, onClose, onSign }: { game: Juego; open: boolean; onClose: () => void; onSign: (playerIds: readonly string[], winners: readonly string[]) => void }) {
  const theme = useTheme();
  const s = useStyles(makeStyles);
  const players = useJournal((st) => st.players);
  const signed = useJournal((st) => st.plays[game.id]?.signers) ?? NONE;
  const [chosen, setChosen] = useState<readonly string[]>([]);
  const [winners, setWinners] = useState<readonly string[]>([]);
  const [name, setName] = useState('');

  useEffect(() => {
    if (open) {
      setChosen([]);
      setWinners([]);
    }
  }, [open]);

  const toggle = (id: string) => {
    setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
    setWinners((w) => w.filter((x) => x !== id || !chosen.includes(id)));
  };
  const toggleWinner = (id: string) => setWinners((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));
  const add = () => {
    const p = addPlayer(name);
    setName('');
    setChosen((c) => [...c, p.id]);
    AccessibilityInfo.announceForAccessibility(`${describePlayer(p)} añadido`);
  };

  const footer = (
    <View style={s.footer}>
      <Button label={chosen.length === 0 ? 'Sellar sin firmas' : chosen.length === 1 ? 'Firmar y sellar' : `Firmar los ${chosen.length} y sellar`} icon="seal" onPress={() => onSign(chosen, winners.filter((w) => chosen.includes(w)))} />
    </View>
  );

  return (
    <Sheet open={open} onClose={onClose} title="¿Quién ha jugado?" footer={footer}>
      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        <Text style={s.hint}>La partida queda apuntada en el cuaderno de {game.nombre} con la fecha y la firma de cada uno.</Text>
        <View style={s.grid}>
          {players.map((p) => {
            const on = chosen.includes(p.id);
            const already = signed.includes(p.id);
            return (
              <Pressable
                key={p.id}
                accessibilityRole="checkbox"
                accessibilityLabel={`${describePlayer(p)}${already ? ', ya ha firmado' : ''}`}
                accessibilityState={{ checked: on }}
                onPress={() => {
                  tap();
                  toggle(p.id);
                }}
                style={[s.pick, on && { borderColor: theme.c.ink, backgroundColor: theme.c.surfaceAlt }]}
              >
                <PlayerShape shape={p.shape} color={p.color} size={26} />
                <Text style={s.pickName} numberOfLines={1}>
                  {p.name}
                </Text>
                {on ? <Icon name="check" size={18} color={theme.c.ink} /> : already ? <Text style={s.already}>firmado</Text> : null}
              </Pressable>
            );
          })}
        </View>
        {chosen.length > 1 ? (
          <View style={{ gap: space.s }}>
            <Text style={s.question} accessibilityRole="header">
              ¿Quién ha ganado? <Text style={s.hint}>(si queréis)</Text>
            </Text>
            <View style={s.grid}>
              {chosen.map((id) => {
                const p = players.find((x) => x.id === id);
                if (!p) return null;
                const on = winners.includes(id);
                return (
                  <Chip key={id} label={p.name} icon="star" selected={on} onPress={() => toggleWinner(id)} />
                );
              })}
            </View>
          </View>
        ) : null}
        <View style={s.addRow}>
          <TextInput
            value={name}
            onChangeText={setName}
            onSubmitEditing={() => name.trim() && add()}
            placeholder="Otro nombre"
            placeholderTextColor={theme.c.inkSoft}
            maxLength={MAX_NAME}
            accessibilityLabel="Nombre de otro jugador"
            style={s.input}
            returnKeyType="done"
          />
          <IconButton icon="plus" label="Añadir jugador" onPress={() => (name.trim() ? add() : undefined)} />
        </View>
      </ScrollView>
    </Sheet>
  );
}

const makeStyles = ({ c, t }: Theme) =>
  StyleSheet.create({
    body: { gap: space.l, paddingBottom: space.l },
    hint: { ...t.body, color: c.inkSoft },
    question: { ...t.title, color: c.ink },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
    pick: { flexDirection: 'row', alignItems: 'center', gap: space.s, minHeight: 48, paddingHorizontal: space.m, borderRadius: radius.pill, borderWidth: c.border, borderColor: c.lineStrong, maxWidth: '100%' },
    pickName: { ...t.hand, color: c.ink, flexShrink: 1 },
    already: { ...t.caption, color: c.inkSoft },
    addRow: { flexDirection: 'row', gap: space.s, alignItems: 'center' },
    input: { flex: 1, minHeight: 48, ...t.body, color: c.ink, paddingHorizontal: space.l, borderRadius: radius.pill, borderWidth: c.border, borderColor: c.lineStrong, backgroundColor: c.bg },
    footer: { paddingTop: space.m, borderTopWidth: 1, borderColor: c.line },
  });
