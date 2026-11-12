import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../store/settingsStore';
import { useStyles } from './components';
import { Icon, type IconName } from './icons';
import { radius, space, type Theme } from './theme';

const SECTIONS: readonly { icon: IconName; title: string; items: readonly string[] }[] = [
  {
    icon: 'search',
    title: '1. Elegir un juego',
    items: [
      '«¿No sabéis a qué jugar?» hace unas preguntas (cuántos sois, dónde estáis, qué tenéis a mano) y propone juegos.',
      'En el buscador escribe el nombre o algo que recuerdes: «pañuelo», «tiza», «coche».',
      'Los botones redondos filtran rápido y en Filtros eliges edad, jugadores, sitio, material, duración y más.',
      '«El kit de Juegolín» enseña el material de casa que piden los juegos, primero lo que sirve para más.',
      'El dado abre un juego al azar. Abajo salen juegos parecidos a los que ya habéis jugado.',
    ],
  },
  {
    icon: 'book',
    title: '2. Leer la ficha',
    items: [
      'Arriba van edades, jugadores, duración, sitio y material.',
      'Si hay que marcar el suelo o colocar algo, el esquema lo enseña. Los números del dibujo son los pasos.',
      'Después vienen la preparación, cómo se juega y cómo se gana, en pasos cortos, y otras formas de jugarlo.',
      'Al final, «Si os gusta, probad también» propone juegos parecidos.',
    ],
  },
  {
    icon: 'timer',
    title: '3. Jugar la partida',
    items: [
      '«Empezar» abre la partida con lo que ese juego necesita. Puedes encender o apagar turnos, puntos, sorteo y tiempo.',
      'Elige quién juega entre tus jugadores de siempre o añade nombres nuevos.',
      'Para saber quién empieza: piedra, papel o tijera, pares o nones, pito pito… con sus normas, un dedo cada uno en la pantalla o que elija la app.',
      'La pantalla no se apaga mientras dura la partida. Cuando acabéis, pulsa «Terminar».',
    ],
  },
  {
    icon: 'seal',
    title: '4. Firmar en el cuaderno',
    items: [
      'Al terminar, o con «Ya jugado» en la ficha, se marca quién ha ganado y quién ha jugado, y sale una frase para celebrarlo.',
      'Cada jugador firma una vez por juego. En Sellos están los juegos jugados, las firmas de cada uno y las insignias.',
      'El cuaderno no caduca ni tiene rachas: solo se suma.',
    ],
  },
  {
    icon: 'sliders',
    title: '5. A tu manera',
    items: [
      'En Opciones: jugadores de siempre (nombre, color y forma), estilo del cuaderno (Papiro, Pizarra, Lápices o Contraste alto), tamaño de letra, animaciones mínimas y vibración.',
      'Todo funciona sin internet y con TalkBack.',
    ],
  },
];

/** Guía de uso por pasos: la usan «Cómo se usa» y «Acerca de». */
export function HowToUse() {
  const { c } = useTheme();
  const s = useStyles(makeStyles);
  return (
    <>
      {SECTIONS.map((sec) => (
        <View key={sec.title} style={s.card}>
          <View style={s.head}>
            <Icon name={sec.icon} size={26} color={c.ink} />
            <Text style={s.cardTitle} accessibilityRole="header">
              {sec.title}
            </Text>
          </View>
          {sec.items.map((item, i) => (
            <View key={i} style={s.bullet}>
              <View style={s.dot} />
              <Text style={s.text}>{item}</Text>
            </View>
          ))}
        </View>
      ))}
    </>
  );
}

const makeStyles = ({ c, t }: Theme) =>
  StyleSheet.create({
    card: { gap: space.s, padding: space.l, borderRadius: radius.card, backgroundColor: c.surface, borderWidth: c.border, borderColor: c.line },
    head: { flexDirection: 'row', alignItems: 'center', gap: space.m, marginBottom: space.xs },
    cardTitle: { ...t.title, color: c.ink, flexShrink: 1 },
    bullet: { flexDirection: 'row', gap: space.m, alignItems: 'flex-start' },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.inkSoft, marginTop: 10 },
    text: { ...t.body, color: c.ink, flex: 1 },
  });
