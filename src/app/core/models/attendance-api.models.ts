/**
 * Contratos HTTP de asistencia (camelCase, DSC.Application.DTOs).
 */

/** `GET api/attendance/lookup-ci/{ci}`. */
export interface ScoutLeaderApiDto {
  readonly id: number;
  readonly firstName: string;
  readonly lastName: string;
  readonly ciNumber: string;
  readonly extension: string;
  readonly phone: string;
  readonly isProfileComplete: boolean;
}

/** `POST api/attendance/register`. */
export interface RegisterDigitalAttendanceApiDto {
  readonly sessionToken: string;
  readonly ciNumber: string;
  readonly extension: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phone: string;
}

/** Respuesta 201 de registro. */
export interface ModuleAttendanceResultApiDto {
  readonly attendanceId: string;
  readonly trainingModuleId: number;
  readonly moduleTitle: string;
  readonly scoutLeaderId: number;
  readonly scoutLeaderFullName: string;
  readonly ciNumber: string;
  readonly registeredAt: string;
  readonly isPartialRegistration: boolean;
}

/** Línea de formación (`training_line`) embebida en el módulo. */
export interface TrainingLineApiDto {
  readonly id: number;
  readonly code: string;
  readonly name: string;
  readonly description: string | null;
}

/** `GET api/attendance/modules` y `GET api/v1/admin/modules`. */
export interface TrainingModuleApiDto {
  readonly id: number;
  readonly name: string;
  readonly description: string | null;
  readonly trainingLines: readonly TrainingLineApiDto[];
}

/** RFC 7807 Problem Details. */
export interface ProblemDetailsApi {
  readonly type?: string;
  readonly title?: string;
  readonly status?: number;
  readonly detail?: string;
  readonly instance?: string;
}
