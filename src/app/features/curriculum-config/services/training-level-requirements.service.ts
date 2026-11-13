/**
 * Servicio para la gestión de requisitos por nivel de formación.
 * Consume endpoints de consulta (`/api/v1/training-levels`) y administración (`/api/v1/admin/training-levels`).
 */
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { apiUrl } from '@core/utils/api-url.utils';

import type {
  EligibleModuleDto,
  TrainingLevelItemDto,
  TrainingLevelRequirementsDto,
  WriteTrainingLevelRequirementsDto,
} from '../curriculum-config.models';

@Injectable({ providedIn: 'root' })
export class TrainingLevelRequirementsService {
  private readonly http = inject(HttpClient);

  /**
   * Obtiene la lista completa de niveles de formación registrados.
   *
   * @returns Observable con la lista de niveles ordenada por nombre.
   */
  listLevels(): Observable<readonly TrainingLevelItemDto[]> {
    return this.http.get<readonly TrainingLevelItemDto[]>(apiUrl('/api/v1/training-levels'));
  }

  /**
   * Consulta los requisitos curriculares actuales de un nivel específico.
   *
   * @param levelCode - Código único del nivel (p. ej. `IM-I-II`).
   * @returns Observable con el estado de requisitos; `modules` es `null` si aún no fue configurado.
   */
  getRequirements(levelCode: string): Observable<TrainingLevelRequirementsDto> {
    const encoded = encodeURIComponent(levelCode.trim());
    return this.http.get<TrainingLevelRequirementsDto>(
      apiUrl(`/api/v1/training-levels/${encoded}/requirements`),
    );
  }

  /**
   * Guarda o actualiza los requisitos de criterio de módulos para un nivel de formación.
   * Requiere autorización (CAE, Director Distrital o Secretaría).
   *
   * @param levelCode - Código único del nivel a configurar.
   * @param payload - Datos con total de módulos, mínimo obligatorio e IDs seleccionados.
   * @returns Observable con los requisitos actualizados.
   */
  saveRequirements(
    levelCode: string,
    payload: WriteTrainingLevelRequirementsDto,
  ): Observable<TrainingLevelRequirementsDto> {
    const encoded = encodeURIComponent(levelCode.trim());
    return this.http.put<TrainingLevelRequirementsDto>(
      apiUrl(`/api/v1/admin/training-levels/${encoded}/requirements`),
      payload,
    );
  }

  /**
   * Lista los módulos disponibles para ser seleccionados como obligatorios elegibles.
   *
   * @returns Observable con la lista de módulos formativos del catálogo.
   */
  listEligibleModules(): Observable<readonly EligibleModuleDto[]> {
    return this.http.get<readonly EligibleModuleDto[]>(apiUrl('/api/attendance/modules'));
  }
}
