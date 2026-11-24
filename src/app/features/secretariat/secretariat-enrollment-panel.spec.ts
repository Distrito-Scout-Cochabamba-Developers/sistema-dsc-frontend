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
