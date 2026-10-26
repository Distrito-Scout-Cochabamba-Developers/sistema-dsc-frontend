/**
 * Adjunta `Authorization: Bearer <token>` en llamadas a `/api` si hay JWT.
 */
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthSessionService } from '@core/services/auth-session.service';

function isApiRequest(url: string): boolean {
  return url.startsWith('/api') || url.includes('/api/');
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isApiRequest(req.url)) {
    return next(req);
  }

  const token = inject(AuthSessionService).accessToken();
  if (!token) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
