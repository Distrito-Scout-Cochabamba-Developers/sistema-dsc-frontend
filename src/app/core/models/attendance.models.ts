/**
 * Código de extensión (departamento) de Bolivia. Cerrado a los 9 departamentos
 * reales — ver preguntas abiertas del ADR 0002 sobre si esto debe migrar a un
 * catálogo servido por API.
 */
export type DepartmentCode = 'LP' | 'CB' | 'SC' | 'OR' | 'PT' | 'TJ' | 'CH' | 'BE' | 'PD';

/**
 * Estado de un registro de asistencia.
 *
 * @remarks
 * Modelo provisional del frontend (ver ADR 0002, pregunta abierta #2): el
 * ciclo real de regularización por Secretaría (`FR-SEC-02/03`) probablemente
 * necesite más estados (ej. `'regularizado'`); esto no está decidido con el
 * backend todavía.
 */
export type AttendanceRegistrationStatus = 'completo' | 'parcial';

/**
 * Perfil de dirigente autenticado (sesión de aplicación).
 */
export interface LeaderSession {
  readonly id: string;
  readonly displayName: string;
  readonly fullName: string;
  readonly ci: string;
  readonly extension: DepartmentCode;
  readonly phone: string;
}

/**
 * Adulto del directorio distrital (lookup por CI).
 */
export interface DistrictAdult {
  readonly ci: string;
  readonly fullName: string;
  readonly extension: DepartmentCode;
  readonly phone: string;
}

/**
 * Extensiones de CI (departamentos de Bolivia).
 */
export interface CiExtensionOption {
  readonly code: DepartmentCode;
  readonly label: string;
}

/**
 * Sesión de módulo de formación (objetivo del QR / deep link).
 */
export interface ModuleSession {
  readonly sessionId: string;
  readonly moduleTitle: string;
  readonly moduleName: string;
  readonly description: string;
  readonly dateLabel?: string;
  readonly timeLabel?: string;
  readonly imageAlt: string;
  readonly imageUrl: string;
}

/**
 * Payload de registro de asistencia enviado desde el formulario.
 */
export interface AttendanceRegistrationPayload {
  readonly sessionId: string;
  readonly ci: string;
  readonly fullName: string;
  readonly extension: DepartmentCode;
  readonly phone: string;
}

/**
 * Confirmación de asistencia registrada.
 */
export interface AttendanceRegistrationResult {
  readonly registrationId: string;
  readonly participantName: string;
  readonly moduleSummary: string;
  readonly sessionDate: string;
  readonly sessionTime: string;
  readonly estado: AttendanceRegistrationStatus;
}
