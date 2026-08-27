/**
 * Adjunta Bearer cuando hay token real. Hoy la API no emite JWT: no envía header si es nulo.
 */
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthSessionService } from '@core/services/auth-session.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthSessionService).accessToken();
  if (!token) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
