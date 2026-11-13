/**
 * Modelos de datos para la parametrización de requisitos por nivel.
 * Corresponden a los contratos HTTP de `DSC.Application.DTOs`.
 */

/**
 * Nivel de formación devuelto por `GET /api/v1/training-levels`.
 */
export interface TrainingLevelItemDto {
  /** Código único del nivel (p. ej. `IM-I-II`, `IM-III`). */
  readonly code: string;
  /** Nombre descriptivo del nivel. */
  readonly name: string;
  /** Código de la línea de formación asociada (`PJ`, `GI`, `AE`). */
  readonly trainingLineCode: string;
  /** Indica si el nivel está activo en el sistema. */
  readonly isActive: boolean;
}

/**
 * Módulo obligatorio asignado al criterio de módulos de un nivel.
 */
export interface MandatoryModuleItemDto {
  /** Identificador numérico del módulo formativo. */
  readonly id: number;
  /** Nombre del módulo formativo. */
  readonly name: string;
  /** Descripción opcional del contenido del módulo. */
  readonly description: string | null;
}

/**
 * Criterio de módulos configurado para un nivel.
 */
export interface ModuleRequirementsDto {
  /** Cantidad total de módulos requeridos para completar el nivel. */
  readonly totalModulesCount: number;
  /** Mínimo de módulos de la lista obligatoria que deben ser aprobados. */
  readonly minMandatoryModulesCount: number;
  /** Lista de módulos obligatorios elegibles para el nivel. */
  readonly mandatoryModules: readonly MandatoryModuleItemDto[];
}

/**
 * Respuesta del endpoint `GET /api/v1/training-levels/{code}/requirements`.
 * `modules` es `null` cuando el nivel todavía no tiene requisitos configurados.
 */
export interface TrainingLevelRequirementsDto {
  /** Código del nivel consultado. */
  readonly trainingLevelCode: string;
  /** Criterio de módulos configurado, o `null` si no tiene configuración previa. */
  readonly modules: ModuleRequirementsDto | null;
}

/**
 * Payload para guardar requisitos con `PUT /api/v1/admin/training-levels/{code}/requirements`.
 */
export interface WriteTrainingLevelRequirementsDto {
  /** Total de módulos que exige el nivel. */
  readonly totalModulesCount: number;
  /** Mínimo de módulos obligatorios elegibles a aprobar. */
  readonly minMandatoryModulesCount: number;
  /** Identificadores de los módulos seleccionados como obligatorios elegibles. */
  readonly mandatoryModuleIds: readonly number[];
}

/**
 * Línea de formación vinculada a un módulo del catálogo.
 */
export interface ModuleTrainingLineDto {
  /** Identificador numérico de la línea. */
  readonly id: number;
  /** Código de la línea (`PJ`, `GI`, `AE`). */
  readonly code: string;
  /** Nombre de la línea de formación. */
  readonly name: string;
  /** Descripción opcional de la línea. */
  readonly description: string | null;
}

/**
 * Módulo disponible en el catálogo (`GET /api/attendance/modules`).
 */
export interface EligibleModuleDto {
  /** Identificador numérico del módulo. */
  readonly id: number;
  /** Nombre oficial del módulo. */
  readonly name: string;
  /** Descripción formativa del módulo. */
  readonly description?: string | null;
  /** Líneas de formación a las que pertenece el módulo. */
  readonly trainingLines?: readonly ModuleTrainingLineDto[];
}
