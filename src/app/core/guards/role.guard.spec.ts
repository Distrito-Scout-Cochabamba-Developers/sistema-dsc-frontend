import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { firstValueFrom, isObservable } from 'rxjs';

import { AuthSessionService } from '@core/services/auth-session.service';
import { AUTH_TOKEN_STORAGE_KEY } from '@core/utils/auth-token.storage';

import { roleGuard } from './role.guard';

describe('roleGuard', () => {
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

  it('bloquea si el usuario no tiene el rol', async () => {
    TestBed.inject(AuthSessionService).applyAuthenticatedProfile({
      id: 1,
      personId: 1,
      username: 'ana.laura',
      email: 'ana.laura@example.test',
      roles: ['BRANCH_COMMISSIONER'],
      displayName: 'ana.laura',
    });

    const result = TestBed.runInInjectionContext(() =>
      roleGuard('ADMIN')({} as never, { url: '/admin' } as never),
    );
    const tree = isObservable(result) ? await firstValueFrom(result) : result;
    expect(tree).toEqual(TestBed.inject(Router).createUrlTree(['/']));
  });

  it('permite si el usuario tiene uno de los roles', async () => {
    TestBed.inject(AuthSessionService).applyAuthenticatedProfile({
      id: 2,
      personId: 2,
      username: 'maricel.rocha',
      email: 'maricel.rocha@example.test',
      roles: ['DISTRICT_SECRETARY', 'FINANCE_COMMISSIONER'],
      displayName: 'maricel.rocha',
    });

    const result = TestBed.runInInjectionContext(() =>
      roleGuard('ADMIN', 'DISTRICT_SECRETARY')({} as never, { url: '/admin' } as never),
    );
    const allowed = isObservable(result) ? await firstValueFrom(result) : result;
    expect(allowed).toBe(true);
  });
});
