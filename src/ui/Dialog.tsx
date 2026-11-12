import { useEffect, useMemo, useRef } from 'react';
import { AccessibilityInfo, Animated, Image, Modal, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';
import { useTheme } from '../store/settingsStore';
import { Button } from './components';
import { Icon, type IconName } from './icons';
import { ENTER, useReducedMotion } from './motion';
import { gutter, motion, radius, space, type Theme } from './theme';

export interface DialogButton {
  readonly text: string;
  /** cancel: botón secundario y lo que hace «atrás»; destructive: en coral. */
  readonly style?: 'default' | 'cancel' | 'destructive';
  readonly onPress?: () => void;
}

interface DialogRequest {
  readonly id: number;
  readonly title: string;
  readonly message?: string;
  readonly buttons: readonly DialogButton[];
  /** Dibujo que asoma por encima de la hoja. */
  readonly art?: ImageSourcePropType;
  readonly icon?: IconName;
}

const useDialogs = create<{ queue: readonly DialogRequest[] }>()(() => ({ queue: [] }));
let nextId = 1;

/** Sustituye a Alert.alert con la piel de Juegolín: hoja de papel, borde de tinta. */
export function showDialog(
  title: string,
  message?: string,
  buttons: readonly DialogButton[] = [{ text: 'Vale' }],
  extra: { art?: ImageSourcePropType; icon?: IconName } = {},
): void {
  useDialogs.setState((s) => ({ queue: [...s.queue, { id: nextId++, title, message, buttons, ...extra }] }));
}

/** Pregunta y espera la respuesta: true con el botón principal, false al cancelar. */
export function askDialog(
  title: string,
  message: string,
  confirm: string,
  options: { cancel?: string; destructive?: boolean; art?: ImageSourcePropType; icon?: IconName } = {},
): Promise<boolean> {
  return new Promise((resolve) => {
    showDialog(
      title,
      message,
      [
        { text: options.cancel ?? 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: confirm, style: options.destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
      ],
      { art: options.art, icon: options.icon },
    );
  });
}

const close = (id: number): void => useDialogs.setState((s) => ({ queue: s.queue.filter((d) => d.id !== id) }));

/** Se monta una vez en App: muestra el primer diálogo de la cola. */
export function DialogHost() {
  const current = useDialogs((s) => s.queue[0] ?? null);
  if (!current) return null;
  return <DialogView key={current.id} dialog={current} />;
}

function DialogView({ dialog }: { dialog: DialogRequest }) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const reduced = useReducedMotion();
  const shown = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(shown, { toValue: 1, duration: reduced ? motion.fast : motion.slow, easing: ENTER, useNativeDriver: true }).start();
    AccessibilityInfo.announceForAccessibility(dialog.message ? `${dialog.title}. ${dialog.message}` : dialog.title);
  }, [dialog.message, dialog.title, reduced, shown]);

  const press = (button: DialogButton | undefined) => {
    close(dialog.id);
    button?.onPress?.();
  };
  const cancel = dialog.buttons.find((b) => b.style === 'cancel');
  const onBack = () => (cancel || dialog.buttons.length === 1 ? press(cancel ?? dialog.buttons[0]) : undefined);
  // El principal arriba y el de cancelar debajo: en columna se leen mejor y caben con letra grande.
  const ordered = [...dialog.buttons].sort((a, b) => Number(a.style === 'cancel') - Number(b.style === 'cancel'));

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={onBack}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: theme.c.scrim, opacity: shown }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onBack} accessible={false} />
      </Animated.View>
      <View style={styles.center} pointerEvents="box-none">
        <Animated.View
          accessibilityViewIsModal
          style={[
            styles.card,
            dialog.art ? { paddingTop: 0 } : null,
            { opacity: shown, transform: reduced ? [] : [{ translateY: shown.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] },
          ]}
        >
          {dialog.art ? (
            <View style={styles.art} accessible={false}>
              <Image source={dialog.art} resizeMode="contain" style={{ width: '100%', height: '100%', tintColor: theme.c.ink }} />
            </View>
          ) : dialog.icon ? (
            <View style={styles.iconWrap} accessible={false}>
              <Icon name={dialog.icon} size={30} color={theme.c.ink} />
            </View>
          ) : null}
          <Text style={styles.title} accessibilityRole="header">
            {dialog.title}
          </Text>
          {dialog.message ? <Text style={styles.message}>{dialog.message}</Text> : null}
          <View style={styles.buttons}>
            {ordered.map((b) => (
              <Button key={b.text} label={b.text} variant={b.style === 'cancel' ? 'secondary' : b.style === 'destructive' ? 'danger' : 'primary'} onPress={() => press(b)} />
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

/* ---------- Notitas: avisos breves que se van solos ---------- */

interface Note {
  readonly id: number;
  readonly title: string;
  readonly body?: string;
}

const useNotes = create<{ note: Note | null }>()(() => ({ note: null }));
let timer: ReturnType<typeof setTimeout> | null = null;

/** Notita pegada con cinta: aparece arriba 3,5 s. TalkBack la lee en voz alta. */
export function showNote(title: string, body?: string): void {
  if (timer) clearTimeout(timer);
  useNotes.setState({ note: { id: nextId++, title, body } });
  AccessibilityInfo.announceForAccessibility(body ? `${title}. ${body}` : title);
  timer = setTimeout(() => useNotes.setState({ note: null }), 3500);
}

export function NoteHost() {
  const note = useNotes((s) => s.note);
  if (!note) return null;
  return <NoteView key={note.id} note={note} />;
}

function NoteView({ note }: { note: Note }) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const shown = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(shown, { toValue: 1, duration: reduced ? motion.fast : motion.slow, easing: ENTER, useNativeDriver: true }).start();
  }, [reduced, shown]);
  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      pointerEvents="box-none"
      style={[
        styles.note,
        { top: insets.top + space.m, opacity: shown, transform: [{ rotate: '-1.5deg' }, ...(reduced ? [] : [{ translateY: shown.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }])] },
      ]}
    >
      <View style={styles.tape} />
      <Pressable onPress={() => useNotes.setState({ note: null })} accessibilityRole="button" accessibilityHint="Cierra el aviso" style={styles.noteInner}>
        <Icon name="check" size={26} color={theme.c.stamp} />
        <View style={{ flex: 1 }}>
          <Text style={styles.noteTitle}>{note.title}</Text>
          {note.body ? <Text style={styles.noteBody}>{note.body}</Text> : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const makeStyles = ({ c, t }: Theme) =>
  StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', paddingHorizontal: gutter },
    card: {
      backgroundColor: c.surface,
      borderRadius: radius.sheet,
      borderWidth: c.border,
      borderColor: c.ink,
      padding: space.xl,
      gap: space.m,
      alignItems: 'stretch',
      elevation: 8,
      shadowColor: '#000',
      shadowOpacity: 0.18,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
    },
    art: { height: 120, marginTop: -56, marginBottom: -space.s, alignSelf: 'center', width: 170 },
    iconWrap: { width: 56, height: 56, borderRadius: 28, borderWidth: c.border, borderColor: c.ink, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
    title: { ...t.headline, color: c.ink, textAlign: 'center' },
    message: { ...t.body, color: c.inkSoft, textAlign: 'center' },
    buttons: { gap: space.s, marginTop: space.s },
    note: { position: 'absolute', left: gutter + 12, right: gutter + 12, backgroundColor: c.note, borderWidth: c.border, borderColor: c.ink, borderRadius: 6, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, elevation: 6 },
    tape: { position: 'absolute', top: -9, alignSelf: 'center', width: 56, height: 16, backgroundColor: 'rgba(133,233,225,0.8)', transform: [{ rotate: '3deg' }] },
    noteInner: { flexDirection: 'row', alignItems: 'center', gap: space.m, padding: space.l, minHeight: 64 },
    noteTitle: { ...t.hand, color: c.ink },
    noteBody: { ...t.caption, color: c.ink },
  });
