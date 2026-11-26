import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from '../../app.routes';
import { AuthSessionService } from '@core/services/auth-session.service';

const lookupPath = '/api/v1/secretariat/participants/lookup';
const pendingPath = '/api/v1/secretariat/invitations/pending';

describe('Consulta de Secretaría', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  async function openPanel(pending: readonly object[] = []) {
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
        { id: 42, moduleName: 'Programación ficticia', startsAt: '2026-11-29T10:00:00-04:00' },
      ]);
    http.expectOne({ method: 'GET', url: pendingPath }).flush(pending);
    harness.detectChanges();
    expect(root.textContent).toContain('Programación ficticia');
    expect(root.querySelector('input[name="ci"]')).toBeNull();

    root.querySelector<HTMLButtonElement>('[aria-label="Módulos programados"] button')!.click();
    harness.detectChanges();
    const input = root.querySelector<HTMLInputElement>('input[name="ci"]')!;
    input.value = '5556667';
    input.dispatchEvent(new Event('input'));
    return { harness, root };
  }

  /** Formulario de búsqueda por Carnet de Identidad (distinto del formulario de filtros). */
  function searchForm(root: HTMLElement) {
    return root.querySelector('input[name="ci"]')!.closest('form')!;
  }

  function search(root: HTMLElement) {
    searchForm(root).dispatchEvent(new Event('submit', { cancelable: true }));
    return http.expectOne({ method: 'POST', url: lookupPath });
  }

  it('selecciona una programación real y muestra una coincidencia sin escribir', async () => {
    const { harness, root } = await openPanel();
    const lookup = search(root);
    expect(lookup.request.body).toEqual({ ci: '5556667', extension: null, sessionId: 42 });
    lookup.flush({ firstName: 'Persona', lastName: 'Ficticia', ciNumber: '5556667' });
    harness.detectChanges();
    expect(root.textContent).toContain('Persona Ficticia');
    expect(searchForm(root).querySelectorAll('button[type="submit"]')).toHaveLength(1);
    expect(root.querySelectorAll('form')).toHaveLength(2);
    TestBed.inject(AuthSessionService).applyAuthenticatedProfile({ id: 1, personId: 1, username: 'admin', email: 'admin@example.test', roles: ['ADMIN'], displayName: 'Admin' });
    harness.detectChanges();
    expect(root.textContent).not.toContain('Persona Ficticia');
    expect(root.querySelector('input[name="ci"]')).toBeNull();
  });

  it('enrolls a Rover with an account using the recorded condition', async () => {
    const { harness, root } = await openPanel();
    search(root).flush({ personId: 8, condition: 'ROVER', isEnrolled: false, hasAccount: true, firstName: 'Persona', lastName: 'Ficticia', ciNumber: '5556667' });
    harness.detectChanges();
    expect(root.textContent).toContain('Rover');
    expect(root.querySelector('input[type="checkbox"]')).toBeNull();
    root.querySelector<HTMLButtonElement>('[aria-live="polite"] > div.space-y-1 button[type="button"]')!.click();
    const request = http.expectOne('/api/v1/secretariat/participants/8/sessions/42/enrollments');
    expect(request.request.body).toEqual({ ci: '5556667', extension: null });
    request.flush({ enrollmentId: 1 });
  });

  it.each([
    { condition: null, isEnrolled: false },
    { condition: 'LEADER', isEnrolled: true },
  ])('blocks enrollment without condition or when already enrolled', async (state) => {
    const { harness, root } = await openPanel();
    search(root).flush({ personId: 8, firstName: 'Persona', lastName: 'Ficticia', ciNumber: '5556667', ...state });
    harness.detectChanges();
    expect(root.querySelector('[aria-live="polite"] > div.space-y-1 button[type="button"]')).toBeNull();
  });

  it('mantiene el módulo y limpia la identidad al inscribir a otra persona', async () => {
    const { harness, root } = await openPanel();
    search(root).flush({ personId: 8, condition: 'LEADER', isEnrolled: false, firstName: 'Persona', lastName: 'Ficticia', ciNumber: '5556667' });
    harness.detectChanges();
    root.querySelector<HTMLButtonElement>('[aria-live="polite"] > div.space-y-1 button[type="button"]')!.click();
    http.expectOne('/api/v1/secretariat/participants/8/sessions/42/enrollments').flush({ enrollmentId: 1 });
    harness.detectChanges();
    [...root.querySelectorAll('button')].find((button) => button.textContent?.includes('Inscribir a otra persona'))!.click();
    harness.detectChanges();
    expect(root.textContent).toContain('Programación ficticia');
    expect(root.querySelector<HTMLInputElement>('input[name="ci"]')!.value).toBe('');
    expect(document.activeElement).toBe(root.querySelector('input[name="ci"]'));
  });

  it('bloquea reintento al detectar inscripción concurrente', async () => {
    const { harness, root } = await openPanel();
    search(root).flush({ personId: 8, condition: 'LEADER', isEnrolled: false, firstName: 'Persona', lastName: 'Ficticia', ciNumber: '5556667' });
    harness.detectChanges();
    root.querySelector<HTMLButtonElement>('[aria-live="polite"] > div.space-y-1 button[type="button"]')!.click();
    http.expectOne('/api/v1/secretariat/participants/8/sessions/42/enrollments').flush({ type: 'urn:dsc:enrollment:already-enrolled' }, { status: 409, statusText: 'Conflict' });
    harness.detectChanges();
    expect(root.textContent).toContain('Ya está inscrito/a en este módulo programado');
    expect(root.querySelector('[aria-live="polite"] > div.space-y-1 button[type="button"]')).toBeNull();
  });

  it('confirma la inscripción y distingue los conflictos', async () => {
    const { harness, root } = await openPanel();
    search(root).flush({ personId: 8, condition: 'LEADER', isEnrolled: false, firstName: 'Persona', lastName: 'Ficticia', ciNumber: '5556667' });
    harness.detectChanges();
    for (const [type, message] of [
      ['session-full', 'Sin cupo'],
      ['enrollment-closed', 'inscripción está cerrada'],
    ]) {
      root.querySelector<HTMLButtonElement>('[aria-live="polite"] > div.space-y-1 button[type="button"]')!.click();
      http.expectOne('/api/v1/secretariat/participants/8/sessions/42/enrollments')
        .flush({ type: `urn:dsc:enrollment:${type}` }, { status: 409, statusText: 'Conflict' });
      harness.detectChanges();
      expect(root.textContent).toContain(message);
    }
    root.querySelector<HTMLButtonElement>('[aria-live="polite"] > div.space-y-1 button[type="button"]')!.click();
    http.expectOne('/api/v1/secretariat/participants/8/sessions/42/enrollments').flush({ enrollmentId: 1 });
    harness.detectChanges();
    expect(root.textContent).toContain('Inscripción confirmada');
  });

  it('bloquea cambios durante confirmación y advierte resultado incierto tras error de red', async () => {
    const { harness, root } = await openPanel();
    search(root).flush({ personId: 8, condition: 'LEADER', isEnrolled: false, firstName: 'Persona', lastName: 'Ficticia', ciNumber: '5556667' });
    harness.detectChanges();
    root.querySelector<HTMLButtonElement>('[aria-live="polite"] > div.space-y-1 button[type="button"]')!.click();
    const request = http.expectOne('/api/v1/secretariat/participants/8/sessions/42/enrollments');
    harness.detectChanges();
    expect(root.querySelector<HTMLButtonElement>('[aria-label="Módulos programados"] button')!.disabled).toBe(true);
    expect(root.querySelector<HTMLInputElement>('input[name="ci"]')!.disabled).toBe(true);
    request.error(new ProgressEvent('error'));
    harness.detectChanges();
    expect(root.textContent).toContain('Verifica la inscripción antes de reintentar');
    expect(root.querySelector('[aria-live="polite"] > div.space-y-1 button[type="button"]')).toBeNull();
  });

  it.each([401, 403])('limpia datos personales ante HTTP %s', async (status) => {
    const { harness, root } = await openPanel();
    search(root).flush({ personId: 8, condition: 'LEADER', isEnrolled: false, firstName: 'Persona', lastName: 'Ficticia', ciNumber: '5556667' });
    harness.detectChanges();
    root.querySelector<HTMLButtonElement>('[aria-live="polite"] > div.space-y-1 button[type="button"]')!.click();
    http.expectOne('/api/v1/secretariat/participants/8/sessions/42/enrollments').flush({}, { status, statusText: 'Error' });
    harness.detectChanges();
    expect(root.textContent).not.toContain('Persona Ficticia');
    expect(root.querySelector<HTMLInputElement>('input[name="ci"]')!.value).toBe('');
    expect(root.textContent).toContain(status === 401 ? 'sesión' : 'autorización');
  });

  it('trata un error 500 como resultado incierto sin reintentar', async () => {
    const { harness, root } = await openPanel();
    search(root).flush({ personId: 8, condition: 'LEADER', isEnrolled: false, firstName: 'Persona', lastName: 'Ficticia', ciNumber: '5556667' });
    harness.detectChanges();
    root.querySelector<HTMLButtonElement>('[aria-live="polite"] > div.space-y-1 button[type="button"]')!.click();
    http.expectOne('/api/v1/secretariat/participants/8/sessions/42/enrollments').flush({}, { status: 500, statusText: 'Error' });
    harness.detectChanges();
    expect(root.textContent).toContain('Verifica la inscripción antes de reintentar');
    http.expectNone('/api/v1/secretariat/participants/8/sessions/42/enrollments');
  });

  it('pide complemento ante ambigüedad y no elige si persiste', async () => {
    const { harness, root } = await openPanel();
    search(root).flush({}, { status: 409, statusText: 'Conflict' });
    harness.detectChanges();
    expect(root.textContent).toContain('Selecciona el complemento del Carnet de Identidad');
    const extension = root.querySelector<HTMLSelectElement>('select[name="extension"]')!;
    extension.value = 'CB';
    extension.dispatchEvent(new Event('change'));
    const retry = search(root);
    expect(retry.request.body).toEqual({ ci: '5556667', extension: 'CB', sessionId: 42 });
    retry.flush({}, { status: 409, statusText: 'Conflict' });
    harness.detectChanges();
    expect(root.textContent).toContain('No se seleccionó a nadie');
    expect(root.querySelector('app-secretariat-enrollment-panel h2')).toBeNull();
    expect(searchForm(root).querySelectorAll('button[type="submit"]')).toHaveLength(1);
    expect(root.querySelectorAll('form')).toHaveLength(2);
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
    root.querySelectorAll<HTMLButtonElement>('[aria-label="Tipo de registro"] button')[1]!.click();
    harness.detectChanges();
    for (const [name, value] of Object.entries({ firstName: ' Ana ', lastName: 'Prueba ', phone: ' 70000000', email: 'ana@example.test ' })) {
      leaderForm(root).querySelector<HTMLInputElement>(`input[name="${name}"]`)!.value = value;
    }
    leaderForm(root).dispatchEvent(new Event('submit', { cancelable: true }));
    const request = http.expectOne('/api/v1/secretariat/participants/sessions/42/enrollments');
    expect(request.request.body).toEqual({ ci: '5556667', extension: null, firstName: 'Ana', lastName: 'Prueba', phone: '70000000', email: 'ana@example.test' });
    request.flush({ enrollmentId: 1, invitation: 'SENT' });
    harness.detectChanges();
    expect(root.textContent).toContain('Inscripción confirmada');
    expect(root.textContent).toContain('correo de activación fue enviado');
  });

  async function createLeader(flush: object, status = 201) {
    const { harness, root } = await openPanel();
    search(root).flush({ type: 'urn:dsc:secretariat:participant-not-found' }, { status: 404, statusText: 'Not Found' });
    harness.detectChanges();
    root.querySelectorAll<HTMLButtonElement>('[aria-label="Tipo de registro"] button')[1]!.click();
    harness.detectChanges();
    for (const [name, value] of Object.entries({ firstName: 'Ana', lastName: 'Prueba', phone: '70000000', email: 'ana@example.test' })) {
      leaderForm(root).querySelector<HTMLInputElement>(`input[name="${name}"]`)!.value = value;
    }
    leaderForm(root).dispatchEvent(new Event('submit', { cancelable: true }));
    http.expectOne('/api/v1/secretariat/participants/sessions/42/enrollments').flush(flush, { status, statusText: status === 201 ? 'Created' : 'Conflict' });
    harness.detectChanges();
    return { harness, root };
  }
  const retryButton = (root: HTMLElement) => [...root.querySelectorAll('button')].find((b) => b.textContent?.includes('Reintentar envío'));

  it('indica que el correo de activación quedó pendiente y permite reintentar manualmente sin repetir la inscripción', async () => {
    const { harness, root } = await createLeader({ enrollmentId: 7, invitation: 'PENDING' });
    expect(root.textContent).toContain('Inscripción confirmada');
    expect(root.textContent).toContain('correo de activación quedó pendiente');
    retryButton(root)!.click();
    const retry = http.expectOne({ method: 'POST', url: '/api/v1/secretariat/invitations/7/retry' });
    expect(retry.request.body).toBeNull();
    retry.flush({ invitation: 'SENT' });
    harness.detectChanges();
    expect(root.textContent).toContain('correo de activación fue enviado');
    expect(retryButton(root)).toBeUndefined();
  });

  it('mantiene el reintento disponible si el envío vuelve a fallar', async () => {
    const { harness, root } = await createLeader({ enrollmentId: 7, invitation: 'PENDING' });
    retryButton(root)!.click();
    http.expectOne('/api/v1/secretariat/invitations/7/retry').flush({ type: 'urn:dsc:invitation:delivery-failed' }, { status: 502, statusText: 'Bad Gateway' });
    harness.detectChanges();
    expect(root.textContent).toContain('No se pudo entregar el correo');
    expect(retryButton(root)).toBeDefined();
  });

  it('informa que el correo ya estaba entregado si otro reintento ganó', async () => {
    const { harness, root } = await createLeader({ enrollmentId: 7, invitation: 'PENDING' });
    retryButton(root)!.click();
    http.expectOne('/api/v1/secretariat/invitations/7/retry').flush({ type: 'urn:dsc:invitation:already-sent' }, { status: 409, statusText: 'Conflict' });
    harness.detectChanges();
    expect(root.textContent).toContain('correo de activación fue enviado');
    expect(retryButton(root)).toBeUndefined();
  });

  it('recupera al iniciar las invitaciones pendientes para reintentar tras recargar, sin mostrar datos personales', async () => {
    TestBed.inject(AuthSessionService).applyAuthenticatedProfile({
      id: 1, personId: 1, username: 'test-secretaria', email: 'secretaria@example.test', roles: ['DISTRICT_SECRETARY'], displayName: 'Secretaría ficticia',
    });
    const harness = await RouterTestingHarness.create('/secretaria/convocatorias');
    const root = harness.routeNativeElement!;
    http.expectOne({ method: 'GET', url: '/api/v1/calendar/sessions' }).flush([]);
    http.expectOne({ method: 'GET', url: pendingPath }).flush([
      { enrollmentId: 7, attempts: 2, lastFailureCode: 'SmtpException', createdAt: '2026-11-24T10:00:00Z' },
    ]);
    harness.detectChanges();
    expect(retryButton(root)).toBeDefined();
    expect(root.textContent).not.toContain('SmtpException');

    retryButton(root)!.click();
    http.expectOne({ method: 'POST', url: '/api/v1/secretariat/invitations/7/retry' }).flush({ invitation: 'SENT' });
    harness.detectChanges();
    expect(root.textContent).toContain('correo de activación fue enviado');
    expect(retryButton(root)).toBeUndefined();
  });

  it('conserva las invitaciones pendientes al buscar a otra persona', async () => {
    const { harness, root } = await openPanel([{ enrollmentId: 9, attempts: 1, lastFailureCode: null, createdAt: '2026-11-24T10:00:00Z' }]);
    expect(retryButton(root)).toBeDefined();
    search(root).flush({ type: 'urn:dsc:secretariat:participant-not-found' }, { status: 404, statusText: 'Not Found' });
    harness.detectChanges();
    expect(retryButton(root)).toBeDefined();
  });

  function expectAsksForComplement(root: HTMLElement) {
    expect(root.textContent).toContain('Selecciona el complemento');
    expect(root.querySelector('select[name="extension"]')).not.toBeNull();
    expect(root.querySelector('input[name="firstName"]')).toBeNull();
  }

  it('pide el complemento cuando el alta de dirigente indica que el Carnet de Identidad existe con otro complemento', async () => {
    const { harness, root } = await createLeader(
      { type: 'urn:dsc:secretariat:extension-required' },
      409,
    );
    expectAsksForComplement(root);
    expect(root.textContent).not.toContain('Inscripción confirmada');
    expect(harness.routeNativeElement).toBe(root);
  });

  it('pide el complemento cuando confirmar una persona existente es ambiguo', async () => {
    const { harness, root } = await openPanel();
    search(root).flush({ personId: 8, condition: 'LEADER', isEnrolled: false, firstName: 'Persona', lastName: 'Ficticia', ciNumber: '5556667' });
    harness.detectChanges();
    root.querySelector<HTMLButtonElement>('[aria-live="polite"] > div.space-y-1 button[type="button"]')!.click();
    http.expectOne('/api/v1/secretariat/participants/8/sessions/42/enrollments').flush(
      { type: 'urn:dsc:secretariat:extension-required' },
      { status: 409, statusText: 'Conflict' },
    );
    harness.detectChanges();
    expectAsksForComplement(root);
    expect(root.textContent).not.toContain('Persona Ficticia');
  });

  it('rechaza el alta si el correo ya pertenece a otra cuenta', async () => {
    const { root } = await createLeader({ type: 'urn:dsc:secretariat:email-in-use' }, 409);
    expect(root.textContent).toContain('correo ya pertenece a otra cuenta');
    expect(root.textContent).not.toContain('Inscripción confirmada');
  });

  it('invalida el alta ante conflicto de identidad', async () => {
    const { harness, root } = await openPanel();
    search(root).flush({ type: 'urn:dsc:secretariat:participant-not-found' }, { status: 404, statusText: 'Not Found' });
    harness.detectChanges();
    root.querySelectorAll<HTMLButtonElement>('[aria-label="Tipo de registro"] button')[1]!.click();
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
      harness.routeNativeElement!.querySelector('a[href="/secretaria/inscripciones"]'),
    ).toBeNull();
    http.expectNone('/api/v1/secretariat/invitations/pending');
    for (const req of http.match('/api/v1/calendar/sessions')) {
      req.flush([]);
    }
  });
});
