/**
 * Registro mock de asistencia a un módulo de formación.
 * Sustituir por POST HTTP cuando exista backend.
 */
import { Injectable, inject } from '@angular/core';
import { Observable, delay, map, of, switchMap } from 'rxjs';

import type {
  AttendanceRegistrationPayload,
  AttendanceRegistrationResult,
} from '@core/models/attendance.models';
import { AdultDirectoryService } from '@core/services/adult-directory.service';

@Injectable({ providedIn: 'root' })
export class AttendanceRegistrationService {
  private readonly directory = inject(AdultDirectoryService);

  /**
   * Registra asistencia a la sesión indicada (mock).
   *
   * @param payload - Datos del formulario validados en UI.
   * @returns Confirmación con resumen del módulo.
   */
  register(payload: AttendanceRegistrationPayload): Observable<AttendanceRegistrationResult> {
    return this.directory.getModuleSession(payload.sessionId).pipe(
      switchMap((session) => {
        if (!session) {
          throw new Error(`Sesión no encontrada: ${payload.sessionId}`);
        }

        const result: AttendanceRegistrationResult = {
          registrationId: `reg-${payload.ci}-${Date.now()}`,
          participantName: payload.fullName,
          moduleSummary: session.moduleName,
          sessionDate: session.dateLabel,
          sessionTime: session.timeLabel,
          estado: payload.estado,
        };

        return of(result).pipe(delay(600));
      }),
      map((result) => result),
    );
  }
}
