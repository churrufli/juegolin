import appConfig from '../../app.json';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PALETTES, STYLE_NAMES, TYPE_LABELS, TYPE_NAMES, brand, gutter, radius, space, type StyleName, type Theme } from '../ui/theme';
import { clearStamps, useJournal } from '../store/journalStore';
import { updateSettings, useSettings, useTheme } from '../store/settingsStore';
import { Card, PlayerShape, Screen, SectionLabel, Segmented, SwitchRow, useStyles } from '../ui/components';
import { askDialog, showNote } from '../ui/Dialog';
import { tap } from '../ui/feedback';
import { Icon } from '../ui/icons';
import { ILLUSTRATIONS } from '../ui/illustrations';
import { pushOverlay } from '../ui/uiStore';
import { runUpdateCheck } from '../ui/updateCheck';
import type { IconName } from '../ui/icons';

const PREVIEW = ILLUSTRATIONS.rayuela;

export function SettingsScreen() {
  const theme = useTheme();
  const s = useStyles(makeStyles);
  const settings = useSettings();
  const players = useJournal((st) => st.players);
  const stamps = useJournal((st) => Object.keys(st.plays).length);
  const version = appConfig.expo.version;

  const wipe = async () => {
    const ok = await askDialog('¿Borrar todos los sellos?', `Se quitarán los ${stamps} sellos y las insignias. No se puede deshacer.`, 'Borrar sellos', { destructive: true, icon: 'trash' });
    if (ok) {
      await clearStamps();
      showNote('Cuaderno en blanco', 'Se han borrado los sellos.');
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={s.body}>
        <Text style={s.title} accessibilityRole="header">
          Opciones
        </Text>

        <SectionLabel icon="chalk">Estilo del cuaderno</SectionLabel>
        <View style={s.styles} accessibilityRole="radiogroup" accessibilityLabel="Estilo del cuaderno">
          <AutoCard selected={settings.auto} />
          {STYLE_NAMES.map((name) => (
            <StyleCard key={name} name={name} selected={!settings.auto && settings.style === name} />
          ))}
        </View>

        <SectionLabel icon="pencil">Letra</SectionLabel>
        <Segmented options={TYPE_NAMES} value={settings.type} onChange={(type) => void updateSettings({ type })} format={(v) => TYPE_LABELS[v]} label="Letra" />
        <Text style={s.hint}>La app también respeta el tamaño de letra del sistema.</Text>

        <Card style={{ paddingVertical: 0 }}>
          <SwitchRow label="Animaciones mínimas" hint="Solo fundidos suaves. Se activa sola si el móvil pide quitar animaciones." value={settings.calm} onChange={(calm) => void updateSettings({ calm })} />
          <SwitchRow label="Vibración" hint="Al sellar, al terminar el temporizador y al tocar" value={settings.vibration} onChange={(vibration) => void updateSettings({ vibration })} last />
        </Card>

        <SectionLabel icon="people">Jugadores</SectionLabel>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Jugadores de siempre: ${players.length === 0 ? 'ninguno' : players.map((p) => p.name).join(', ')}`}
          accessibilityHint="Editar nombres, colores y formas"
          onPress={() => {
            tap();
            pushOverlay({ name: 'players' });
          }}
          style={({ pressed }) => [s.row, { opacity: pressed ? 0.75 : 1 }]}
        >
          <View style={{ flex: 1, gap: space.s }}>
            <Text style={s.rowTitle}>Jugadores de siempre</Text>
            {players.length > 0 ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {players.slice(0, 10).map((p) => (
                  <PlayerShape key={p.id} shape={p.shape} color={p.color} size={24} />
                ))}
              </View>
            ) : (
              <Text style={s.hint}>Añade nombres, colores y formas</Text>
            )}
          </View>
          <Icon name="chevron" size={22} color={theme.c.ink} />
        </Pressable>

        {stamps > 0 ? (
          <>
            <SectionLabel icon="notebook">Cuaderno</SectionLabel>
            <Pressable accessibilityRole="button" onPress={wipe} style={({ pressed }) => [s.row, { borderColor: theme.c.danger, opacity: pressed ? 0.75 : 1 }]}>
              <Icon name="trash" size={22} color={theme.c.danger} />
              <Text style={[s.rowTitle, { color: theme.c.danger, flex: 1 }]}>Borrar todos los sellos</Text>
            </Pressable>
          </>
        ) : null}

        <SectionLabel icon="book">Ayuda</SectionLabel>
        <View style={s.group}>
          <LinkRow icon="book" label="Cómo se usa" onPress={() => pushOverlay({ name: 'manual' })} />
          <LinkRow icon="reset" label="Buscar actualizaciones" onPress={() => void runUpdateCheck()} />
          <LinkRow icon="spark" label="Acerca de Juegolín" onPress={() => pushOverlay({ name: 'about' })} last />
        </View>

        <Text style={[s.hint, { textAlign: 'center', marginTop: space.l }]}>Juegolín {version}</Text>
      </ScrollView>
    </Screen>
  );
}

function LinkRow({ icon, label, onPress, last }: { icon: IconName; label: string; onPress: () => void; last?: boolean }) {
  const theme = useTheme();
  const s = useStyles(makeStyles);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [s.linkRow, !last && { borderBottomWidth: 1 }, { opacity: pressed ? 0.75 : 1 }]}
    >
      <Icon name={icon} size={22} color={theme.c.ink} />
      <Text style={[s.rowTitle, { flex: 1 }]}>{label}</Text>
      <Icon name="chevron" size={22} color={theme.c.ink} />
    </Pressable>
  );
}

/** Automático: sigue el modo claro u oscuro del móvil. */
function AutoCard({ selected }: { selected: boolean }) {
  const theme = useTheme();
  const s = useStyles(makeStyles);
  const light = PALETTES.papiro;
  const dark = PALETTES.pizarra;
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel="Automático: Papiro con el móvil en modo claro y Pizarra en modo oscuro"
      accessibilityState={{ selected, checked: selected }}
      onPress={() => {
        tap();
        void updateSettings({ auto: true });
      }}
      style={({ pressed }) => [s.styleCard, { borderColor: selected ? theme.c.ink : theme.c.line, borderWidth: selected ? 2.5 : theme.c.border, opacity: pressed ? 0.8 : 1 }]}
    >
      <View style={[s.stylePreview, { flexDirection: 'row' }]}>
        <View style={{ flex: 1, alignSelf: 'stretch', backgroundColor: light.bg, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="sun" size={30} color={light.ink} />
        </View>
        <View style={{ flex: 1, alignSelf: 'stretch', backgroundColor: dark.bg, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="moon" size={30} color={dark.ink} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {selected ? <Icon name="check" size={18} color={theme.c.ink} /> : null}
        <Text style={s.styleName}>Automático</Text>
      </View>
      <Text style={s.styleDesc}>Papiro de día, Pizarra con el móvil en modo oscuro</Text>
    </Pressable>
  );
}

function StyleCard({ name, selected }: { name: StyleName; selected: boolean }) {
  const theme = useTheme();
  const s = useStyles(makeStyles);
  const p = PALETTES[name];
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={`${p.label}: ${p.description}`}
      accessibilityState={{ selected, checked: selected }}
      onPress={() => {
        tap();
        void updateSettings({ style: name, auto: false });
      }}
      style={({ pressed }) => [s.styleCard, { borderColor: selected ? theme.c.ink : theme.c.line, borderWidth: selected ? 2.5 : theme.c.border, opacity: pressed ? 0.8 : 1 }]}
    >
      <View style={[s.stylePreview, { backgroundColor: p.bg, borderColor: p.line, borderWidth: name === 'contraste' ? 2 : 0 }]}>
        {p.washOpacity > 0 ? <View style={[s.previewWash, { backgroundColor: name === 'pizarra' ? brand.turquoise : brand.yellow, opacity: p.washOpacity }]} /> : null}
        {name === 'lapices' ? <View style={[s.previewWash2, { backgroundColor: brand.coral, opacity: 0.55 }]} /> : null}
        {PREVIEW ? <Image source={PREVIEW} resizeMode="contain" style={{ width: '90%', height: '90%', tintColor: p.ink }} /> : null}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {selected ? <Icon name="check" size={18} color={theme.c.ink} /> : null}
        <Text style={s.styleName}>{p.label}</Text>
      </View>
      <Text style={s.styleDesc}>{p.description}</Text>
    </Pressable>
  );
}

const makeStyles = ({ c, t }: Theme) =>
  StyleSheet.create({
    body: { paddingHorizontal: gutter, paddingTop: space.l, paddingBottom: 130, gap: space.m },
    title: { ...t.display, color: c.ink, marginBottom: space.s },
    hint: { ...t.caption, color: c.inkSoft },
    styles: { flexDirection: 'row', flexWrap: 'wrap', gap: space.m },
    styleCard: { flexGrow: 1, flexBasis: 140, padding: space.s, borderRadius: radius.card, backgroundColor: c.surface, gap: 4 },
    stylePreview: { height: 92, borderRadius: radius.sm + 4, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    previewWash: { position: 'absolute', width: 90, height: 60, borderRadius: 40, top: 18, left: 28 },
    previewWash2: { position: 'absolute', width: 60, height: 50, borderRadius: 30, top: 6, right: 10 },
    styleName: { ...t.bodyStrong, color: c.ink },
    styleDesc: { ...t.caption, color: c.inkSoft },
    row: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 64, padding: space.l, borderRadius: radius.card, backgroundColor: c.surface, borderWidth: c.border, borderColor: c.line },
    rowTitle: { ...t.bodyStrong, color: c.ink },
    group: { borderRadius: radius.card, backgroundColor: c.surface, borderWidth: c.border, borderColor: c.line, paddingHorizontal: space.l },
    linkRow: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 56, borderColor: c.line },
  });
