import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthSessionService } from '@core/services/auth-session.service';

import { Landing } from './landing';

describe('Landing', () => {
  let fixture: ComponentFixture<Landing>;
  let http: HttpTestingController;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Landing],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('muestra la portada con próximos módulos e invitación al calendario sin chip, sin logo repetido ni líneas de formación', () => {
    fixture = TestBed.createComponent(Landing);
    fixture.detectChanges();
    http.expectOne('/api/v1/calendar/sessions').flush([
      {
        id: 1,
        moduleName: 'Actividades de desarrollo de la comunidad local',
        startsAt: '2099-11-26T08:30:00-04:00',
        location: 'Casa Scout',
        status: 'OPEN',
      },
    ]);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('h1')?.textContent?.trim()).toBe('Sistema DSC');
    expect(root.textContent).not.toContain('SISTEMA DSC');
    expect(root.textContent).not.toContain('Programa de Jóvenes');
    expect(root.querySelector('img[src="/assets/branding/logo-dsc.png"]')).toBeNull();
    expect(root.textContent).toContain('Actividades de desarrollo de la comunidad local');
    expect(root.textContent).toContain('¿Buscas la próxima fecha de formación?');
    expect(root.querySelector('a[href="/modulos"]')).toBeNull();
    expect(root.querySelector('a[href="/calendario"]')).not.toBeNull();
    expect(root.querySelector('a[href="/auth/login"]')).not.toBeNull();
  });

  it('muestra accesos directos según el rol autenticado', () => {
    TestBed.inject(AuthSessionService).applyAuthenticatedProfile({
      id: 1,
      personId: 1,
      username: 'secretaria',
      email: 'secretaria@example.test',
      roles: ['DISTRICT_SECRETARY'],
      displayName: 'Secretaría Distrital',
    });

    fixture = TestBed.createComponent(Landing);
    fixture.detectChanges();
    http.expectOne('/api/v1/calendar/sessions').flush([]);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('Secretaría Distrital');
    expect(root.querySelector('a[href="/secretaria/inscripciones"]')).not.toBeNull();
    expect(root.querySelector('a[href="/admin/modulos"]')).not.toBeNull();
    expect(root.querySelector('a[href="/admin/requisitos-formacion"]')).not.toBeNull();
  });
});
