/**
 * Tarjeta de convocatoria: estado, cupos y CTA de inscripción.
 */
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import {
  canEnroll,
  sessionBadge,
  sessionBadgeLabel,
  sessionSeatsLabel,
} from '../calendar-session.utils';
import { formatSessionWhen } from '../calendar-month.utils';
import type { CalendarSessionApiDto, CalendarSessionBadge } from '../training-calendar.models';

@Component({
  selector: 'app-training-calendar-session-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      class="flex h-full flex-col rounded-2xl border border-border bg-elevated p-5 shadow-sm"
      [class.border-dsc]="badge() === 'available'"
      [class.border-dsc/40]="badge() === 'enrolled'"
    >
      <div class="flex flex-wrap items-start justify-between gap-2">
        <p class="m-0 text-xs font-semibold tracking-wide text-dsc">
          {{ session().moduleTypeName }}
        </p>
        <span
          class="rounded-full px-2.5 py-0.5 text-xs font-semibold"
          [class]="badgeClass()"
        >
          {{ sessionBadgeLabel(badge()) }}
        </span>
      </div>
      <h3 class="mt-2 m-0 text-lg font-bold text-ink">{{ session().moduleName }}</h3>
      <p class="mt-2 mb-0 text-sm text-muted">{{ formatSessionWhen(session().startsAt) }}</p>
      @if (session().location) {
        <p class="mt-1 mb-0 text-sm text-muted">{{ session().location }}</p>
      }
      <p class="mt-2 mb-0 text-sm font-medium text-ink">{{ sessionSeatsLabel(session()) }}</p>
      <div class="mt-4 flex flex-1 items-end">
        @if (canEnroll(session())) {
          <button
            type="button"
            class="rounded-lg bg-dsc px-4 py-2 text-sm font-semibold text-white transition hover:bg-dsc-dark"
            (click)="enroll.emit(session())"
          >
            Inscribirme
          </button>
        } @else if (badge() === 'enrolled') {
          <p class="m-0 text-sm font-semibold text-dsc">Ya estás inscrito</p>
        }
      </div>
    </article>
  `,
})
export class TrainingCalendarSessionCard {
  /** Convocatoria a mostrar. */
  readonly session = input.required<CalendarSessionApiDto>();

  /** El usuario quiere inscribirse. */
  readonly enroll = output<CalendarSessionApiDto>();

  protected readonly badge = computed(() => sessionBadge(this.session()));

  protected readonly formatSessionWhen = formatSessionWhen;
  protected readonly sessionBadgeLabel = sessionBadgeLabel;
  protected readonly sessionSeatsLabel = sessionSeatsLabel;
  protected readonly canEnroll = canEnroll;

  protected readonly badgeClass = computed(() => this.classesFor(this.badge()));

  /**
   * Clases Tailwind de la insignia según estado.
   *
   * @param badge - Estado visual.
   */
  private classesFor(badge: CalendarSessionBadge): string {
    switch (badge) {
      case 'available':
        return 'bg-dsc-soft text-dsc-dark';
      case 'enrolled':
        return 'bg-dsc text-white';
      case 'full':
        return 'bg-warning-bg text-warning-ink';
      case 'finished':
        return 'bg-surface text-muted';
      case 'cancelled':
        return 'bg-danger-soft text-danger';
    }
  }
}
