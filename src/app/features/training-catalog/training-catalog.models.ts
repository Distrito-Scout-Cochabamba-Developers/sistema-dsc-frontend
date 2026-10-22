/**
 * Contratos del catálogo administrativo (`/api/v1/admin`).
 */

/** Body de POST/PUT y del formulario del modal. */
export interface WriteTrainingModuleDto {
  code: string;
  name: string;
  description: string;
  moduleTypeCode: string;
}

/** `GET /api/v1/admin/module-types`. */
export interface ModuleTypeApiDto {
  readonly id: number;
  readonly code: string;
  readonly name: string;
  readonly description: string | null;
}
