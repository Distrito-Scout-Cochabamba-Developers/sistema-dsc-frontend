/**
 * Perfil de dirigente autenticado (sesión de aplicación).
 */
export interface DirigenteSession {
  readonly id: string;
  readonly displayName: string;
  readonly fullName: string;
  readonly ci: string;
  readonly extension: string;
  readonly phone: string;
}

/**
 * Adulto del directorio distrital (lookup por CI).
 */
export interface AdultoDistrito {
  readonly ci: string;
  readonly fullName: string;
  readonly extension: string;
  readonly phone: string;
}

/**
 * Extensiones de CI (departamentos de Bolivia).
 */
export interface CiExtensionOption {
  readonly code: string;
  readonly label: string;
}

/**
 * Sesión de módulo de formación (objetivo del QR / deep link).
 */
export interface ModuloSesion {
  readonly sessionId: string;
  readonly moduleTitle: string;
  readonly moduleName: string;
  readonly description: string;
  readonly dateLabel: string;
  readonly timeLabel: string;
  readonly imageAlt: string;
  readonly imageUrl: string;
}

/**
 * Payload de registro de asistencia (frontend; contrato futuro con API).
 */
export interface RegistroAsistenciaPayload {
  readonly sessionId: string;
  readonly ci: string;
  readonly fullName: string;
  readonly extension: string;
  readonly phone: string;
  /** `true` si el adulto no existía en el directorio y se registra de forma parcial. */
  readonly partialRegistration: boolean;
}

/**
 * Confirmación de asistencia registrada.
 */
export interface RegistroAsistenciaResult {
  readonly registrationId: string;
  readonly participantName: string;
  readonly moduleSummary: string;
  readonly sessionDate: string;
  readonly sessionTime: string;
  readonly partialRegistration: boolean;
}
