/**
 * Calendario de programaciones e inscripción digital.
 * Si `TRAINING_CALENDAR_API_ENABLED` es falso, usa fixtures con la misma forma.
 */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, InjectionToken, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import { apiUrl } from '@core/utils/api-url.utils';
import { environment } from '../../../../environments/environment';

import { isoDateTimeToLocalDate } from '../calendar-month.utils';
import { buildCalendarFixtures } from '../training-calendar.fixtures';
import type {
  CalendarEnrollmentApiDto,
  CalendarSessionApiDto,
} from '../training-calendar.models';

/**
 * `true` cuando el backend ya publica GET/POST de calendario.
 * Los tests pueden sobreescribir el token para ejercitar HTTP.
 */
export const TRAINING_CALENDAR_API_ENABLED = new InjectionToken<boolean>(
  'TRAINING_CALENDAR_API_ENABLED',
  {
    providedIn: 'root',
    factory: () => environment.trainingCalendarApiEnabled,
  },
);

const SESSIONS_PATH = '/api/v1/calendar/sessions';

@Injectable({ providedIn: 'root' })
export class TrainingCalendarService {
  private readonly http = inject(HttpClient);
  private readonly apiEnabled = inject(TRAINING_CALENDAR_API_ENABLED);

  /** Copia mutable de las fixtures de esta instancia (demo local). */
  private demoSessions: CalendarSessionApiDto[] | null = null;

  /**
   * Lista programaciones en un rango. Sin `from`/`to` devuelve el set completo.
   *
   * @param range - Filtro opcional ISO `YYYY-MM-DD`.
   */
  listSessions(range?: {
    readonly from?: string;
    readonly to?: string;
  }): Observable<readonly CalendarSessionApiDto[]> {
    if (!this.apiEnabled) {
      return of(this.filterDemo(this.ensureDemo(), range));
    }

    const params: Record<string, string> = {};
    if (range?.from) {
      params['from'] = range.from;
    }
    if (range?.to) {
      params['to'] = range.to;
    }

    return this.http.get<CalendarSessionApiDto[]>(apiUrl(SESSIONS_PATH), { params });
  }

  /**
   * Inscribe al usuario autenticado. 409 si el cupo se agotó.
   *
   * @param sessionId - Identificador de la programación.
   */
  enroll(sessionId: number): Observable<CalendarEnrollmentApiDto> {
    if (!this.apiEnabled) {
      return this.enrollDemo(sessionId);
    }

    return this.http.post<CalendarEnrollmentApiDto>(
      apiUrl(`${SESSIONS_PATH}/${sessionId}/enrollments`),
      {},
    );
  }

  /**
   * Indica si la UI está leyendo fixtures (banner de demostración).
   */
  isUsingFixtures(): boolean {
    return !this.apiEnabled;
  }

  private ensureDemo(): CalendarSessionApiDto[] {
    this.demoSessions ??= buildCalendarFixtures();
    return this.demoSessions;
  }

  private filterDemo(
    sessions: readonly CalendarSessionApiDto[],
    range?: { readonly from?: string; readonly to?: string },
  ): CalendarSessionApiDto[] {
    return sessions.filter((session) => {
      const day = isoDateTimeToLocalDate(session.startsAt);
      if (range?.from && day < range.from) {
        return false;
      }
      if (range?.to && day > range.to) {
        return false;
      }
      return true;
    });
  }

  private enrollDemo(sessionId: number): Observable<CalendarEnrollmentApiDto> {
    const sessions = this.ensureDemo();
    const index = sessions.findIndex((session) => session.id === sessionId);
    const current = index >= 0 ? sessions[index] : undefined;

    if (!current) {
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            statusText: 'Not Found',
            error: { title: 'Not Found', status: 404, detail: 'La sesión no existe.' },
            url: apiUrl(`${SESSIONS_PATH}/${sessionId}/enrollments`),
          }),
      );
    }

    if (current.isEnrolled) {
      return throwError(() => this.conflict('Ya estás inscrito en esta sesión.'));
    }

    if (current.status === 'FULL' || current.remainingSeats === 0) {
      return throwError(() => this.conflict('El cupo de esta sesión se agotó.'));
    }

    const remaining =
      current.remainingSeats === null ? null : Math.max(0, current.remainingSeats - 1);
    const enrolledCount = current.enrolledCount + 1;
    const filled = remaining === 0;
    const updated: CalendarSessionApiDto = {
      ...current,
      isEnrolled: true,
      enrolledCount,
      remainingSeats: remaining,
      status: filled ? 'FULL' : current.status,
    };
    sessions[index] = updated;

    return of({ enrollmentId: 9000 + sessionId, session: updated });
  }

  private conflict(detail: string): HttpErrorResponse {
    return new HttpErrorResponse({
      status: 409,
      statusText: 'Conflict',
      error: { title: 'Conflict', status: 409, detail },
    });
  }
}
