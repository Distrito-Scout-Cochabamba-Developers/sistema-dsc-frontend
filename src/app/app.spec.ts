import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { AuthSessionService } from '@core/services/auth-session.service';
import { AUTH_TOKEN_STORAGE_KEY, writeStoredAuth } from '@core/utils/auth-token.storage';

import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('no llama /me si no hay JWT guardado', () => {
    TestBed.createComponent(App);
    TestBed.inject(HttpTestingController).expectNone('/api/v1/auth/me');
  });

  it('hidrata la sesión desde /api/v1/auth/me cuando hay token', () => {
    writeStoredAuth({
      token: 'stored-jwt',
      expiresAt: '2099-01-01T00:00:00.000Z',
      persist: false,
    });
    TestBed.createComponent(App);
    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne('/api/v1/auth/me');
    expect(req.request.headers.get('Authorization')).toBe('Bearer stored-jwt');
    req.flush({
      id: 7,
      personId: 7,
      username: 'dirigent',
      email: 'dirigent@dsc.org',
      roles: ['BRANCH_COMMISSIONER'],
    });

    const auth = TestBed.inject(AuthSessionService);
    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.currentUser()?.displayName).toBe('dirigent');
    expect(auth.roles()).toEqual(['BRANCH_COMMISSIONER']);
  });
});
