import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { AuthSessionService } from '@core/services/auth-session.service';

import { LoginPage } from './login-page';

describe('LoginPage', () => {
  let http: HttpTestingController;

  function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  beforeEach(async () => {
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
  });

  function createFixture() {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    return fixture;
  }

  it('muestra el título y los campos de correo y contraseña', () => {
    const fixture = createFixture();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Bienvenido');
    expect(fixture.nativeElement.querySelector('#email')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#password')).toBeTruthy();
  });

  it('exige un correo válido antes de llamar a la API', async () => {
    const fixture = createFixture();
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('El correo es obligatorio');
    http.expectNone('/api/auth/login/email');
  });

  it('envía POST /api/auth/login/email con credenciales y guarda la sesión', async () => {
    const fixture = createFixture();
    const email = fixture.nativeElement.querySelector('#email') as HTMLInputElement;
    const password = fixture.nativeElement.querySelector('#password') as HTMLInputElement;
    email.value = 'juan@dsc.org';
    email.dispatchEvent(new Event('input'));
    password.value = 'secret';
    password.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    const req = http.expectOne('/api/auth/login/email');
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual({ email: 'juan@dsc.org', password: 'secret' });
    req.flush({
      id: 1,
      username: 'juan',
      email: 'juan@dsc.org',
      roles: ['admin'],
    });
    await wait(50);
    fixture.detectChanges();

    const auth = TestBed.inject(AuthSessionService);
    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.session()?.email).toBe('juan@dsc.org');
  });

  it('muestra el detalle de credenciales inválidas', async () => {
    const fixture = createFixture();
    const email = fixture.nativeElement.querySelector('#email') as HTMLInputElement;
    const password = fixture.nativeElement.querySelector('#password') as HTMLInputElement;
    email.value = 'juan@dsc.org';
    email.dispatchEvent(new Event('input'));
    password.value = 'bad';
    password.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    http.expectOne('/api/auth/login/email').flush(
      { detail: 'Las credenciales son inválidas.' },
      { status: 400, statusText: 'Bad Request' },
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
