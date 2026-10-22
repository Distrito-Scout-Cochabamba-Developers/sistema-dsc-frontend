/**
 * Códigos de rol persistidos en `role.code` (JWT claim `roles`).
 * No usar abreviaturas: coinciden con la semilla del backend.
 */
export const AUTH_ROLE_CODES = [
  'ADMIN',
  'DISTRICT_DIRECTOR',
  'COMMUNICATIONS_OFFICER',
  'DISTRICT_SECRETARY',
  'FINANCE_COMMISSIONER',
  'YOUTH_PROGRAM_COORDINATOR',
  'ADULT_RESOURCES_COORDINATOR',
  'QUARTERMASTER',
  'OPERATIONS_OFFICER',
  'BRANCH_COMMISSIONER',
] as const;

/** Código de rol emitido por la API. */
export type AuthRoleCode = (typeof AUTH_ROLE_CODES)[number];

/** Roles que administran el catálogo de módulos. */
export const TRAINING_CATALOG_ROLES = ['ADMIN', 'DISTRICT_SECRETARY'] as const satisfies readonly AuthRoleCode[];
