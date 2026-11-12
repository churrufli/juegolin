import { useMemo } from 'react';
import { create } from 'zustand';
import { AccessibilityInfo, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { questionsFor, suggest, type Answers } from '../domain/assistant';
import { DURATION_SHORT, GAMES, agesLabel, playersLabel } from '../domain/catalog';
import type { Juego } from '../domain/types';
import { playedSet, useJournal } from '../store/journalStore';
import { useTheme } from '../store/settingsStore';
import { Button, GameArt, IconButton, ProgressBar, Screen, useStyles } from '../ui/components';
import { tap } from '../ui/feedback';
import { Icon } from '../ui/icons';
import { gutter, radius, space, type Theme } from '../ui/theme';
import { openGame, popOverlay } from '../ui/uiStore';

const PAGE = 5;

// Fuera del componente: al abrir un juego y volver, el asistente sigue donde estaba.
interface AssistantState {
  readonly answers: Answers;
  readonly step: number;
  readonly page: number;
}
const START: AssistantState = { answers: {}, step: 0, page: 0 };
const useAssistant = create<AssistantState>()(() => START);
export const resetAssistant = (): void => useAssistant.setState(START);


/** Asistente para jugar: pregunta a pregunta y al final propone juegos. */
export function AssistantScreen() {
  const theme = useTheme();
  const s = useStyles(makeStyles);
  const plays = useJournal((st) => st.plays);
  const { answers, step, page } = useAssistant();
  const setStep = (n: number) => useAssistant.setState({ step: n });
  const setPage = (n: number) => useAssistant.setState({ page: n });
  const questions = questionsFor(answers);
  const done = step >= questions.length;
  const question = questions[step];
  const results = useMemo(() => (done ? suggest(GAMES, answers, playedSet(plays)) : []), [done, answers, plays]);
  const shown = results.slice(page * PAGE, page * PAGE + PAGE);

  const answer = (value: Answers[keyof Answers] | undefined) => {
    tap();
    if (!question) return;
    const next = { ...answers, [question.key]: value };
    useAssistant.setState({ answers: next, step: step + 1, page: 0 });
    if (step + 1 >= questionsFor(next).length) AccessibilityInfo.announceForAccessibility('Estas son nuestras ideas');
  };
  const back = () => (step > 0 ? setStep(step - 1) : popOverlay());
  const restart = resetAssistant;

  return (
    <Screen>
      <View style={s.topBar}>
        <IconButton icon="back" label={step > 0 ? 'Pregunta anterior' : 'Volver'} onPress={back} />
        {!done ? <Button label="Ver ideas ya" variant="ghost" onPress={() => setStep(questions.length)} /> : null}
      </View>
      <ScrollView contentContainerStyle={s.body}>
        <Text style={s.overline}>Asistente para jugar</Text>
        {question ? (
          <>
            <ProgressBar value={step / questions.length} hue="turquoise" />
            <Text style={s.title} accessibilityRole="header">
              {question.title}
            </Text>
            <View style={s.choices} accessibilityRole="radiogroup">
              {question.choices.map((ch) => {
                const on = answers[question.key] === ch.value;
                return (
                  <Pressable
                    key={String(ch.value)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: on }}
                    accessibilityLabel={ch.hint ? `${ch.label}. ${ch.hint}` : ch.label}
                    onPress={() => answer(ch.value)}
                    style={({ pressed }) => [s.choice, on && { borderColor: theme.c.ink, borderWidth: 2.5 }, { opacity: pressed ? 0.8 : 1 }]}
                  >
                    <Text style={s.choiceLabel}>{ch.label}</Text>
                    {ch.hint ? <Text style={s.choiceHint}>{ch.hint}</Text> : null}
                  </Pressable>
                );
              })}
            </View>
            <Button label="Me da igual" variant="secondary" onPress={() => answer(undefined)} />
          </>
        ) : (
          <>
            <Text style={s.title} accessibilityRole="header">
              {results.length > 0 ? 'Os proponemos…' : 'No hay ningún juego que encaje'}
            </Text>
            {results.length === 0 ? <Text style={s.lead}>Prueba con otras respuestas: «Me da igual» abre mucho el abanico.</Text> : null}
            {shown.map((g, i) => (
              <Idea key={g.id} game={g} best={page === 0 && i === 0} />
            ))}
            <View style={s.actions}>
              {results.length > (page + 1) * PAGE ? <Button label="Otras ideas" icon="shuffle" variant="secondary" onPress={() => setPage(page + 1)} /> : null}
              {page > 0 && results.length <= (page + 1) * PAGE ? <Button label="Volver a las primeras" variant="secondary" onPress={() => setPage(0)} /> : null}
              <Button label="Empezar de nuevo" icon="reset" variant="ghost" onPress={restart} />
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function Idea({ game, best }: { game: Juego; best: boolean }) {
  const { c } = useTheme();
  const s = useStyles(makeStyles);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${best ? 'La mejor idea: ' : ''}${game.nombre}. ${game.resumen}`}
      onPress={() => {
        tap();
        openGame(game.id);
      }}
      style={({ pressed }) => [s.idea, { opacity: pressed ? 0.8 : 1 }]}
    >
      <View style={{ width: 96 }}>
        <GameArt game={game} height={80} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        {best ? <Text style={s.best}>La que mejor encaja</Text> : null}
        <Text style={s.ideaName}>{game.nombre}</Text>
        <Text style={s.ideaText} numberOfLines={2}>
          {game.resumen}
        </Text>
        <Text style={s.ideaMeta}>{`${agesLabel(game)} · ${playersLabel(game)} · ${DURATION_SHORT[game.duracion]}`}</Text>
      </View>
      <Icon name="chevron" size={20} color={c.ink} />
    </Pressable>
  );
}

const makeStyles = ({ c, t }: Theme) =>
  StyleSheet.create({
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: gutter - 4, paddingTop: space.s },
    body: { paddingHorizontal: gutter, paddingBottom: 60, gap: space.m },
    overline: { ...t.overline, color: c.inkSoft },
    title: { ...t.display, color: c.ink },
    lead: { ...t.body, color: c.inkSoft },
    choices: { gap: space.s },
    choice: { minHeight: 64, justifyContent: 'center', paddingHorizontal: space.l, paddingVertical: space.m, borderRadius: radius.card, backgroundColor: c.surface, borderWidth: c.border, borderColor: c.line, gap: 2 },
    choiceLabel: { ...t.title, color: c.ink },
    choiceHint: { ...t.caption, color: c.inkSoft },
    idea: { flexDirection: 'row', alignItems: 'center', gap: space.m, padding: space.m, borderRadius: radius.card, backgroundColor: c.surface, borderWidth: c.border, borderColor: c.line },
    best: { ...t.hand, color: c.hueText.coral },
    ideaName: { ...t.bodyStrong, color: c.ink },
    ideaText: { ...t.caption, color: c.inkSoft },
    ideaMeta: { ...t.caption, color: c.inkSoft },
    actions: { gap: space.s },
  });
