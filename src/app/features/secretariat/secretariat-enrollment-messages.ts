import { HttpErrorResponse } from '@angular/common/http';

/**
 * Mensajes y tipos de problema (`urn:dsc:enrollment:*`) que comparten los formularios de inscripción de
 * Secretaría. Ningún mensaje incluye datos personales ni el detalle devuelto por el servidor.
 */
const ENROLLMENT_CONFLICT_MESSAGES: ReadonlyMap<string, string> = new Map([
  ['urn:dsc:enrollment:session-full', 'Sin cupo en esta programación.'],
  ['urn:dsc:enrollment:enrollment-closed', 'La inscripción está cerrada.'],
  ['urn:dsc:enrollment:already-enrolled', 'La persona ya está inscrita.'],
]);

/** El Carnet de Identidad existe con otros complementos (o es ambiguo): el operador debe indicar el complemento. */
export const EXTENSION_REQUIRED_TYPE = 'urn:dsc:secretariat:extension-required';
export const EXTENSION_REQUIRED_MESSAGE =
  'Hay coincidencias con ese Carnet de Identidad. Selecciona el complemento y vuelve a buscar.';

export const UNCERTAIN_RESULT_MESSAGE =
  'El resultado de la confirmación es incierto. Verifica la inscripción antes de reintentar.';
export const SESSION_EXPIRED_MESSAGE = 'La sesión ha caducado. Inicia sesión nuevamente.';
export const FORBIDDEN_MESSAGE = 'No tienes autorización para confirmar inscripciones.';

/** Mensaje de un conflicto de cupo, cierre o duplicado; `undefined` si el tipo no es de esos. */
export function enrollmentConflictMessage(type: unknown): string | undefined {
  return typeof type === 'string' ? ENROLLMENT_CONFLICT_MESSAGES.get(type) : undefined;
}

/** Tipo (`type`) del problema HTTP, o cadena vacía si el error no lo trae. */
export function problemType(error: unknown): string {
  const type = error instanceof HttpErrorResponse ? error.error?.type : undefined;
  return typeof type === 'string' ? type : '';
}
