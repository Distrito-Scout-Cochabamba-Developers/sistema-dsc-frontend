/**
 * Catálogo de módulos de formación (`GET api/attendance/modules`).
 */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';

import type { TrainingModuleApiDto } from '@core/models/attendance-api.models';
import type { ModuleSession } from '@core/models/attendance.models';
import { apiUrl } from '@core/utils/api-url.utils';
import { toModuleSession } from '@core/utils/session-presentation.utils';

@Injectable({ providedIn: 'root' })
export class TrainingModulesService {
  private readonly http = inject(HttpClient);

  /**
   * Lista los módulos disponibles para inscripción.
   */
  list(): Observable<readonly TrainingModuleApiDto[]> {
    return this.http.get<TrainingModuleApiDto[]>(apiUrl('/api/attendance/modules'));
  }

  /**
   * Obtiene un módulo por id o `null` si no existe (404).
   *
   * @param id - `training_module.id` (también en la ruta de asistencia).
   */
  getById(id: string): Observable<TrainingModuleApiDto | null> {
    const normalized = id.trim();
    if (!normalized) {
      return of(null);
    }

    return this.http
      .get<TrainingModuleApiDto>(
        apiUrl(`/api/attendance/modules/${encodeURIComponent(normalized)}`),
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            return of(null);
          }
          return throwError(() => error);
        }),
      );
  }

  /**
   * Vista de sesión para el formulario de asistencia.
   *
   * @param sessionId - Id del módulo en la URL.
   */
  getModuleSession(sessionId: string): Observable<ModuleSession | null> {
    return this.getById(sessionId).pipe(
      map((dto) => (dto ? toModuleSession(dto) : null)),
    );
  }
}
