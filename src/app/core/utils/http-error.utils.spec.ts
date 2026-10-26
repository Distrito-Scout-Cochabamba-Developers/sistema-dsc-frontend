import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';

import { isRetryableHttpError, problemDetailMessage } from './http-error.utils';

describe('problemDetailMessage', () => {
  it('usa detail de Problem Details', () => {
    const error = new HttpErrorResponse({
      status: 409,
      error: { detail: 'El dirigente ya registró su asistencia.' },
    });
    expect(problemDetailMessage(error, 'fallback')).toBe(
      'El dirigente ya registró su asistencia.',
    );
  });

  it('explica fallos de red', () => {
    const error = new HttpErrorResponse({ status: 0, url: '/api' });
    expect(problemDetailMessage(error, 'fallback')).toContain('conexión');
  });
});

describe('isRetryableHttpError', () => {
  it('marca red y 5xx como reintentables', () => {
    expect(isRetryableHttpError(new HttpErrorResponse({ status: 0 }))).toBe(true);
    expect(isRetryableHttpError(new HttpErrorResponse({ status: 409 }))).toBe(false);
  });
});
