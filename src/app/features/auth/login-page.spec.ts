import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { AuthSessionService } from '@core/services/auth-session.service';
import { AUTH_TOKEN_STORAGE_KEY } from '@core/utils/auth-token.storage';

import { LoginPage } from './login-page';

describe('LoginPage', () => {
  let http: HttpTestingController;

  function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  beforeEach(async () => {
    sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideRouter([{ path: '', component: LoginPage }]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  });

  function createFixture() {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    return fixture;
  }

  it('muestra el título y los campos de identificador y contraseña', () => {
    const fixture = createFixture();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Bienvenido');
    expect(fixture.nativeElement.querySelector('#identifier')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#password')).toBeTruthy();
  });

  it('exige identificador antes de llamar a la API', async () => {
    const fixture = createFixture();
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'El usuario o correo es obligatorio',
    );
    http.expectNone('/api/v1/auth/login');
  });

  it('envía POST /api/v1/auth/login y guarda JWT + sesión', async () => {
    const fixture = createFixture();
    const identifier = fixture.nativeElement.querySelector('#identifier') as HTMLInputElement;
    const password = fixture.nativeElement.querySelector('#password') as HTMLInputElement;
    identifier.value = 'pablo.rocha';
    identifier.dispatchEvent(new Event('input'));
    password.value = 'secret';
    password.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    const req = http.expectOne('/api/v1/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ identifier: 'pablo.rocha', password: 'secret' });
    req.flush({
      token: 'jwt-token',
      tokenType: 'Bearer',
      expiresAt: '2099-01-01T00:00:00.000Z',
      user: {
        id: 2,
        personId: 2,
        username: 'pablo.rocha',
        email: 'pablo.rocha@example.test',
        roles: ['ADMIN', 'DISTRICT_DIRECTOR'],
      },
    });
    await wait(50);
    fixture.detectChanges();

    const auth = TestBed.inject(AuthSessionService);
    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.accessToken()).toBe('jwt-token');
    expect(auth.roles()).toEqual(['ADMIN', 'DISTRICT_DIRECTOR']);
    expect(auth.currentUser()?.email).toBe('pablo.rocha@example.test');
  });

  it('muestra el detalle de credenciales inválidas', async () => {
    const fixture = createFixture();
    const identifier = fixture.nativeElement.querySelector('#identifier') as HTMLInputElement;
    const password = fixture.nativeElement.querySelector('#password') as HTMLInputElement;
    identifier.value = 'pablo.rocha';
    identifier.dispatchEvent(new Event('input'));
    password.value = 'bad';
    password.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    http.expectOne('/api/v1/auth/login').flush(
      { detail: 'Las credenciales son inválidas.' },
      { status: 401, statusText: 'Unauthorized' },
    );
    await wait(50);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Las credenciales son inválidas.',
    );
  });

  it('mantiene Google, registro y recuperación deshabilitados', () => {
    const fixture = createFixture();
    const buttons = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ) as HTMLButtonElement[];
    const google = buttons.find((button) => button.textContent?.includes('Google'));
    const forgot = buttons.find((button) => button.textContent?.includes('Olvidé'));
    const register = buttons.find((button) => button.textContent?.includes('Regístrate'));

    expect(google?.disabled).toBe(true);
    expect(forgot?.disabled).toBe(true);
    expect(register?.disabled).toBe(true);
  });
});
