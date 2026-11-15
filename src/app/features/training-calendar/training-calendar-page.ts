/**
 * Calendario público de convocatorias: vista mensual, lista de próximos
 * e inscripción digital del dirigente autenticado.
 */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthSessionService } from '@core/services/auth-session.service';
import { isRetryableHttpError, problemDetailMessage } from '@core/utils/http-error.utils';
import { StateCard } from '@shared/components/state-card';

import { isoDateTimeToLocalDate, shiftMonth, startOfLocalDay } from './calendar-month.utils';
import { canEnroll } from './calendar-session.utils';
import { TrainingCalendarEnrollDialog } from './components/training-calendar-enroll-dialog';
import { TrainingCalendarMonth } from './components/training-calendar-month';
import { TrainingCalendarSessionCard } from './components/training-calendar-session-card';
import { TrainingCalendarService } from './services/training-calendar';
import type {
  CalendarSessionApiDto,
  CalendarViewMode,
} from './training-calendar.models';

@Component({
  selector: 'app-training-calendar-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    StateCard,
    TrainingCalendarEnrollDialog,
    TrainingCalendarMonth,
    TrainingCalendarSessionCard,
  ],
  templateUrl: './training-calendar-page.html',
})
export class TrainingCalendarPage {
  private readonly calendar = inject(TrainingCalendarService);
  private readonly auth = inject(AuthSessionService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly now = new Date();

  protected readonly sessions = signal<readonly CalendarSessionApiDto[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly retryable = signal(false);
  protected readonly viewMode = signal<CalendarViewMode>('month');
  protected readonly year = signal(this.now.getFullYear());
  protected readonly monthIndex = signal(this.now.getMonth());
  protected readonly selectedIsoDate = signal<string | null>(null);
  protected readonly pending = signal<CalendarSessionApiDto | null>(null);
  protected readonly enrollError = signal('');
  protected readonly submitting = signal(false);

  protected readonly usingFixtures = this.calendar.isUsingFixtures();
  protected readonly isAuthenticated = this.auth.isAuthenticated;

  protected readonly upcoming = computed(() => {
    const start = startOfLocalDay(new Date()).getTime();
    const selected = this.selectedIsoDate();
    return this.sessions()
      .filter((session) => {
        if (new Date(session.startsAt).getTime() < start) {
          return false;
        }
        if (session.status === 'CANCELLED') {
          return false;
        }
        if (selected && isoDateTimeToLocalDate(session.startsAt) !== selected) {
          return false;
        }
        return true;
      })
      .slice()
      .sort((left, right) => left.startsAt.localeCompare(right.startsAt));
  });

  constructor() {
    this.load();
  }

  /** Recarga tras un error transitorio. */
  protected retry(): void {
    this.load();
  }

  /**
   * Alterna mes / lista.
   *
   * @param mode - Presentación.
   */
  protected setView(mode: CalendarViewMode): void {
    this.viewMode.set(mode);
  }

  /**
   * Avanza o retrocede el mes visible.
   *
   * @param delta - `-1` o `1`.
   */
  protected onMonthChange(delta: number): void {
    const next = shiftMonth(this.year(), this.monthIndex(), delta);
    this.year.set(next.year);
    this.monthIndex.set(next.monthIndex);
  }

  /** Vuelve al mes actual y limpia el filtro de día. */
  protected goToday(): void {
    const today = new Date();
    this.year.set(today.getFullYear());
    this.monthIndex.set(today.getMonth());
    this.selectedIsoDate.set(null);
  }

  /**
   * Filtra la lista al día pulsado; un segundo click lo quita.
   *
   * @param isoDate - `YYYY-MM-DD`.
   */
  protected onDaySelected(isoDate: string): void {
    this.selectedIsoDate.update((current) => (current === isoDate ? null : isoDate));
  }

  /** Quita el filtro de un día concreto. */
  protected clearDayFilter(): void {
    this.selectedIsoDate.set(null);
  }

  /**
   * Abre el modal si la sesión admite inscripción.
   *
   * @param session - Convocatoria elegida.
   */
  protected openEnroll(session: CalendarSessionApiDto): void {
    if (!canEnroll(session)) {
      return;
    }
    this.enrollError.set('');
    this.pending.set(session);
  }

  /** Cierra el modal de confirmación. */
  protected closeEnroll(): void {
    this.pending.set(null);
    this.enrollError.set('');
    this.submitting.set(false);
  }

  /** Lleva al login conservando `/calendario` como retorno. */
  protected goLogin(): void {
    void this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: '/calendario' },
    });
  }

  /**
   * Confirma la inscripción y parchea la tarjeta con Signals.
   * Un 409 marca la sesión como cupo lleno.
   */
  protected confirmEnroll(): void {
    const session = this.pending();
    if (!session) {
      return;
    }

    this.submitting.set(true);
    this.enrollError.set('');
    this.calendar
      .enroll(session.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.replaceSession(result.session);
          this.submitting.set(false);
          this.pending.set(null);
        },
        error: (err: unknown) => {
          this.submitting.set(false);
          if (err instanceof HttpErrorResponse && err.status === 409) {
            this.markFull(session.id);
            this.enrollError.set(
              problemDetailMessage(err, 'El cupo de esta sesión se agotó. Elige otra fecha.'),
            );
            return;
          }
          this.enrollError.set(
            problemDetailMessage(err, 'No se pudo completar la inscripción. Intenta de nuevo.'),
          );
        },
      });
  }

  /**
   * Pide el listado de convocatorias (API o fixtures).
   */
  private load(): void {
    this.loading.set(true);
    this.error.set('');
    this.retryable.set(false);
    this.calendar
      .listSessions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          this.sessions.set(items);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          this.error.set(
            problemDetailMessage(
              err,
              'No se pudo cargar el calendario. Intenta de nuevo.',
            ),
          );
          this.retryable.set(isRetryableHttpError(err));
        },
      });
  }

  /**
   * Sustituye una sesión en el array (inscripción exitosa).
   *
   * @param updated - DTO devuelto por el POST.
   */
  private replaceSession(updated: CalendarSessionApiDto): void {
    this.sessions.update((items) =>
      items.map((item) => (item.id === updated.id ? updated : item)),
    );
  }

  /**
   * Marca cupo lleno tras un 409 concurrente.
   *
   * @param sessionId - Convocatoria agotada.
   */
  private markFull(sessionId: number): void {
    this.sessions.update((items) =>
      items.map((item) => {
        if (item.id !== sessionId) {
          return item;
        }
        return {
          ...item,
          status: 'FULL',
          remainingSeats: item.remainingSeats === null ? 0 : 0,
        };
      }),
    );
    const pending = this.pending();
    if (pending?.id === sessionId) {
      this.pending.set({
        ...pending,
        status: 'FULL',
        remainingSeats: 0,
      });
    }
  }
}
