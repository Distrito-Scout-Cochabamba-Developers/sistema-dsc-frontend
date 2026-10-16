import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import type { ModuleAttendanceResultApiDto, ScoutLeaderApiDto } from '@core/models/attendance-api.models';
import { AuthSessionService } from '@core/services/auth-session.service';

import { AttendancePage } from './attendance-page';

const SESSION_ID = 'mod-liderazgo-20241024';

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createComponent(sessionId: string) {
  const fixture = TestBed.createComponent(AttendancePage);
  fixture.componentRef.setInput('sessionId', sessionId);
  fixture.detectChanges();
  return fixture;
}

function textOf(fixture: ReturnType<typeof createComponent>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

function setInputValue(
  fixture: ReturnType<typeof createComponent>,
  selector: string,
  value: string,
): void {
  const el = fixture.nativeElement.querySelector(selector) as HTMLInputElement | HTMLSelectElement;
  el.value = value;
  el.dispatchEvent(new Event('input'));
}

describe('AttendancePage', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendancePage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('debe crearse', () => {
    const fixture = createComponent(SESSION_ID);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('muestra "Sesión no válida" cuando el sessionId está vacío', async () => {
    const fixture = createComponent('   ');
    await wait(50);
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('Sesión no válida');
  });

  it('muestra el formulario con los datos de la sesión cuando el sessionId es válido', async () => {
    const fixture = createComponent(SESSION_ID);
    await wait(50);
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('Módulo de Liderazgo y Servicio');
    expect(fixture.nativeElement.querySelector('#ci')).toBeTruthy();
  });

  it('muestra el perfil autenticado sin prellenar CI (la API no envía datos de dirigente)', async () => {
    TestBed.inject(AuthSessionService).applyAuthenticatedProfile({
      id: 1,
      username: 'jperez',
      email: 'jperez@dsc.org',
      roles: [],
      displayName: 'jperez',
    });
    const fixture = createComponent(SESSION_ID);
    await wait(50);
    fixture.detectChanges();

    const ciInput = fixture.nativeElement.querySelector('#ci') as HTMLInputElement;
    expect(ciInput.value).toBe('');
    expect(textOf(fixture)).toContain('Has iniciado sesión como');
    expect(textOf(fixture)).toContain('jperez');
  });

  it('autocompleta nombre y extensión al ingresar un CI existente en el directorio (sin sesión activa)', async () => {
    TestBed.inject(AuthSessionService).clearSession();
    const fixture = createComponent(SESSION_ID);
    await wait(50);
    fixture.detectChanges();

    setInputValue(fixture, '#ci', '87654321');
    fixture.detectChanges();
    await wait(500);

    const req = http.expectOne((request) => request.url.includes('/api/attendance/lookup-ci/87654321'));
    const body: ScoutLeaderApiDto = {
      id: 2,
      firstName: 'María',
      lastName: 'López Quispe',
      ciNumber: '87654321',
      extension: 'CB',
      phone: '71234567',
      isProfileComplete: true,
    };
    req.flush(body);
    fixture.detectChanges();

    const nameInput = fixture.nativeElement.querySelector('#fullName') as HTMLInputElement;
    expect(nameInput.value).toBe('María López Quispe');
    expect(textOf(fixture)).toContain('Perfil encontrado');
  });

  it('ofrece registro parcial cuando el CI no existe en el directorio', async () => {
    TestBed.inject(AuthSessionService).clearSession();
    const fixture = createComponent(SESSION_ID);
    await wait(50);
    fixture.detectChanges();

    setInputValue(fixture, '#ci', '99999999');
    fixture.detectChanges();
    await wait(500);

    const req = http.expectOne((request) => request.url.includes('lookup-ci/99999999'));
    req.flush({ detail: 'no encontrado' }, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('registro parcial');
  });

  it('valida que el CI debe ser numérico', async () => {
    TestBed.inject(AuthSessionService).clearSession();
    const fixture = createComponent(SESSION_ID);
    await wait(50);
    fixture.detectChanges();

    const ciInput = fixture.nativeElement.querySelector('#ci') as HTMLInputElement;
    setInputValue(fixture, '#ci', 'abc123');
    ciInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await wait(50);
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('Ingresa un CI numérico válido');
  });

  it('valida que el teléfono debe tener 8 dígitos', async () => {
    TestBed.inject(AuthSessionService).clearSession();
    const fixture = createComponent(SESSION_ID);
    await wait(50);
    fixture.detectChanges();

    const phoneInput = fixture.nativeElement.querySelector('#phone') as HTMLInputElement;
    setInputValue(fixture, '#phone', '123');
    phoneInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await wait(50);
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('Ingresa un móvil de 8 dígitos');
  });

  it('completa el flujo de registro parcial y muestra la pantalla de éxito', async () => {
    TestBed.inject(AuthSessionService).clearSession();
    const fixture = createComponent(SESSION_ID);
    await wait(50);
    fixture.detectChanges();

    setInputValue(fixture, '#ci', '11112222');
    fixture.detectChanges();
    await wait(500);

    http
      .expectOne((request) => request.url.includes('lookup-ci/11112222'))
      .flush({ detail: 'no' }, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    setInputValue(fixture, '#fullName', 'Test Persona');
    setInputValue(fixture, '#extension', 'LP');
    setInputValue(fixture, '#phone', '70011122');
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    fixture.detectChanges();
    await wait(50);

    const post = http.expectOne('/api/attendance/register');
    const created: ModuleAttendanceResultApiDto = {
      attendanceId: '11111111-1111-1111-1111-111111111111',
      trainingModuleId: 1,
      moduleTitle: 'Módulo de Liderazgo y Servicio',
      scoutLeaderId: 9,
      scoutLeaderFullName: 'Test Persona',
      ciNumber: '11112222-LP',
      registeredAt: '2026-08-18T18:00:00.000Z',
      isPartialRegistration: true,
    };
    post.flush(created, { status: 201, statusText: 'Created' });
    fixture.detectChanges();
    await wait(50);
    fixture.detectChanges();

    const text = textOf(fixture);
    expect(text).toContain('Registro exitoso');
    expect(text).toContain('Test Persona');
    expect(text).toContain('Registro parcial');
  });
});
