import { Caveat_700Bold } from '@expo-google-fonts/caveat/700Bold';
import { Fraunces_500Medium } from '@expo-google-fonts/fraunces/500Medium';
import { Nunito_400Regular } from '@expo-google-fonts/nunito/400Regular';
import { Nunito_700Bold } from '@expo-google-fonts/nunito/700Bold';
import { Nunito_800ExtraBold } from '@expo-google-fonts/nunito/800ExtraBold';
import { useFonts } from 'expo-font';
import { NavigationBar } from 'expo-navigation-bar';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, BackHandler, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { gameById } from './src/domain/catalog';
import { AboutScreen } from './src/screens/AboutScreen';
import { AssistantScreen } from './src/screens/AssistantScreen';
import { BadgesScreen } from './src/screens/BadgesScreen';
import { KitScreen } from './src/screens/KitScreen';
import { ExploreScreen } from './src/screens/ExploreScreen';
import { GameScreen } from './src/screens/GameScreen';
import { ManualScreen } from './src/screens/ManualScreen';
import { PlayersScreen } from './src/screens/PlayersScreen';
import { PlayScreen } from './src/screens/PlayScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { StampsScreen } from './src/screens/StampsScreen';
import { hydrateJournal, useJournal } from './src/store/journalStore';
import { hydrateSettings, useSettingsStore, useTheme } from './src/store/settingsStore';
import { useStyles } from './src/ui/components';
import { CelebrationHost } from './src/ui/Celebration';
import { DialogHost, NoteHost } from './src/ui/Dialog';
import { tap } from './src/ui/feedback';
import { Icon, type IconName } from './src/ui/icons';
import { Scene, type Enter } from './src/ui/motion';
import { radius, space, type Theme } from './src/ui/theme';
import { TABS, popOverlay, setTab, useUiStore, type Overlay, type Tab } from './src/ui/uiStore';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const TAB_INFO: Record<Tab, { label: string; icon: IconName }> = {
  explore: { label: 'Juegos', icon: 'book' },
  play: { label: 'Partida', icon: 'timer' },
  stamps: { label: 'Sellos', icon: 'seal' },
  settings: { label: 'Opciones', icon: 'sliders' },
};

function useBackButton(): void {
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      const ui = useUiStore.getState();
      if (ui.overlays.length > 0) {
        popOverlay();
        return true;
      }
      if (ui.tab !== 'explore') {
        setTab('explore');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, []);
}

const overlayId = (o: Overlay): string => (o.name === 'game' ? `game:${o.id}` : o.name === 'play' ? `play:${o.gameId}` : o.name);

function announceOf(o: Overlay | null, tab: Tab): string {
  if (!o) return TAB_INFO[tab].label;
  if (o.name === 'game') return gameById(o.id)?.nombre ?? '';
  if (o.name === 'play') return `Partida de ${gameById(o.gameId)?.nombre ?? ''}`;
  if (o.name === 'manual') return 'Cómo se usa';
  if (o.name === 'about') return 'Acerca de Juegolín';
  if (o.name === 'assistant') return 'Asistente para jugar';
  if (o.name === 'badges') return 'Todas las insignias';
  if (o.name === 'kit') return 'El kit de Juegolín';
  return 'Jugadores de siempre';
}

/** Abrir sube, volver entra por la izquierda y entre pestañas se desliza hacia el lado de la pestaña nueva. */
function enterFor(prev: { depth: number; tab: Tab }, next: { depth: number; tab: Tab }): Enter {
  if (next.depth > prev.depth) return 'rise';
  if (next.depth < prev.depth) return 'back';
  if (next.depth === 0 && next.tab !== prev.tab) return TABS.indexOf(next.tab) > TABS.indexOf(prev.tab) ? 'right' : 'left';
  return 'rise';
}

/** Elige la entrada según de dónde se viene y anuncia el cambio a TalkBack. */
function Transition({ id, announce, enter, children }: { id: string; announce: string; enter: Enter; children: ReactNode }) {
  const previous = useRef(id);
  useEffect(() => {
    if (previous.current === id) return;
    previous.current = id;
    if (announce) AccessibilityInfo.announceForAccessibility(announce);
  }, [id, announce]);
  return (
    <Scene id={id} enter={enter}>
      {children}
    </Scene>
  );
}

function OverlayScreen({ overlay }: { overlay: Overlay }) {
  switch (overlay.name) {
    case 'game':
      return <GameScreen key={overlay.id} id={overlay.id} />;
    case 'play':
      return <PlayScreen gameId={overlay.gameId} />;
    case 'players':
      return <PlayersScreen />;
    case 'manual':
      return <ManualScreen />;
    case 'about':
      return <AboutScreen />;
    case 'assistant':
      return <AssistantScreen />;
    case 'badges':
      return <BadgesScreen />;
    case 'kit':
      return <KitScreen />;
  }
}

