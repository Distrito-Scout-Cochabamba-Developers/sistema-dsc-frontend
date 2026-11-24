import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from '../../app.routes';
import { AuthSessionService } from '@core/services/auth-session.service';

const lookupPath = '/api/v1/secretariat/participants/lookup';

describe('Consulta de Secretaría', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  async function openPanel() {
    TestBed.inject(AuthSessionService).applyAuthenticatedProfile({
      id: 1,
      personId: 1,
      username: 'test-secretaria',
      email: 'secretaria@example.test',
      roles: ['DISTRICT_SECRETARY'],
      displayName: 'Secretaría ficticia',
    });
    const harness = await RouterTestingHarness.create('/secretaria/convocatorias');
    const root = harness.routeNativeElement!;
    http
      .expectOne({ method: 'GET', url: '/api/v1/calendar/sessions' })
      .flush([
        { id: 42, moduleName: 'Convocatoria ficticia', startsAt: '2026-11-29T10:00:00-04:00' },
      ]);
    harness.detectChanges();
    expect(root.textContent).toContain('Convocatoria ficticia');
    expect(root.querySelector('input[name="ci"]')).toBeNull();

    const select = root.querySelector<HTMLSelectElement>('select[name="session"]')!;
    select.value = '42';
    select.dispatchEvent(new Event('change'));
    harness.detectChanges();
    const input = root.querySelector<HTMLInputElement>('input[name="ci"]')!;
    input.value = '5556667';
    input.dispatchEvent(new Event('input'));
    return { harness, root };
  }

  function search(root: HTMLElement) {
    root.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    return http.expectOne({ method: 'POST', url: lookupPath });
  }

  it('selecciona una convocatoria real y muestra una coincidencia sin escribir', async () => {
    const { harness, root } = await openPanel();
    const lookup = search(root);
    expect(lookup.request.body).toEqual({ ci: '5556667' });
    lookup.flush({ firstName: 'Persona', lastName: 'Ficticia', ciNumber: '5556667' });
    harness.detectChanges();
    expect(root.textContent).toContain('Persona Ficticia');
    expect(root.querySelectorAll('app-secretariat-enrollment-panel button')).toHaveLength(1);
    TestBed.inject(AuthSessionService).clearSession();
    harness.detectChanges();
    expect(root.textContent).not.toContain('Persona Ficticia');
    expect(root.querySelector('input[name="ci"]')).toBeNull();
  });

  it('permite confirmar modalidad Rover sin cuenta para una persona existente', async () => {
    const { harness, root } = await openPanel();
    search(root).flush({ personId: 8, isScoutLeader: false, firstName: 'Persona', lastName: 'Ficticia', ciNumber: '5556667' });
    harness.detectChanges();
    const rover = root.querySelector<HTMLInputElement>('input[value="ROVER_WITHOUT_ACCOUNT"]')!;
    expect(rover.labels?.[0]?.textContent).toContain('Rover sin cuenta');
    rover.click();
    harness.detectChanges();
    root.querySelector<HTMLButtonElement>('app-secretariat-enrollment-panel button[type="button"]')!.click();
    const request = http.expectOne('/api/v1/secretariat/participants/8/sessions/42/enrollments');
    expect(request.request.body).toEqual({ ci: '5556667', extension: null, modality: 'ROVER_WITHOUT_ACCOUNT' });
    request.flush({ enrollmentId: 1 });
  });

  it('deshabilita Rover para una cuenta conocida con explicación accesible', async () => {
    const { harness, root } = await openPanel();
    search(root).flush({ personId: 8, isScoutLeader: false, hasAccount: true, firstName: 'Persona', lastName: 'Ficticia', ciNumber: '5556667' });
    harness.detectChanges();
    const checkbox = root.querySelector<HTMLInputElement>('input[value="ROVER_WITHOUT_ACCOUNT"]')!;
    expect(checkbox.disabled).toBe(true);
    expect(checkbox.labels?.[0]?.textContent).toContain('Rover sin cuenta');
    const description = root.querySelector(`#${checkbox.getAttribute('aria-describedby')}`);
    expect(description?.textContent).toContain('tiene cuenta');
    expect(root.querySelector('app-secretariat-enrollment-panel button[type="button"]')).toBeNull();
  });

  it('explica el rechazo de una cuenta sin exponer el detalle del servidor', async () => {
    const { harness, root } = await openPanel();
    search(root).flush({ personId: 8, isScoutLeader: false, firstName: 'Persona', lastName: 'Ficticia', ciNumber: '5556667' });
    harness.detectChanges();
    root.querySelector<HTMLInputElement>('input[value="ROVER_WITHOUT_ACCOUNT"]')!.click();
    harness.detectChanges();
    root.querySelector<HTMLButtonElement>('app-secretariat-enrollment-panel button[type="button"]')!.click();
    http.expectOne('/api/v1/secretariat/participants/8/sessions/42/enrollments').flush(
      { type: 'urn:dsc:enrollment:rover-has-account', detail: 'dato privado' },
      { status: 409, statusText: 'Conflict' },
    );
    harness.detectChanges();
    expect(root.textContent).toContain('ya tiene cuenta');
    expect(root.textContent).not.toContain('dato privado');
  });

  it('confirma la inscripción y distingue los conflictos', async () => {
    const { harness, root } = await openPanel();
    search(root).flush({ personId: 8, isScoutLeader: true, firstName: 'Persona', lastName: 'Ficticia', ciNumber: '5556667' });
    harness.detectChanges();
    for (const [type, message] of [
      ['session-full', 'Sin cupo'],
      ['enrollment-closed', 'inscripción está cerrada'],
      ['already-enrolled', 'ya está inscrita'],
    ]) {
      root.querySelector<HTMLButtonElement>('app-secretariat-enrollment-panel button[type="button"]')!.click();
      http.expectOne('/api/v1/secretariat/participants/8/sessions/42/enrollments')
        .flush({ type: `urn:dsc:enrollment:${type}` }, { status: 409, statusText: 'Conflict' });
      harness.detectChanges();
      expect(root.textContent).toContain(message);
    }
    root.querySelector<HTMLButtonElement>('app-secretariat-enrollment-panel button[type="button"]')!.click();
    http.expectOne('/api/v1/secretariat/participants/8/sessions/42/enrollments').flush({ enrollmentId: 1 });
    harness.detectChanges();
    expect(root.textContent).toContain('Inscripción confirmada');
  });

  it('bloquea cambios durante confirmación y advierte resultado incierto tras error de red', async () => {
    const { harness, root } = await openPanel();
    search(root).flush({ personId: 8, isScoutLeader: true, firstName: 'Persona', lastName: 'Ficticia', ciNumber: '5556667' });
    harness.detectChanges();
    root.querySelector<HTMLButtonElement>('app-secretariat-enrollment-panel button[type="button"]')!.click();
    const request = http.expectOne('/api/v1/secretariat/participants/8/sessions/42/enrollments');
    harness.detectChanges();
    expect(root.querySelector<HTMLSelectElement>('select[name="session"]')!.disabled).toBe(true);
    expect(root.querySelector<HTMLInputElement>('input[name="ci"]')!.disabled).toBe(true);
    request.error(new ProgressEvent('error'));
    harness.detectChanges();
    expect(root.textContent).toContain('Verifica la inscripción antes de reintentar');
    expect(root.querySelector('app-secretariat-enrollment-panel button[type="button"]')).toBeNull();
  });

  it.each([401, 403])('limpia datos personales ante HTTP %s', async (status) => {
    const { harness, root } = await openPanel();
    search(root).flush({ personId: 8, isScoutLeader: true, firstName: 'Persona', lastName: 'Ficticia', ciNumber: '5556667' });
    harness.detectChanges();
    root.querySelector<HTMLButtonElement>('app-secretariat-enrollment-panel button[type="button"]')!.click();
    http.expectOne('/api/v1/secretariat/participants/8/sessions/42/enrollments').flush({}, { status, statusText: 'Error' });
    harness.detectChanges();
    expect(root.textContent).not.toContain('Persona Ficticia');
    expect(root.querySelector<HTMLInputElement>('input[name="ci"]')!.value).toBe('');
    expect(root.textContent).toContain(status === 401 ? 'sesión' : 'autorización');
  });

  it('trata un error 500 como resultado incierto sin reintentar', async () => {
    const { harness, root } = await openPanel();
    search(root).flush({ personId: 8, isScoutLeader: true, firstName: 'Persona', lastName: 'Ficticia', ciNumber: '5556667' });
    harness.detectChanges();
    root.querySelector<HTMLButtonElement>('app-secretariat-enrollment-panel button[type="button"]')!.click();
    http.expectOne('/api/v1/secretariat/participants/8/sessions/42/enrollments').flush({}, { status: 500, statusText: 'Error' });
    harness.detectChanges();
    expect(root.textContent).toContain('Verifica la inscripción antes de reintentar');
    http.expectNone('/api/v1/secretariat/participants/8/sessions/42/enrollments');
  });

  it('pide complemento ante ambigüedad y no elige si persiste', async () => {
    const { harness, root } = await openPanel();
    search(root).flush({}, { status: 409, statusText: 'Conflict' });
    harness.detectChanges();
    expect(root.textContent).toContain('Selecciona el complemento del CI');
    const extension = root.querySelector<HTMLSelectElement>('select[name="extension"]')!;
    extension.value = 'CB';
    extension.dispatchEvent(new Event('change'));
    const retry = search(root);
    expect(retry.request.body).toEqual({ ci: '5556667', extension: 'CB' });
    retry.flush({}, { status: 409, statusText: 'Conflict' });
    harness.detectChanges();
    expect(root.textContent).toContain('No se seleccionó a nadie');
    expect(root.querySelector('app-secretariat-enrollment-panel h2')).toBeNull();
    expect(root.querySelectorAll('app-secretariat-enrollment-panel button')).toHaveLength(1);
  });

  it('distingue la ausencia de coincidencia de un error del servicio', async () => {
    const { harness, root } = await openPanel();
    search(root).flush(
      { type: 'urn:dsc:secretariat:participant-not-found' },
      { status: 404, statusText: 'Not Found' },
    );
    harness.detectChanges();
    expect(root.textContent).toContain('No se encontró ninguna persona');
    search(root).flush({}, { status: 404, statusText: 'Not Found' });
    harness.detectChanges();
    expect(root.textContent).toContain('No se pudo realizar la consulta');
    expect(root.textContent).not.toContain('No se encontró ninguna persona');
  });

  // El alta de Rover nuevo (#160) comparte nombres de campo; el de dirigente se ubica por su identificador.
  const leaderForm = (root: HTMLElement) => root.querySelector('#new-first')!.closest('form')!;

  it('crea e inscribe solo tras búsqueda sin coincidencias', async () => {
    const { harness, root } = await openPanel();
    search(root).flush({ type: 'urn:dsc:secretariat:participant-not-found' }, { status: 404, statusText: 'Not Found' });
    harness.detectChanges();
    for (const [name, value] of Object.entries({ firstName: 'Ana', lastName: 'Prueba', phone: '70000000', email: 'ana@example.test' })) {
      leaderForm(root).querySelector<HTMLInputElement>(`input[name="${name}"]`)!.value = value;
    }
    leaderForm(root).dispatchEvent(new Event('submit', { cancelable: true }));
    const request = http.expectOne('/api/v1/secretariat/participants/sessions/42/enrollments');
    expect(request.request.body).toEqual({ ci: '5556667', extension: null, firstName: 'Ana', lastName: 'Prueba', phone: '70000000', email: 'ana@example.test' });
    request.flush({ enrollmentId: 1 });
    harness.detectChanges();
    expect(root.textContent).toContain('Inscripción confirmada');
    expect(root.textContent).toContain('activación de acceso está pendiente');
  });

  it('invalida el alta ante conflicto de identidad', async () => {
    const { harness, root } = await openPanel();
    search(root).flush({ type: 'urn:dsc:secretariat:participant-not-found' }, { status: 404, statusText: 'Not Found' });
    harness.detectChanges();
    for (const [name, value] of Object.entries({ firstName: 'Ana', lastName: 'Prueba', phone: '70000000', email: 'ana@example.test' })) {
      leaderForm(root).querySelector<HTMLInputElement>(`input[name="${name}"]`)!.value = value;
    }
    leaderForm(root).dispatchEvent(new Event('submit', { cancelable: true }));
    http.expectOne('/api/v1/secretariat/participants/sessions/42/enrollments').flush({ type: 'urn:dsc:secretariat:identity-changed' }, { status: 409, statusText: 'Conflict' });
    harness.detectChanges();
    expect(root.textContent).toContain('Vuelve a buscar');
    expect(root.querySelector('input[name="firstName"]')).toBeNull();
  });

  it('no permite a un administrador sin rol de Secretaría abrir el panel', async () => {
    TestBed.inject(AuthSessionService).applyAuthenticatedProfile({
      id: 1,
      personId: 1,
      username: 'test-admin',
      email: 'admin@example.test',
      roles: ['ADMIN'],
      displayName: 'Admin ficticio',
    });
    const harness = await RouterTestingHarness.create('/secretaria/convocatorias');
    expect(
      harness.routeNativeElement!.querySelector('app-secretariat-enrollment-panel'),
    ).toBeNull();
    expect(
      harness.routeNativeElement!.querySelector('a[href="/secretaria/convocatorias"]'),
    ).toBeNull();
    http.expectNone('/api/v1/calendar/sessions');
  });
});
