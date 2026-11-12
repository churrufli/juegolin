import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Session } from '../domain/badges';
import { friendlyDate, longDate, timeOf } from '../domain/dates';
import type { Player } from '../domain/players';
import type { Juego } from '../domain/types';
import { useJournal, type Play } from '../store/journalStore';
import { useTheme } from '../store/settingsStore';
import { useStyles } from '../ui/components';
import { tap } from '../ui/feedback';
import { Icon } from '../ui/icons';
import { brand, radius, space, type Theme } from '../ui/theme';

const LINE = 30;
const SHOWN = 3;

/** Cuaderno de firmas de un juego: una página por partida, con un sello por jugador y quién ganó. */
export function SignatureBook({ game, play }: { game: Juego; play: Play }) {
  const s = useStyles(makeStyles);
  const people = useJournal((st) => st.players);
  const [all, setAll] = useState(false);
  // Los sellos de antes de las páginas solo guardaban quién había firmado: se enseñan como una página.
  const sessions: readonly Session[] = play.sessions?.length ? play.sessions : play.signers?.length ? [{ at: play.last, players: play.signers, winners: [] }] : [];
  const pages = [...sessions].reverse();
  const visible = all ? pages : pages.slice(0, SHOWN);
  const byId = (id: string) => people.find((p) => p.id === id);
  return (
    <View style={s.book}>
      <NotebookLines />
      <View style={s.content}>
        <Text style={s.title} accessibilityRole="header">
          Cuaderno de firmas
        </Text>
        <Text style={s.sub}>{play.count === 1 ? 'Una partida' : `${play.count} partidas`}</Text>
        {visible.length === 0 ? <Text style={s.empty}>Sellado sin firmas. La próxima vez, elegid quién ha jugado.</Text> : null}
        {visible.map((page) => (
          <View key={page.at} style={s.page} accessible accessibilityLabel={pageLabel(page, byId)}>
            <Text style={s.when}>{`${capitalize(friendlyDate(page.at))} · ${timeOf(page.at)}`}</Text>
            {page.players.length === 0 ? <Text style={s.empty}>Sin firmas</Text> : null}
            <View style={s.stamps}>
              {page.players.map((id, i) => {
                const p = byId(id);
                return p ? <SignatureStamp key={id} player={p} at={page.at} won={page.winners.includes(id)} tilt={((i * 37 + game.id.length) % 9) - 4} /> : null;
              })}
            </View>
          </View>
        ))}
        {pages.length > SHOWN ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              tap();
              setAll(!all);
            }}
            style={s.more}
          >
            <Text style={s.moreText}>{all ? 'Ver menos' : `Ver las ${pages.length} páginas`}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const capitalize = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

function pageLabel(page: Session, byId: (id: string) => Player | undefined): string {
  const names = page.players.map((id) => byId(id)?.name).filter(Boolean);
  const won = page.winners.map((id) => byId(id)?.name).filter(Boolean);
  return `${capitalize(friendlyDate(page.at))}, ${longDate(page.at)}, a las ${timeOf(page.at)}. ${names.length ? `Firman ${names.join(', ')}.` : 'Sin firmas.'}${won.length ? ` Ganó ${won.join(' y ')}.` : ''}`;
}

/** Sello de goma con el nombre del jugador en el centro y la fecha abajo. */
function SignatureStamp({ player, at, won, tilt }: { player: Player; at: string; won: boolean; tilt: number }) {
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  return (
    <View style={[s.stamp, { borderColor: c.dark ? player.color : c.ink, transform: [{ rotate: `${tilt}deg` }] }]}>
      <View style={[s.stampInner, { borderColor: player.color }]}>
        <Text style={s.stampName} numberOfLines={1} adjustsFontSizeToFit>
          {player.name}
        </Text>
        <Text style={s.stampDate} numberOfLines={1}>
          {friendlyDate(at)}
        </Text>
      </View>
      {won ? (
        <View style={s.won}>
          <Icon name="star" size={14} color="#2B2724" />
          <Text style={s.wonText}>ganó</Text>
        </View>
      ) : null}
    </View>
  );
}

/** Hoja de cuaderno escolar: renglones y margen rojo. */
function NotebookLines() {
  const s = useStyles(makeStyles);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: 60 }, (_, i) => (
        <View key={i} style={[s.rule, { top: 56 + i * LINE }]} />
      ))}
      <View style={s.margin} />
    </View>
  );
}

const makeStyles = ({ c, t }: Theme) =>
  StyleSheet.create({
    book: { borderRadius: radius.card, backgroundColor: c.dark ? c.surface : '#FFFEF8', borderWidth: c.border, borderColor: c.line, overflow: 'hidden' },
    rule: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: c.dark ? c.line : '#C9DCEB', opacity: c.dark ? 0.5 : 0.9 },
    margin: { position: 'absolute', top: 0, bottom: 0, left: 34, width: 1.5, backgroundColor: brand.coral, opacity: 0.55 },
    content: { paddingLeft: 48, paddingRight: space.l, paddingTop: space.m, paddingBottom: space.l, gap: space.s },
    title: { ...t.hand, fontSize: 28, lineHeight: 36, color: c.ink },
    sub: { ...t.caption, color: c.inkSoft, marginTop: -6 },
    page: { gap: space.xs, paddingTop: space.s },
    when: { ...t.hand, color: c.inkSoft },
    stamps: { flexDirection: 'row', flexWrap: 'wrap', gap: space.m, paddingVertical: space.xs },
    stamp: { width: 92, height: 92, borderRadius: 46, borderWidth: 2, padding: 4, alignItems: 'center', justifyContent: 'center' },
    stampInner: { flex: 1, alignSelf: 'stretch', borderRadius: 42, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
    stampName: { ...t.hand, fontSize: 21, lineHeight: 26, color: c.ink, textAlign: 'center' },
    stampDate: { ...t.caption, fontSize: 11, lineHeight: 14, color: c.inkSoft, textAlign: 'center' },
    won: { position: 'absolute', top: -6, right: -10, flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.pill, backgroundColor: brand.yellow, borderWidth: 1.5, borderColor: '#2B2724' },
    wonText: { ...t.label, fontSize: 12, lineHeight: 16, color: '#2B2724' },
    empty: { ...t.caption, color: c.inkSoft },
    more: { minHeight: 44, justifyContent: 'center' },
    moreText: { ...t.bodyStrong, color: c.ink, textDecorationLine: 'underline' },
  });
