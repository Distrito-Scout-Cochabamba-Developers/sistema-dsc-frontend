/**
 * Registro de asistencia vía `POST api/attendance/register`.
 */
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import type {
  ModuleAttendanceResultApiDto,
  RegisterDigitalAttendanceApiDto,
} from '@core/models/attendance-api.models';
import type {
  AttendanceRegistrationPayload,
  AttendanceRegistrationResult,
} from '@core/models/attendance.models';
import { apiUrl } from '@core/utils/api-url.utils';
import { splitFullName } from '@core/utils/person-name.utils';

@Injectable({ providedIn: 'root' })
export class AttendanceRegistrationService {
  private readonly http = inject(HttpClient);

  /**
   * Registra asistencia a la sesión indicada.
   *
   * @param payload - Datos del formulario validados en UI.
   */
  register(payload: AttendanceRegistrationPayload): Observable<AttendanceRegistrationResult> {
    const { firstName, lastName } = splitFullName(payload.fullName);
    const body: RegisterDigitalAttendanceApiDto = {
      sessionToken: payload.sessionId,
      ciNumber: payload.ci,
      extension: payload.extension,
      firstName,
      lastName,
      phone: payload.phone,
    };

    return this.http
      .post<ModuleAttendanceResultApiDto>(apiUrl('/api/attendance/register'), body)
      .pipe(map((dto) => this.mapResult(dto)));
  }

  /**
   * Adapta la confirmación de la API al modelo de la pantalla de éxito.
   *
   * @param dto - Resultado persistido en el backend.
   */
  private mapResult(dto: ModuleAttendanceResultApiDto): AttendanceRegistrationResult {
    const registeredAt = new Date(dto.registeredAt);
    const hasValidDate = !Number.isNaN(registeredAt.getTime());

    return {
      registrationId: dto.attendanceId,
      participantName: dto.scoutLeaderFullName,
      moduleSummary: dto.moduleTitle,
      sessionDate: hasValidDate
        ? registeredAt.toLocaleDateString('es-BO', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : dto.registeredAt,
      sessionTime: hasValidDate
        ? registeredAt.toLocaleTimeString('es-BO', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '',
      estado: dto.isPartialRegistration ? 'parcial' : 'completo',
    };
  }
}