function TabScreen({ tab }: { tab: Tab }) {
  switch (tab) {
    case 'explore':
      return <ExploreScreen />;
    case 'play':
      return <PlayScreen gameId={null} />;
    case 'stamps':
      return <StampsScreen />;
    case 'settings':
      return <SettingsScreen />;
  }
}

function TabBar() {
  const theme = useTheme();
  const s = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const tab = useUiStore((st) => st.tab);
  return (
    <View style={[s.tabBar, { bottom: insets.bottom + space.m }]} accessibilityRole="tablist">
      {(Object.keys(TAB_INFO) as Tab[]).map((t) => {
        const on = t === tab;
        const info = TAB_INFO[t];
        return (
          <Pressable
            key={t}
            accessibilityRole="tab"
            accessibilityLabel={info.label}
            accessibilityState={{ selected: on }}
            onPress={() => {
              if (on) return;
              tap();
              setTab(t);
            }}
            style={s.tab}
          >
            <View style={[s.tabPill, on && { backgroundColor: theme.c.ink }]}>
              <Icon name={info.icon} size={22} color={on ? theme.c.onInk : theme.c.inkSoft} />
            </View>
            <Text style={[s.tabLabel, { color: on ? theme.c.ink : theme.c.inkSoft }, on && { fontFamily: theme.t.overline.fontFamily }]} numberOfLines={1}>
              {info.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const LOADING = require('./assets/cargando.png');

/** Pantalla de carga: símbolo, «Juegolín», los dos lemas y «Cargando…», sobre el mismo papel que la imagen de arranque. */
function Loading() {
  return (
    <View
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5EDDB' }}
      accessible
      accessibilityLabel="Juegolín. Dadle el móvil a los niños y que jueguen. Ayuda y dinamiza el juego para niños y jóvenes. Cargando…"
    >
      <Image source={LOADING} style={{ width: 300, height: 282 }} resizeMode="contain" />
    </View>
  );
}

function Root() {
  const settingsReady = useSettingsStore((s) => s.hydrated);
  const journalReady = useJournal((s) => s.hydrated);
  const hydrated = settingsReady && journalReady;
  const tab = useUiStore((s) => s.tab);
  const overlay = useUiStore((s) => s.overlays.at(-1) ?? null);
  const depth = useUiStore((s) => s.overlays.length);
  const nav = useRef({ depth, tab });
  // Si las fuentes no cargan, se sigue con las del sistema: nunca se bloquea el arranque.
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_500Medium,
    Nunito_400Regular,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Caveat_700Bold,
  });
  const ready = hydrated && (fontsLoaded || !!fontError);

  useEffect(() => {
    void Promise.all([hydrateSettings(), hydrateJournal()]);
  }, []);
  // La imagen de arranque de Android solo admite el símbolo: en cuanto se pinta la app,
  // se cambia por la pantalla de carga con el nombre y los lemas, que se queda lo justo para leerlos.
  const [shownLoading, setShownLoading] = useState(false);
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => undefined);
    const id = setTimeout(() => setShownLoading(true), 1800);
    return () => clearTimeout(id);
  }, []);
  useBackButton();

  if (!ready || !shownLoading) return <Loading />;
  const id = overlay ? overlayId(overlay) : `tab:${tab}`;
  const enter = enterFor(nav.current, { depth, tab });
  nav.current = { depth, tab };
  return (
    <>
      <Transition id={id} enter={enter} announce={announceOf(overlay, tab)}>
        {overlay ? <OverlayScreen overlay={overlay} /> : <TabScreen tab={tab} />}
      </Transition>
      {overlay ? null : <TabBar />}
    </>
  );
}

function Themed() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.c.bg }}>
      <StatusBar style={theme.c.dark ? 'light' : 'dark'} />
      {/* Botones de Android oscuros sobre papel claro y claros sobre pizarra, para que siempre se vean. */}
      <NavigationBar style={theme.c.dark ? 'dark' : 'light'} />
      <Root />
      <NoteHost />
      <CelebrationHost />
      <DialogHost />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Themed />
    </SafeAreaProvider>
  );
}

const makeStyles = ({ c, t }: Theme) =>
  StyleSheet.create({
    tabBar: {
      position: 'absolute',
      left: space.l,
      right: space.l,
      flexDirection: 'row',
      backgroundColor: c.surface,
      borderRadius: radius.pill,
      borderWidth: c.border,
      borderColor: c.line,
      paddingVertical: space.s,
      paddingHorizontal: space.xs,
      elevation: 6,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
    },
    tab: { flex: 1, alignItems: 'center', gap: 2, minHeight: 56, justifyContent: 'center' },
    tabPill: { width: 56, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    tabLabel: { ...t.caption, fontSize: Math.min(13, t.caption.fontSize ?? 13) },
  });
