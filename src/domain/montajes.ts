import data from '../data/montajes.json';

/** «Cómo se dibuja / Cómo se monta»: para los juegos que necesitan marcar el suelo o colocar algo antes. */
export interface Montaje {
  readonly titulo: string;
  readonly pasos: readonly string[];
}

const MONTAJES: Readonly<Record<string, Montaje>> = data;

export const montajeOf = (id: string): Montaje | undefined => MONTAJES[id];
export const MONTAJE_IDS: readonly string[] = Object.keys(MONTAJES);
