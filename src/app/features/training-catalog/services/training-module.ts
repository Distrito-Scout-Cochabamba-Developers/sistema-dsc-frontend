/**
 * Servicio del catálogo administrativo (`/api/v1/admin/modules`).
 * Requiere JWT con rol ADMIN o DISTRICT_SECRETARY (el interceptor adjunta Bearer).
 */
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import type { TrainingModuleApiDto } from '@core/models/attendance-api.models';
import { apiUrl } from '@core/utils/api-url.utils';

import type { ModuleTypeApiDto, WriteTrainingModuleDto } from '../training-catalog.models';

@Injectable({ providedIn: 'root' })
export class TrainingModuleService {
  private readonly http = inject(HttpClient);

  /**
   * Lista el catálogo (`GET /api/v1/admin/modules`).
   */
  list(): Observable<readonly TrainingModuleApiDto[]> {
    return this.http.get<TrainingModuleApiDto[]>(apiUrl('/api/v1/admin/modules'));
  }

  /**
   * Tipos de módulo para el select (`GET /api/v1/admin/module-types`).
   */
  listTypes(): Observable<readonly ModuleTypeApiDto[]> {
    return this.http.get<ModuleTypeApiDto[]>(apiUrl('/api/v1/admin/module-types'));
  }

  /**
   * Alta (`POST /api/v1/admin/modules`).
   *
   * @param body - Código, nombre, descripción y tipo.
   */
  create(body: WriteTrainingModuleDto): Observable<TrainingModuleApiDto> {
    return this.http.post<TrainingModuleApiDto>(apiUrl('/api/v1/admin/modules'), body);
  }

  /**
   * Edición (`PUT /api/v1/admin/modules/{code}`). El código de la ruta no cambia.
   *
   * @param code - Código actual.
   * @param body - Nombre, descripción y tipo.
   */
  update(code: string, body: WriteTrainingModuleDto): Observable<TrainingModuleApiDto> {
    return this.http.put<TrainingModuleApiDto>(
      apiUrl(`/api/v1/admin/modules/${encodeURIComponent(code.trim())}`),
      body,
    );
  }

  /**
   * Baja (`DELETE /api/v1/admin/modules/{code}`).
   *
   * @param code - Código del módulo.
   */
  remove(code: string): Observable<void> {
    return this.http.delete<void>(
      apiUrl(`/api/v1/admin/modules/${encodeURIComponent(code.trim())}`),
    );
  }
}
