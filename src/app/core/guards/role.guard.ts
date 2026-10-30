/**
 * Guard funcional de roles: exige sesión y al menos uno de los códigos dados.
 * Sin rol, redirige a `/`. Sin sesión, a `/auth/login`.
 */
import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { AuthSessionService } from '@core/services/auth-session.service';
import { safeInternalUrl } from '@core/utils/navigation.utils';

/**
 * Crea un `CanActivateFn` que admite cualquiera de los roles indicados.
 *
 * @param requiredRoles - Códigos de `role.code` (p. ej. `ADMIN`).
 */
export function roleGuard(...requiredRoles: string[]): CanActivateFn {
  return (_route, state) => {
    const auth = inject(AuthSessionService);
    const router = inject(Router);

    return auth.ensureReady().pipe(
      map(() => {
        if (!auth.isAuthenticated()) {
          return router.createUrlTree(['/auth/login'], {
            queryParams: { returnUrl: safeInternalUrl(state.url) },
          });
        }

        const allowed =
          requiredRoles.length === 0 || requiredRoles.some((role) => auth.hasRole(role));
        return allowed ? true : router.createUrlTree(['/']);
      }),
    );
  };
}
