import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { AuthSessionService } from '@core/services/auth-session.service';
import { AUTH_TOKEN_STORAGE_KEY, writeStoredAuth } from '@core/utils/auth-token.storage';
import { MainLayout } from '@layout/main-layout/main-layout';

import { App } from './app';
import { routes } from './app.routes';

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

  it('expone requisitos de formación con carga diferida y guards', async () => {
    const children = routes.find((route) => route.path === '')?.children ?? [];
    const route = children.find((route) => route.path === 'admin/requisitos-formacion');
    expect(route?.canActivate).toHaveLength(2);
    expect(route?.loadChildren).toBeTypeOf('function');
    const { CURRICULUM_CONFIG_ROUTES } =
      await import('./features/curriculum-config/curriculum-config.routes');
    expect(CURRICULUM_CONFIG_ROUTES[0]?.title).toBe('Requisitos de formación | DSC');
  });

  it('muestra la nueva ruta en el menú solo para los roles autorizados', () => {
    const fixture = TestBed.createComponent(MainLayout);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('a[href="/admin/requisitos-formacion"]')).toBeNull();
    TestBed.inject(AuthSessionService).applyAuthenticatedProfile({
      id: 1,
      personId: 1,
      username: 'secretaria',
      displayName: 'Secretaría',
      email: 'secretaria@example.com',
      roles: ['DISTRICT_SECRETARY'],
    });
    fixture.detectChanges();
    expect(root.querySelector('a[href="/admin/requisitos-formacion"]')?.textContent?.trim()).toBe(
      'Requisitos de formación',
    );
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
