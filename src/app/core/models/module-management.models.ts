/**
 * Modelos de gestión de módulos por Secretaría (alta manual y corrección de
 * participantes). Datos locales/de ejemplo por ahora — sin contrato de API
 * definido todavía.
 */
/** Módulo-evento que la Secretaría puede buscar y seleccionar (criterio 1). */
export interface ModuleEvent {
  readonly id: string;
  readonly moduleTitle: string;
  readonly moduleCode: string;
  readonly dateLabel: string;
  readonly participantsCount: number;
  readonly isRegistrationOpen: boolean;
}

/** Registro de un participante enrolado en un módulo-evento. */
export interface ParticipantRecord {
  readonly enrollmentId: string;
  ci: string;
  fullName: string;
  phone: string;
  attended: boolean;
}

/** Datos ingresados por la Secretaría al dar de alta un participante manualmente. */
export interface NewParticipantInput {
  readonly ci: string;
  readonly fullName: string;
  readonly phone: string;
}
