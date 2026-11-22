/**
 * Contratos del calendario (`GET /api/v1/calendar/sessions`).
 * `moduleCode` es el id del módulo en texto (el catálogo ya no tiene `code`).
 */

/** Estado de convocatoria alineado a `TrainingModuleSessionStatus`. */
export type CalendarSessionStatus =
  | 'SCHEDULED'
  | 'OPEN'
  | 'FULL'
  | 'IN_PROGRESS'
  | 'FINISHED'
  | 'CANCELLED';

/**
 * Sesión visible en el calendario (`GET /api/v1/calendar/sessions`).
 * `isEnrolled` solo es significativo con Bearer; anónimo siempre `false`.
 */
export interface CalendarSessionApiDto {
  readonly id: number;
  readonly moduleCode: string;
  readonly moduleName: string;
  readonly moduleTypeCode: string;
  readonly moduleTypeName: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly location: string | null;
  readonly status: CalendarSessionStatus;
  readonly capacity: number | null;
  readonly enrolledCount: number;
  readonly remainingSeats: number | null;
  readonly isEnrolled: boolean;
}

/** Respuesta 201 de `POST /api/v1/calendar/sessions/{id}/enrollments`. */
export interface CalendarEnrollmentApiDto {
  readonly enrollmentId: number;
  readonly session: CalendarSessionApiDto;
}

/** Insignia visual de una tarjeta de sesión. */
export type CalendarSessionBadge = 'available' | 'enrolled' | 'full' | 'finished' | 'cancelled';

/** Modo de presentación de la página. */
export type CalendarViewMode = 'month' | 'list';
