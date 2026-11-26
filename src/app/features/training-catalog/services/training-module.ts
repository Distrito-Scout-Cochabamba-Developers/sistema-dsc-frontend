/**
 * Servicio del catálogo de módulos administrativo (`/api/v1/admin/modules`).
 * Requiere JWT con rol ADMIN o DISTRICT_SECRETARY (el interceptor adjunta Bearer).
 */
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import type { TrainingModuleApiDto } from '@core/models/attendance-api.models';
import { apiUrl } from '@core/utils/api-url.utils';

import type {
  CatalogTrainingLineDto,
  WriteTrainingModuleDto,
  WriteTrainingModuleSessionDto,
} from '../training-catalog.models';

@Injectable({ providedIn: 'root' })
export class TrainingModuleService {
  private readonly http = inject(HttpClient);

  /**
   * Lista el catálogo de módulos (`GET /api/v1/admin/modules`).
   */
  list(): Observable<readonly TrainingModuleApiDto[]> {
    return this.http.get<TrainingModuleApiDto[]>(apiUrl('/api/v1/admin/modules'));
  }

  /**
   * Líneas de formación (`GET /api/v1/admin/training-lines`).
   */
  listLines(): Observable<readonly CatalogTrainingLineDto[]> {
    return this.http.get<CatalogTrainingLineDto[]>(apiUrl('/api/v1/admin/training-lines'));
  }

  /**
   * Alta (`POST /api/v1/admin/modules`).
   *
   * @param body - Nombre, descripción y códigos de línea.
   */
  create(body: WriteTrainingModuleDto): Observable<TrainingModuleApiDto> {
    return this.http.post<TrainingModuleApiDto>(apiUrl('/api/v1/admin/modules'), body);
  }

  /**
   * Edición (`PUT /api/v1/admin/modules/{id}`).
   *
   * @param id - Identificador del módulo.
   * @param body - Nombre, descripción y líneas.
   */
  update(id: number, body: WriteTrainingModuleDto): Observable<TrainingModuleApiDto> {
    return this.http.put<TrainingModuleApiDto>(apiUrl(`/api/v1/admin/modules/${id}`), body);
  }

  /**
   * Baja (`DELETE /api/v1/admin/modules/{id}`).
   *
   * @param id - Identificador del módulo.
   */
  remove(id: number): Observable<void> {
    return this.http.delete<void>(apiUrl(`/api/v1/admin/modules/${id}`));
  }

  /**
   * Abre una programación con fecha y horas (`POST .../modules/{id}/sessions`).
   *
   * @param moduleId - Módulo del catálogo de módulos.
   * @param body - Horarios y estado de inscripción.
   */
  createSession(
    moduleId: number,
    body: WriteTrainingModuleSessionDto,
  ): Observable<unknown> {
    return this.http.post(apiUrl(`/api/v1/admin/modules/${moduleId}/sessions`), body);
  }
}
