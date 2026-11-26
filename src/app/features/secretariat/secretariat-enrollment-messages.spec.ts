import { HttpErrorResponse } from '@angular/common/http';

import {
  UNCERTAIN_RESULT_MESSAGE,
  enrollmentConflictMessage,
  problemType,
} from './secretariat-enrollment-messages';

describe('Mensajes compartidos de inscripción de Secretaría', () => {
  it.each([
    ['urn:dsc:enrollment:session-full', 'Sin cupo en esta programación.'],
    ['urn:dsc:enrollment:enrollment-closed', 'La inscripción está cerrada.'],
    ['urn:dsc:enrollment:already-enrolled', 'La persona ya está inscrita.'],
  ])('traduce %s', (type, message) => {
    expect(enrollmentConflictMessage(type)).toBe(message);
  });

  it('no inventa mensajes para tipos desconocidos', () => {
    expect(enrollmentConflictMessage('urn:dsc:otro')).toBeUndefined();
    expect(enrollmentConflictMessage(undefined)).toBeUndefined();
  });

  it('extrae el tipo de un problema HTTP y devuelve vacío en otros errores', () => {
    const http = new HttpErrorResponse({ status: 409, error: { type: 'urn:dsc:enrollment:session-full', detail: 'privado' } });
    expect(problemType(http)).toBe('urn:dsc:enrollment:session-full');
    expect(problemType(new Error('x'))).toBe('');
    expect(problemType(new HttpErrorResponse({ status: 500 }))).toBe('');
  });

  it('el mensaje de resultado incierto indica verificar antes de reintentar', () => {
    expect(UNCERTAIN_RESULT_MESSAGE).toContain('Verifica la inscripción antes de reintentar');
  });
});
