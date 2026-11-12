/** Un juego del catálogo (src/data/games.json, esquema juego.schema.json). */
export type Edad = '3-5' | '6-8' | '9-12' | 'familia';
export type Entorno = 'exterior' | 'interior';
export type Espacio = 'reducido' | 'amplio';
export type Intensidad = 'alta' | 'moderada' | 'calma';
export type Destreza = 'fuerza' | 'punteria' | 'equilibrio';
export type Material =
  | 'ninguno'
  | 'tiza'
  | 'cuerda'
  | 'chapas'
  | 'pelota'
  | 'panuelo'
  | 'sacos'
  | 'latas'
  | 'piedra'
  | 'saquitos'
  | 'linterna'
  | 'mapa'
  | 'brujula'
  | 'silbato'
  | 'cintas'
  | 'banderas'
  | 'palos'
  | 'tarjetas'
  | 'cuaderno'
  | 'reflectantes'
  | 'papel'
  | 'aro'
  | 'bolos'
  | 'canicas'
  | 'globos'
  | 'sillas'
  | 'musica'
  | 'goma'
  | 'peonza'
  | 'monedas'
  | 'objetos';
export type Grupo = 'individual-parejas' | 'pequeno' | 'grande';
export type Organizacion = 'todos-contra-todos' | 'equipos' | 'todos-contra-uno' | 'cooperativo';
export type Duracion = 'expres' | 'media' | 'larga';
export type Ruido = 'silencioso' | 'medio' | 'ruidoso';
export type Dificultad = 'muy-facil' | 'intermedia' | 'estrategica';
export type Habilidad = 'cooperacion' | 'reflejos' | 'estrategia' | 'expresion' | 'coordinacion' | 'atencion';
export type Coleccion = 'destacados' | 'juegos-del-mundo' | 'clasicos-del-patio' | 'cumpleanos-fiestas' | 'viaje-coche' | 'rompehielos' | 'campamento' | 'nocturnos';
export type Herramienta = 'turnos' | 'marcador' | 'sorteo' | 'temporizador';
export type OrigenTipo = 'popular-espanol' | 'otro-pais' | 'moderno';
export type Seccion = 'presentacion' | 'tradicionales' | 'acecho' | 'grandes-juegos' | 'nocturnos' | 'agilidad' | 'viaje' | 'tranquilos';

export interface Juego {
  readonly id: string;
  readonly nombre: string;
  readonly alias: readonly string[];
  readonly seccion: Seccion;
  readonly resumen: string;
  readonly edades: readonly Edad[];
  readonly entorno: readonly Entorno[];
  readonly espacio: readonly Espacio[];
  readonly terreno: string;
  readonly intensidad: Intensidad;
  readonly destrezas: readonly Destreza[];
  readonly materiales: readonly Material[];
  readonly materialesDetalle: string;
  readonly participantes: { readonly min: number; readonly max: number | null; readonly nota?: string };
  readonly grupo: readonly Grupo[];
  readonly organizacion: readonly Organizacion[];
  readonly duracion: Duracion;
  readonly ruido: Ruido;
  readonly dificultad: Dificultad;
  readonly habilidades: readonly Habilidad[];
  readonly colecciones: readonly Coleccion[];
  readonly pasos: { readonly preparacion: readonly string[]; readonly comoSeJuega: readonly string[]; readonly comoSeGana: readonly string[] };
  readonly variantes: readonly string[];
  readonly herramientas: readonly Herramienta[];
  readonly requiereAdulto: boolean;
  readonly seguridad: string | null;
  /** De dónde viene: juego popular de España, de otro país o dinámica moderna. */
  readonly origen: { readonly tipo: OrigenTipo; readonly lugar: string | null };
  /** Solo se puede jugar yendo en coche, tren o autobús (matrículas, señales…): lleva el icono del coche. */
  readonly soloEnCoche: boolean;
}
