/**
 * Guard funcional: exige sesión autenticada en rutas lazy.
 * Si no hay JWT válido, redirige a `/auth/login` con `returnUrl`.
 */
import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { AuthSessionService } from '@core/services/auth-session.service';
import { safeInternalUrl } from '@core/utils/navigation.utils';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthSessionService);
  const router = inject(Router);

  return auth.ensureReady().pipe(
    map((authenticated) => {
      if (authenticated) {
        return true;
      }

      return router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: safeInternalUrl(state.url) },
      });
    }),
  );
};
