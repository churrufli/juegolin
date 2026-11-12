/** Formas populares de decidir quién empieza, con sus normas para recordarlas antes de jugar. */
import type { IconName } from '../ui/icons';

export interface Sorteo {
  readonly id: string;
  readonly nombre: string;
  readonly icono: IconName;
  /** Cuántos pueden echarlo a la vez; con más, se va eliminando por parejas. */
  readonly para: string;
  readonly normas: readonly string[];
}

export const SORTEOS: readonly Sorteo[] = [
  {
    id: 'piedra-papel-tijera',
    nombre: 'Piedra, papel o tijera',
    icono: 'hand',
    para: '2 o más',
    normas: [
      'Todos a la vez dicen «piedra, papel o tijera… ¡ya!» y sacan la mano.',
      'Puño cerrado es piedra, mano abierta es papel y dos dedos son tijera.',
      'La piedra rompe la tijera, la tijera corta el papel y el papel envuelve la piedra.',
      'Si empatáis, se repite. Con más de dos, quien pierde se va retirando hasta que queda uno.',
    ],
  },
  {
    id: 'pares-nones',
    nombre: 'Pares o nones',
    icono: 'hand',
    para: 'Por parejas',
    normas: [
      'Uno elige «pares» y el otro «nones».',
      'A la de tres, cada uno saca los dedos que quiera de una mano (también puede sacar el puño, que vale cero).',
      'Se suman los dedos: si sale número par gana quien dijo pares, y si sale impar, quien dijo nones.',
    ],
  },
  {
    id: 'pito-pito',
    nombre: 'Pito, pito, gorgorito',
    icono: 'music',
    para: '3 o más',
    normas: [
      'Os ponéis en corro y uno va señalando a cada jugador, uno por sílaba, incluido él mismo.',
      'Mientras canta: «Pito, pito, gorgorito, ¿dónde vas tú tan bonito? A la acera verdadera, pim, pam, pum, ¡fuera!».',
      'Quien recibe el «¡fuera!» se sale y se vuelve a cantar con los demás. El último que queda es quien empieza.',
    ],
  },
  {
    id: 'a-pies',
    nombre: 'A pies (pie con pie)',
    icono: 'walk',
    para: 'Por parejas',
    normas: [
      'Os ponéis frente a frente, separados unos pasos.',
      'Por turnos, cada uno avanza poniendo un pie justo delante del otro, talón con punta.',
      'Quien al final pisa el pie del otro, o mete el pie de lado en el hueco que queda («monta y cabe»), gana.',
    ],
  },
  {
    id: 'cara-cruz',
    nombre: 'Cara o cruz',
    icono: 'coin',
    para: 'Por parejas',
    normas: [
      'Uno elige «cara» y el otro «cruz».',
      'Se lanza una moneda al aire y se deja caer en la mano o en el suelo.',
      'Gana quien acertó el lado que ha quedado arriba.',
    ],
  },
];
