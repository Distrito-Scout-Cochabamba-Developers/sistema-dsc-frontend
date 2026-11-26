/**
 * Contratos del catálogo de módulos administrativo y del alta de programaciones.
 */

import type { TrainingLineApiDto } from '@core/models/attendance-api.models';

/** Alias del DTO de línea usado en el select/checkboxes. */
export type CatalogTrainingLineDto = TrainingLineApiDto;

/** Body de POST/PUT de `training_module`. */
export interface WriteTrainingModuleDto {
  name: string;
  description: string;
  trainingLineCodes: string[];
}

/** Un bloque de `training_module_schedule`. */
export interface WriteTrainingModuleScheduleDto {
  readonly sessionDate: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly partNumber: number;
}

/** Body de `POST /api/v1/admin/modules/{id}/sessions`. */
export interface WriteTrainingModuleSessionDto {
  readonly schedules: readonly WriteTrainingModuleScheduleDto[];
  readonly statusCode?: string;
  readonly isRegistrationOpen?: boolean;
}

/** Draft del modal de programación (un o más bloques). */
export interface ConvocatoriaDraft {
  readonly isRegistrationOpen: boolean;
  readonly schedules: readonly {
    readonly sessionDate: string;
    readonly startTime: string;
    readonly endTime: string;
  }[];
}
