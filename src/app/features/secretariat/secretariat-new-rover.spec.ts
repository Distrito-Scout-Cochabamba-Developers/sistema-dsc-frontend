import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from '../../app.routes';
import { AuthSessionService } from '@core/services/auth-session.service';

const lookupPath = '/api/v1/secretariat/participants/lookup';
const createPath = '/api/v1/secretariat/sessions/42/rover-enrollments';

describe('Alta de Rover nuevo desde Secretaría (#160)', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  /** Abre el panel y deja una búsqueda sin coincidencias del Carnet de Identidad ficticio 5556667. */
  async function openWithNoMatch() {
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
      .flush([{ id: 42, moduleName: 'Programación ficticia', startsAt: '2026-11-29T10:00:00-04:00' }]);
    http.expectOne({ method: 'GET', url: '/api/v1/secretariat/invitations/pending' }).flush([]);
    harness.detectChanges();
    root.querySelector<HTMLButtonElement>('[aria-label="Módulos programados"] button')!.click();
    harness.detectChanges();
    const ci = root.querySelector<HTMLInputElement>('input[name="ci"]')!;
    ci.value = '5556667';
    ci.dispatchEvent(new Event('input'));
    ci.closest('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    http
      .expectOne({ method: 'POST', url: lookupPath })
      .flush({ type: 'urn:dsc:secretariat:participant-not-found' }, { status: 404, statusText: 'Not Found' });
    harness.detectChanges();
    root.querySelector<HTMLButtonElement>('[aria-label="Tipo de registro"] button')!.click();
    harness.detectChanges();
    return { harness, root };
  }

  function type(root: HTMLElement, name: string, value: string) {
    const input = root.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  function submitRover(root: HTMLElement) {
    root.querySelector('form[name="new-rover"]')!.dispatchEvent(new Event('submit', { cancelable: true }));
  }

  it('ofrece el alta solo después de una búsqueda sin coincidencias', async () => {
    const { root } = await openWithNoMatch();
    expect(root.querySelector('form[name="new-rover"]')).not.toBeNull();
    expect(root.querySelector<HTMLInputElement>('input[name="firstName"]')!.labels?.[0]?.textContent).toContain('Nombres');
    expect(root.querySelector<HTMLInputElement>('input[name="phone"]')!.required).toBe(false);
  });

  it('crea el Rover con celular opcional y confirma sin pedir cuenta', async () => {
    const { harness, root } = await openWithNoMatch();
    type(root, 'firstName', ' Rover ');
    type(root, 'lastName', 'Ficticio');
    submitRover(root);
    const request = http.expectOne({ method: 'POST', url: createPath });
    expect(request.request.body).toEqual({ ci: '5556667', firstName: 'Rover', lastName: 'Ficticio' });
    request.flush({ enrollmentId: 7 }, { status: 201, statusText: 'Created' });
    harness.detectChanges();
    expect(root.textContent).toContain('Rover inscrito');
    expect(root.querySelector('form[name="new-rover"]')).toBeNull();
  });

  it('envía el celular cuando se informa', async () => {
    const { harness, root } = await openWithNoMatch();
    type(root, 'firstName', 'Rover');
    type(root, 'lastName', 'Ficticio');
    type(root, 'phone', '70000001');
    harness.detectChanges();
    submitRover(root);
    const request = http.expectOne({ method: 'POST', url: createPath });
    expect(request.request.body).toEqual({ ci: '5556667', firstName: 'Rover', lastName: 'Ficticio', phone: '70000001' });
    request.flush({ enrollmentId: 7 }, { status: 201, statusText: 'Created' });
  });

  it('no envía nada si faltan nombres o apellidos', async () => {
    const { harness, root } = await openWithNoMatch();
    type(root, 'firstName', 'Rover');
    submitRover(root);
    harness.detectChanges();
    http.expectNone(createPath);
    expect(root.textContent).toContain('nombres y apellidos');
  });

  it('bloquea el reenvío mientras la solicitud está en curso', async () => {
    const { harness, root } = await openWithNoMatch();
    type(root, 'firstName', 'Rover');
    type(root, 'lastName', 'Ficticio');
    submitRover(root);
    submitRover(root);
    const request = http.expectOne({ method: 'POST', url: createPath });
    harness.detectChanges();
    expect(root.querySelector<HTMLButtonElement>('form[name="new-rover"] button')!.disabled).toBe(true);
    request.flush({ enrollmentId: 7 }, { status: 201, statusText: 'Created' });
  });

  it('pide el complemento cuando el Carnet de Identidad del Rover existe con otro complemento', async () => {
    const { harness, root } = await openWithNoMatch();
    type(root, 'firstName', 'Rover');
    type(root, 'lastName', 'Ficticio');
    submitRover(root);
    http
      .expectOne({ method: 'POST', url: createPath })
      .flush({ type: 'urn:dsc:secretariat:extension-required' }, { status: 409, statusText: 'Conflict' });
    harness.detectChanges();
    expect(root.textContent).toContain('Selecciona el complemento');
    expect(root.querySelector('select[name="extension"]')).not.toBeNull();
    expect(root.querySelector('form[name="new-rover"]')).toBeNull();
  });

  it.each([
    ['session-full', 'Sin cupo'],
    ['enrollment-closed', 'inscripción está cerrada'],
    ['already-enrolled', 'ya está inscrita'],
  ])('explica el conflicto %s sin exponer el detalle del servidor', async (type_, message) => {
    const { harness, root } = await openWithNoMatch();
    type(root, 'firstName', 'Rover');
    type(root, 'lastName', 'Ficticio');
    submitRover(root);
    http
      .expectOne({ method: 'POST', url: createPath })
      .flush({ type: `urn:dsc:enrollment:${type_}`, detail: 'dato privado' }, { status: 409, statusText: 'Conflict' });
    harness.detectChanges();
    expect(root.textContent).toContain(message);
    expect(root.textContent).not.toContain('dato privado');
  });

  it('pide buscar de nuevo si el Carnet de Identidad ya existe y no ofrece crear otra persona', async () => {
    const { harness, root } = await openWithNoMatch();
    type(root, 'firstName', 'Rover');
    type(root, 'lastName', 'Ficticio');
    submitRover(root);
    http
      .expectOne({ method: 'POST', url: createPath })
      .flush({ type: 'urn:dsc:enrollment:person-exists' }, { status: 409, statusText: 'Conflict' });
    harness.detectChanges();
    expect(root.textContent).toContain('Ya existe una persona con ese Carnet de Identidad');
    expect(root.querySelector('form[name="new-rover"]')).toBeNull();
  });

  it('trata un error de red como incierto y no reintenta', async () => {
    const { harness, root } = await openWithNoMatch();
    type(root, 'firstName', 'Rover');
    type(root, 'lastName', 'Ficticio');
    submitRover(root);
    http.expectOne({ method: 'POST', url: createPath }).error(new ProgressEvent('error'));
    harness.detectChanges();
    expect(root.textContent).toContain('Verifica la inscripción antes de reintentar');
    expect(root.querySelector('form[name="new-rover"]')).toBeNull();
    http.expectNone(createPath);
  });

  it.each([401, 403])('limpia datos personales ante HTTP %s', async (status) => {
    const { harness, root } = await openWithNoMatch();
    type(root, 'firstName', 'Rover');
    type(root, 'lastName', 'Ficticio');
    submitRover(root);
    http.expectOne({ method: 'POST', url: createPath }).flush({}, { status, statusText: 'Error' });
    harness.detectChanges();
    expect(root.querySelector('form[name="new-rover"]')).toBeNull();
    expect(root.querySelector<HTMLInputElement>('input[name="ci"]')!.value).toBe('');
  });

  it('descarta el formulario si se edita el Carnet de Identidad', async () => {
    const { harness, root } = await openWithNoMatch();
    type(root, 'ci', '5556668');
    harness.detectChanges();
    expect(root.querySelector('form[name="new-rover"]')).toBeNull();
  });
});
