/**
 * Registro mock de asistencia a un módulo de formación.
 * Sustituir por POST HTTP cuando exista backend.
 */
import { Injectable, inject } from '@angular/core';
import { Observable, delay, map, of, switchMap } from 'rxjs';

import type {
  RegistroAsistenciaPayload,
  RegistroAsistenciaResult,
} from '@core/models/asistencia.models';
import { AdultosDirectoryService } from '@core/services/adultos-directory.service';

@Injectable({ providedIn: 'root' })
export class AsistenciaRegistroService {
  private readonly directory = inject(AdultosDirectoryService);

  /**
   * Registra asistencia a la sesión indicada (mock).
   *
   * @param payload - Datos del formulario validados en UI.
   * @returns Confirmación con resumen del módulo.
   */
  register(payload: RegistroAsistenciaPayload): Observable<RegistroAsistenciaResult> {
    return this.directory.getModuloSesion(payload.sessionId).pipe(
      switchMap((sesion) => {
        if (!sesion) {
          throw new Error(`Sesión no encontrada: ${payload.sessionId}`);
        }

        const result: RegistroAsistenciaResult = {
          registrationId: `reg-${payload.ci}-${Date.now()}`,
          participantName: payload.fullName,
          moduleSummary: sesion.moduleName,
          sessionDate: sesion.dateLabel,
          sessionTime: sesion.timeLabel,
          estado: payload.estado,
        };

        return of(result).pipe(delay(600));
      }),
      map((result) => result),
    );
  }
}
