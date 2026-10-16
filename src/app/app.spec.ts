import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { AuthSessionService } from '@core/services/auth-session.service';

import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
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
  });

  function flushHydrationUnauthorized(): void {
    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne('/api/auth/me');
    expect(req.request.withCredentials).toBe(true);
    req.flush({ detail: 'No autorizado' }, { status: 401, statusText: 'Unauthorized' });
  }

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    flushHydrationUnauthorized();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('hidrata la sesión desde /api/auth/me', () => {
    TestBed.createComponent(App);
    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne('/api/auth/me');
    req.flush({
      id: 7,
      username: 'dirigent',
      email: 'dirigent@dsc.org',
      roles: ['leader'],
    });

    const auth = TestBed.inject(AuthSessionService);
    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.session()?.displayName).toBe('dirigent');
  });
});
