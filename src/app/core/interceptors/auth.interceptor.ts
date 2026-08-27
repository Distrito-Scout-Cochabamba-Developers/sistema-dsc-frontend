/**
 * Envía cookies de sesión en llamadas a `/api`.
 * Si existiera un JWT en memoria, también adjunta Bearer.
 */
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthSessionService } from '@core/services/auth-session.service';

function isApiRequest(url: string): boolean {
  return url.startsWith('/api') || url.includes('/api/');
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiReq = isApiRequest(req.url) ? req.clone({ withCredentials: true }) : req;
  const token = inject(AuthSessionService).accessToken();

  if (!token) {
    return next(apiReq);
  }

  return next(apiReq.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
