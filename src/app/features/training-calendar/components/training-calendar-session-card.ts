/**
 * Tarjeta de programación: estado, cupos y CTA de inscripción.
 */
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { ButtonComponent } from '@shared/components/buttons/button/button.component';
import {
  BadgeComponent,
  type BadgeColor,
  type BadgeVariant,
} from '@shared/components/ui-elements/badge/badge.component';

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
  imports: [BadgeComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      class="flex h-full flex-col rounded-2xl border border-border bg-elevated p-5 shadow-sm"
      [class.border-dsc]="badge() === 'available'"
      [class.border-dsc/40]="badge() === 'enrolled'"
    >
      <div class="flex flex-wrap items-start justify-between gap-2">
        <p class="m-0 text-xs font-semibold tracking-wide text-dsc-dark">
          {{ session().moduleTypeName }}
        </p>
        <app-badge size="sm" [variant]="badgeStyle().variant" [color]="badgeStyle().color">
          {{ sessionBadgeLabel(badge()) }}
        </app-badge>
      </div>
      <h3 class="mt-2 m-0 text-lg font-bold text-ink">{{ session().moduleName }}</h3>
      <p class="mt-2 mb-0 text-sm text-muted">{{ formatSessionWhen(session().startsAt) }}</p>
      @if (session().location) {
        <p class="mt-1 mb-0 text-sm text-muted">{{ session().location }}</p>
      }
      <p class="mt-2 mb-0 text-sm font-medium text-ink">{{ sessionSeatsLabel(session()) }}</p>
      <div class="mt-4 flex flex-1 items-end">
        @if (canEnroll(session())) {
          <app-button (clicked)="enroll.emit(session())">Inscribirme</app-button>
        } @else if (badge() === 'enrolled') {
          <p class="m-0 text-sm font-semibold text-dsc-dark">Ya estás inscrito</p>
        }
      </div>
    </article>
  `,
})
export class TrainingCalendarSessionCard {
  /** Programación a mostrar. */
  readonly session = input.required<CalendarSessionApiDto>();

  /** El usuario quiere inscribirse. */
  readonly enroll = output<CalendarSessionApiDto>();

  protected readonly badge = computed(() => sessionBadge(this.session()));

  protected readonly formatSessionWhen = formatSessionWhen;
  protected readonly sessionBadgeLabel = sessionBadgeLabel;
  protected readonly sessionSeatsLabel = sessionSeatsLabel;
  protected readonly canEnroll = canEnroll;

  protected readonly badgeStyle = computed(() => this.badgeStyleFor(this.badge()));

  /**
   * Variante y color del `app-badge` compartido según estado.
   *
   * @param badge - Estado visual.
   */
  private badgeStyleFor(badge: CalendarSessionBadge): { variant: BadgeVariant; color: BadgeColor } {
    switch (badge) {
      case 'available':
        return { variant: 'soft', color: 'primary' };
      case 'enrolled':
        return { variant: 'solid', color: 'primary' };
      case 'full':
        return { variant: 'soft', color: 'warning' };
      case 'finished':
        return { variant: 'soft', color: 'default' };
      case 'cancelled':
        return { variant: 'soft', color: 'danger' };
    }
  }
}
