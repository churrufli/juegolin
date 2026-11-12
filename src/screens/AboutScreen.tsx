import appConfig from '../../app.json';
import { Image, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GAMES } from '../domain/catalog';
import { BUILD, RELEASES_PAGE } from '../domain/updates';
import { useTheme } from '../store/settingsStore';
import { Button, IconButton, Screen, SectionLabel, useStyles } from '../ui/components';
import { HowToUse } from '../ui/HowToUse';
import { gutter, radius, space, type Theme } from '../ui/theme';
import { popOverlay } from '../ui/uiStore';
import { runUpdateCheck } from '../ui/updateCheck';

const LOGO_MARK = require('../../assets/logo-simbolo.png');
const LOGO_TEXT = require('../../assets/logo-texto.png');

export function AboutScreen() {
  const { c } = useTheme();
  const s = useStyles(makeStyles);
  const version = `${appConfig.expo.version}${BUILD > 0 ? ` (compilación ${BUILD})` : ''}`;
  return (
    <Screen>
      <View style={s.topBar}>
        <IconButton icon="back" label="Volver" onPress={popOverlay} />
      </View>
      <ScrollView contentContainerStyle={s.body}>
        <View style={s.brand} accessible accessibilityRole="header" accessibilityLabel={`Juegolín, versión ${version}`}>
          <Image source={LOGO_MARK} style={s.mark} resizeMode="contain" />
          <View style={{ gap: space.xs }}>
            <Image source={LOGO_TEXT} style={[s.text, { tintColor: c.ink }]} resizeMode="contain" />
            <Text style={s.version}>Versión {version}</Text>
          </View>
        </View>
        <View style={s.mottos} accessible accessibilityLabel="Dadle el móvil a los niños y que jueguen. Ayuda y dinamiza el juego para niños y jóvenes.">
          <Text style={s.motto}>Dadle el móvil a los niños y que jueguen.</Text>
          <Text style={s.motto2}>Ayuda y dinamiza el juego para niños y jóvenes.</Text>
        </View>
        <Text style={s.lead}>
          Un cuaderno de {GAMES.length} juegos de siempre para jugar en el patio, en casa, en el campo o de viaje: cómo se preparan, cómo se juegan y quién ha jugado.
        </Text>

        <SectionLabel icon="spark">Cómo se usa</SectionLabel>
        <HowToUse />

        <Button label="Buscar actualizaciones" icon="reset" variant="secondary" onPress={() => void runUpdateCheck()} />

        <SectionLabel icon="notebook">Tus datos</SectionLabel>
        <Text style={s.para}>Juegolín funciona sin internet y no tiene cuentas ni anuncios. Sellos, firmas y jugadores se guardan solo en este móvil. Solo se conecta a GitHub cuando tú buscas actualizaciones.</Text>

        <SectionLabel icon="book">Juegos</SectionLabel>
        <Text style={s.para}>Recopilados y reescritos a partir de guías de juegos tradicionales, libros de juegos scout y recopilaciones de juegos del mundo y de viaje. Cada juego se ha revisado y adaptado para leerse rápido.</Text>

        <SectionLabel icon="pencil">Letras y dibujos</SectionLabel>
        <Text style={s.para}>Letras Fraunces, Nunito y Caveat, con licencia libre SIL Open Font License. Ilustraciones y esquemas en trazo de tinta hechos para Juegolín.</Text>

        <Button label="Página de versiones en GitHub" icon="next" variant="ghost" onPress={() => void Linking.openURL(RELEASES_PAGE).catch(() => undefined)} />
      </ScrollView>
    </Screen>
  );
}

const makeStyles = ({ c, t }: Theme) =>
  StyleSheet.create({
    topBar: { flexDirection: 'row', paddingHorizontal: gutter - 4, paddingTop: space.s },
    body: { paddingHorizontal: gutter, paddingBottom: 60, gap: space.m },
    brand: { flexDirection: 'row', alignItems: 'center', gap: space.l, padding: space.l, borderRadius: radius.card, backgroundColor: c.surface, borderWidth: c.border, borderColor: c.line },
    mark: { width: 96, height: 40 },
    text: { width: 150, height: 38 },
    version: { ...t.caption, color: c.inkSoft },
    mottos: { gap: space.xs, paddingHorizontal: space.s, alignItems: 'center' },
    motto: { ...t.handLarge, color: c.ink, textAlign: 'center' },
    motto2: { ...t.body, color: c.inkSoft, textAlign: 'center' },
    lead: { ...t.body, color: c.ink },
    para: { ...t.body, color: c.inkSoft },
  });
