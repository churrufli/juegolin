import data from '../../data/frases.json';
import { cheersFor } from '../frases';

describe('cheersFor', () => {
  it('sin ganadores no dice nada', () => {
    expect(cheersFor(0, 3)).toBeNull();
  });

  it('una frase para quien gana, otra para el resto y otra para todos', () => {
    expect(cheersFor(1, 3, () => 0)).toEqual({ winners: data.frasesGanadores[0], others: data.frasesNoGanadores[0], all: data.frasesTodos[0] });
  });

  it('si ganan todos no hay frase para el resto', () => {
    expect(cheersFor(2, 2, () => 0.5)?.others).toBeNull();
  });

  it('«los dos» solo con dos jugadores', () => {
    for (let i = 0; i < 50; i++) expect(cheersFor(1, 3, () => i / 50)?.all).not.toContain('los dos');
  });

  it('todas las frases son en positivo y sin nombres', () => {
    const all = [...data.frasesGanadores, ...data.frasesNoGanadores, ...data.frasesTodos];
    expect(all.every((f) => !/rabia|triste|enfad|perde/i.test(f))).toBe(true);
  });
});
