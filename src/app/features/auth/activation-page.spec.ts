import { Location } from '@angular/common';
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

  it('asocia etiquetas y anuncia errores sin enviar el formulario', async () => {
    const harness = await RouterTestingHarness.create(`/auth/activar#token=${token}`);
    const page = harness.routeNativeElement!;
    const passwordInput = page.querySelector<HTMLInputElement>('#new-password')!;
    const confirmation = page.querySelector<HTMLInputElement>('#confirm-password')!;

    expect(page.querySelector('label[for="new-password"]')?.textContent).toContain(
      'Nueva contraseña',
    );
    expect(page.querySelector('label[for="confirm-password"]')?.textContent).toContain(
      'Confirma la contraseña',
    );
    expect(passwordInput.getAttribute('autocomplete')).toBe('new-password');

    passwordInput.value = 'corta';
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    page.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    harness.detectChanges();
    expect(page.querySelector('[role=alert]')?.textContent).toContain('al menos 12 caracteres');
    expect(passwordInput.getAttribute('aria-invalid')).toBe('true');
    expect(document.activeElement).toBe(passwordInput);

    passwordInput.value = password;
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    confirmation.value = 'Otra contraseña ficticia';
    confirmation.dispatchEvent(new Event('input', { bubbles: true }));
    page.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    harness.detectChanges();
    expect(page.querySelector('[role=alert]')?.textContent).toContain('no coinciden');
    expect(confirmation.getAttribute('aria-invalid')).toBe('true');
    expect(document.activeElement).toBe(confirmation);
    http.expectNone(endpoint);
  });

  it('un canje rechazado conserva el enlace para reintentar', async () => {
    const harness = await RouterTestingHarness.create(`/auth/activar#token=${token}`);
    expect(TestBed.inject(Location).path(true)).toBe('/auth/activar');
    const page = harness.routeNativeElement!;
    for (const input of page.querySelectorAll<HTMLInputElement>('input[type=password]')) {
      input.value = password;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    page.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    const rejected = http.expectOne({ method: 'POST', url: endpoint });
    rejected.flush({}, { status: 400, statusText: 'Bad Request' });
    expect(TestBed.inject(Location).path(true)).toBe('/auth/activar');
    harness.detectChanges();
    expect(page.querySelector('[role=alert]')?.textContent).toContain(
      'no es válido, caducó o ya se usó',
    );
    expect(page.querySelector('form')).not.toBeNull();

    page.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    const retry = http.expectOne({ method: 'POST', url: endpoint });
    expect(retry.request.body).toEqual({ token, password });
    retry.flush(null, { status: 204, statusText: 'No Content' });
    harness.detectChanges();
    expect(page.querySelector('[role=status]')?.textContent).toContain('Cuenta activada');
  });
});
