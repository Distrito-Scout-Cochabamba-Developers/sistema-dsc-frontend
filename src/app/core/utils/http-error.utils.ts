/**
 * Extrae un mensaje usable de un error HTTP RFC 7807.
 *
 * @param error - Error desconocido (típicamente `HttpErrorResponse`).
 * @param fallback - Mensaje si no hay `detail`.
 */
import { HttpErrorResponse } from '@angular/common/http';

import type { ProblemDetailsApi } from '@core/models/attendance-api.models';

export function problemDetailMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  if (error.status === 0) {
    return 'No hay conexión con el servidor. Comprueba que la API esté en marcha e inténtalo de nuevo.';
  }

  const body = error.error as ProblemDetailsApi | string | null;
  if (body && typeof body === 'object' && typeof body.detail === 'string' && body.detail.trim()) {
    return body.detail;
  }

  if (typeof body === 'string' && body.trim()) {
    return body;
  }

  return fallback;
}

/**
 * Indica si el fallo es transitorio (red o 5xx) y merece reintento manual.
 *
 * @param error - Error desconocido.
 */
export function isRetryableHttpError(error: unknown): boolean {
  if (!(error instanceof HttpErrorResponse)) {
    return true;
  }

  return error.status === 0 || error.status >= 500;
}
