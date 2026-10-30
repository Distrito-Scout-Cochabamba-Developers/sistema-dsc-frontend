import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { firstValueFrom, isObservable } from 'rxjs';

import { AuthSessionService } from '@core/services/auth-session.service';
import { AUTH_TOKEN_STORAGE_KEY } from '@core/utils/auth-token.storage';

import { authGuard } from './auth.guard';

describe('authGuard', () => {
  beforeEach(() => {
    sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
  });

  afterEach(() => {
    sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  });

  it('redirige a login si no hay sesión', async () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/privada' } as never),
    );
    const tree = isObservable(result) ? await firstValueFrom(result) : result;
    const router = TestBed.inject(Router);
    expect(tree).toEqual(
      router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: '/privada' } }),
    );
  });

  it('permite el acceso si hay sesión', async () => {
    TestBed.inject(AuthSessionService).applyAuthenticatedProfile({
      id: 1,
      personId: 1,
      username: 'pablo.rocha',
      email: 'pablo.rocha@example.test',
      roles: ['ADMIN'],
      displayName: 'pablo.rocha',
    });

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/privada' } as never),
    );
    const allowed = isObservable(result) ? await firstValueFrom(result) : result;
    expect(allowed).toBe(true);
  });
});
