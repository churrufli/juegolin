/** Fechas en lenguaje de casa: «hoy», «ayer», «hace 3 días», «el mes pasado»… */

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export function friendlyDate(iso: string, now = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const days = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000);
  if (days <= 0) return 'hoy';
  if (days === 1) return 'ayer';
  if (days === 2) return 'anteayer';
  if (days < 7) return `hace ${days} días`;
  if (days < 14) return 'la semana pasada';
  const months = (now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth();
  if (months === 0) return `hace ${Math.floor(days / 7)} semanas`;
  if (months === 1) return 'el mes pasado';
  if (months < 12) return `hace ${months} meses`;
  const years = now.getFullYear() - d.getFullYear();
  if (years <= 1) return 'el año pasado';
  return `hace ${years} años`;
}

/** «18:30». */
export const timeOf = (iso: string): string => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** «viernes 23 de octubre», para leer en voz alta o al tocar una firma. */
export const longDate = (iso: string): string => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : `${DAYS[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
};
