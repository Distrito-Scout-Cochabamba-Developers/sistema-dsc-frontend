import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AUTH_ROUTES } from './auth.routes';

const endpoint = '/api/v1/auth/activate';
const token = 'a'.repeat(43);
const password = 'Contraseña ficticia 162';

describe('Activación de cuenta', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'auth', children: AUTH_ROUTES }]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sin token utilizable muestra cómo conseguir otro enlace', async () => {
    const harness = await RouterTestingHarness.create('/auth/activar');
    expect(harness.routeNativeElement?.textContent).toContain('solicita otro a Secretaría');
    expect(harness.routeNativeElement?.querySelector('form')).toBeNull();
    http.expectNone(endpoint);
  });

  it('no canjea al abrir el enlace; exige enviar el formulario y ofrece iniciar sesión', async () => {
    const harness = await RouterTestingHarness.create(`/auth/activar#token=${token}`);
    const page = harness.routeNativeElement!;
    http.expectNone(endpoint);
    for (const input of page.querySelectorAll<HTMLInputElement>('input[type=password]')) {
      input.value = password;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    page.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    const request = http.expectOne({ method: 'POST', url: endpoint });
    expect(request.request.body).toEqual({ token, password });
    request.flush(null, { status: 204, statusText: 'No Content' });
    harness.detectChanges();
    expect(page.querySelector('[role=status]')?.textContent).toContain('Cuenta activada');
    expect(page.querySelector('a[href="/auth/login"]')).not.toBeNull();
  });
});
