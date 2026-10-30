import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthSessionService } from '@core/services/auth-session.service';
import { AUTH_TOKEN_STORAGE_KEY } from '@core/utils/auth-token.storage';

import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  beforeEach(() => {
    sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  });

  it('no envía Bearer si no hay token', () => {
    const http = TestBed.inject(HttpClient);
    const controller = TestBed.inject(HttpTestingController);

    http.get('/api/v1/auth/me').subscribe();
    const req = controller.expectOne('/api/v1/auth/me');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({ id: 1, personId: 1, username: 'a', email: 'a@a.a', roles: [] });
  });

  it('adjunta Authorization Bearer cuando hay JWT', () => {
    TestBed.inject(AuthSessionService).applyLogin({
      token: 'abc.def.ghi',
      tokenType: 'Bearer',
      expiresAt: '2099-01-01T00:00:00.000Z',
      user: {
        id: 1,
        personId: 1,
        username: 'pablo.rocha',
        email: 'pablo.rocha@example.test',
        roles: ['ADMIN'],
      },
    });

    const http = TestBed.inject(HttpClient);
    const controller = TestBed.inject(HttpTestingController);
    http.get('/api/v1/auth/me').subscribe();
    const req = controller.expectOne('/api/v1/auth/me');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc.def.ghi');
    req.flush({
      id: 1,
      personId: 1,
      username: 'pablo.rocha',
      email: 'pablo.rocha@example.test',
      roles: ['ADMIN'],
    });
  });
});
