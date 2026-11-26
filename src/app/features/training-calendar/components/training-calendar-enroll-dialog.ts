/**
 * Confirmación de inscripción a una programación. Modal nativo `showModal`.
 */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';

import { ButtonComponent } from '@shared/components/buttons/button/button.component';
import { SummaryList, type SummaryItem } from '@shared/components/summary-list';

import { formatSessionWhen } from '../calendar-month.utils';
import { sessionSeatsLabel } from '../calendar-session.utils';
import type { CalendarSessionApiDto } from '../training-calendar.models';

@Component({
  selector: 'app-training-calendar-enroll-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, SummaryList],
  templateUrl: './training-calendar-enroll-dialog.html',
  styles: `
    :host {
      display: contents;
    }
  `,
})
export class TrainingCalendarEnrollDialog {
  private readonly destroyRef = inject(DestroyRef);

  /** Controla visibilidad del `<dialog>`. */
  readonly open = input(false);

  /** Sesión a confirmar. */
  readonly session = input<CalendarSessionApiDto | null>(null);

  /** Hay JWT; si no, el CTA pide login. */
  readonly authenticated = input(false);

  /** Error RFC 7807 (p. ej. 409 de cupo). */
  readonly enrollError = input('');

  /** True mientras POST está en curso. */
  readonly submitting = input(false);

  /** Cierre (cancelar, backdrop o Escape). */
  readonly closed = output<void>();

  /** El dirigente confirmó la inscripción. */
  readonly confirmed = output<void>();

  /** El visitante debe autenticarse. */
  readonly loginRequested = output<void>();

  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');

  protected readonly summaryItems = computed<readonly SummaryItem[]>(() => {
    const session = this.session();
    if (!session) {
      return [];
    }

    const items: SummaryItem[] = [
      { label: 'Módulo', value: session.moduleName },
      { label: 'Cuando', value: formatSessionWhen(session.startsAt) },
      { label: 'Cupos', value: sessionSeatsLabel(session) },
    ];

    if (session.location) {
      items.splice(2, 0, { label: 'Lugar', value: session.location });
    }

    return items;
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      document.body.style.removeProperty('overflow');
    });

    effect(() => {
      const el = this.dialog()?.nativeElement;
      if (!el) {
        return;
      }
      if (this.open()) {
        document.body.style.overflow = 'hidden';
        if (!el.open && typeof el.showModal === 'function') {
          el.showModal();
        }
      } else {
        document.body.style.removeProperty('overflow');
        if (el.open && typeof el.close === 'function') {
          el.close();
        }
      }
    });
  }

  /** El usuario cerró el diálogo nativo. */
  protected onNativeClose(): void {
    if (this.open()) {
      this.closed.emit();
    }
  }
}
