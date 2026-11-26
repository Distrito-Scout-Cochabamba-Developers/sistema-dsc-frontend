/**
 * Utilidades de calendario gregoriano en zona local (semana inicia el lunes).
 */

/** Día de la grilla mensual. */
export interface CalendarDay {
  readonly date: Date;
  readonly inMonth: boolean;
  readonly isoDate: string;
}

const WEEKDAY_MONDAY_OFFSET = 6;

/** Etiquetas cortas lun–dom para la cabecera de la grilla. */
export const CALENDAR_WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const;

/**
 * Serializa una fecha local como `YYYY-MM-DD`.
 *
 * @param date - Instante; se usa el calendario local, no UTC.
 */
export function toIsoDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Extrae el día local de un instante ISO.
 *
 * @param isoDateTime - Fecha/hora ISO-8601.
 */
export function isoDateTimeToLocalDate(isoDateTime: string): string {
  return toIsoDateLocal(new Date(isoDateTime));
}

/**
 * Inicio del día local (00:00:00.000).
 *
 * @param date - Referencia.
 */
export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Desplaza un mes y normaliza el día al 1.
 *
 * @param year - Año.
 * @param monthIndex - Mes 0–11.
 * @param delta - Cantidad de meses a sumar.
 */
export function shiftMonth(
  year: number,
  monthIndex: number,
  delta: number,
): { readonly year: number; readonly monthIndex: number } {
  const cursor = new Date(year, monthIndex + delta, 1);
  return { year: cursor.getFullYear(), monthIndex: cursor.getMonth() };
}

/**
 * Título de mes en español boliviano (`noviembre de 2026`).
 *
 * @param year - Año.
 * @param monthIndex - Mes 0–11.
 */
export function formatMonthTitle(year: number, monthIndex: number): string {
  const date = new Date(year, monthIndex, 1);
  const raw = new Intl.DateTimeFormat('es-BO', { month: 'long', year: 'numeric' }).format(date);
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

/**
 * Formatea fecha y hora de una programación para tarjetas y el modal.
 *
 * @param isoDateTime - Instante ISO-8601.
 */
export function formatSessionWhen(isoDateTime: string): string {
  return new Intl.DateTimeFormat('es-BO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDateTime));
}

/**
 * Grilla de 6 semanas (42 celdas) de lunes a domingo para un mes.
 *
 * @param year - Año.
 * @param monthIndex - Mes 0–11.
 */
export function buildMonthGrid(year: number, monthIndex: number): readonly CalendarDay[] {
  const first = new Date(year, monthIndex, 1);
  const mondayOffset = (first.getDay() + WEEKDAY_MONDAY_OFFSET) % 7;
  const gridStart = new Date(year, monthIndex, 1 - mondayOffset);
  const days: CalendarDay[] = [];

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + index,
    );
    days.push({
      date,
      inMonth: date.getMonth() === monthIndex,
      isoDate: toIsoDateLocal(date),
    });
  }

  return days;
}
