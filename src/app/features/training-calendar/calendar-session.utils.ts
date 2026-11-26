/**
 * Derivación de insignias y copy de cupos a partir del DTO de sesión.
 */
import type {
  CalendarSessionApiDto,
  CalendarSessionBadge,
} from './training-calendar.models';

/**
 * Insignia de estado para la tarjeta. `Inscrito` gana si la sesión sigue vigente.
 *
 * @param session - Programación.
 * @param now - Reloj de referencia.
 */
export function sessionBadge(
  session: CalendarSessionApiDto,
  now: Date = new Date(),
): CalendarSessionBadge {
  if (session.status === 'CANCELLED') {
    return 'cancelled';
  }

  if (session.status === 'FINISHED' || new Date(session.startsAt).getTime() < now.getTime()) {
    return 'finished';
  }

  if (session.isEnrolled) {
    return 'enrolled';
  }

  if (session.status === 'FULL' || session.remainingSeats === 0) {
    return 'full';
  }

  return 'available';
}

/**
 * Indica si el dirigente puede abrir el modal de inscripción.
 *
 * @param session - Programación.
 * @param now - Reloj de referencia.
 */
export function canEnroll(session: CalendarSessionApiDto, now: Date = new Date()): boolean {
  return sessionBadge(session, now) === 'available';
}

/**
 * Etiqueta corta de la insignia.
 *
 * @param badge - Estado visual.
 */
export function sessionBadgeLabel(badge: CalendarSessionBadge): string {
  switch (badge) {
    case 'available':
      return 'Próximo';
    case 'enrolled':
      return 'Inscrito';
    case 'full':
      return 'Cupo lleno';
    case 'finished':
      return 'Finalizado';
    case 'cancelled':
      return 'Cancelado';
  }
}

/**
 * Texto de cupos (`5 / 20` o `Sin cupo límite`).
 *
 * @param session - Programación.
 */
export function sessionSeatsLabel(session: CalendarSessionApiDto): string {
  if (session.capacity === null || session.remainingSeats === null) {
    return 'Sin cupo límite';
  }

  return `${session.remainingSeats} de ${session.capacity} cupos`;
}
