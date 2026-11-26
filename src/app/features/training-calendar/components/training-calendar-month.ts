/**
 * Grilla mensual de programaciones. Emite el día elegido.
 */
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import {
  CALENDAR_WEEKDAY_LABELS,
  buildMonthGrid,
  formatMonthTitle,
  isoDateTimeToLocalDate,
  toIsoDateLocal,
} from '../calendar-month.utils';
import type { CalendarSessionApiDto } from '../training-calendar.models';

@Component({
  selector: 'app-training-calendar-month',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './training-calendar-month.html',
})
export class TrainingCalendarMonth {
  /** Año visible. */
  readonly year = input.required<number>();

  /** Mes 0–11. */
  readonly monthIndex = input.required<number>();

  /** Programaciones a pintar en la grilla. */
  readonly sessions = input<readonly CalendarSessionApiDto[]>([]);

  /** Día ISO seleccionado (`YYYY-MM-DD`) o `null`. */
  readonly selectedIsoDate = input<string | null>(null);

  /** Navega un mes (`-1` / `1`). */
  readonly monthChange = output<number>();

  /** Vuelve al mes del reloj local. */
  readonly today = output<void>();

  /** El usuario eligió un día. */
  readonly daySelected = output<string>();

  protected readonly weekdayLabels = CALENDAR_WEEKDAY_LABELS;

  protected readonly title = computed(() => formatMonthTitle(this.year(), this.monthIndex()));

  protected readonly grid = computed(() => buildMonthGrid(this.year(), this.monthIndex()));

  protected readonly todayIso = toIsoDateLocal(new Date());

  protected readonly sessionsByDay = computed(() => {
    const grouped = new Map<string, CalendarSessionApiDto[]>();
    for (const session of this.sessions()) {
      const day = isoDateTimeToLocalDate(session.startsAt);
      const bucket = grouped.get(day);
      if (bucket) {
        bucket.push(session);
      } else {
        grouped.set(day, [session]);
      }
    }
    return grouped;
  });

  /**
   * Sesiones de un día de la grilla.
   *
   * @param isoDate - `YYYY-MM-DD` local.
   */
  protected sessionsOn(isoDate: string): readonly CalendarSessionApiDto[] {
    return this.sessionsByDay().get(isoDate) ?? [];
  }
}
