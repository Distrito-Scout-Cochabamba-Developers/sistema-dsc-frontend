import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthSessionService } from '@core/services/auth-session.service';

import { ModuleCatalog } from './module-catalog';

describe('ModuleCatalog', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModuleCatalog],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('lista módulos y enlaza al formulario de asistencia', () => {
    const fixture = TestBed.createComponent(ModuleCatalog);
    fixture.detectChanges();

    const req = http.expectOne('/api/attendance/modules');
    req.flush([
      {
        id: 1,
        code: 'mod-liderazgo-20241024',
        name: 'Módulo de Liderazgo y Servicio',
        description: 'Taller de liderazgo',
        moduleTypeCode: 'AE',
        moduleTypeName: 'Adultos en el Escultismo',
      },
    ]);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Módulo de Liderazgo y Servicio');
    expect(text).not.toContain('Carnet de Identidad');
    expect(text).not.toContain('Registrar Asistencia');
    expect(text).toContain('Registrar asistencia');

    const link = fixture.nativeElement.querySelector(
      'a[href="/asistencia/mod-liderazgo-20241024"]',
    ) as HTMLAnchorElement | null;
    expect(link).toBeTruthy();
    expect(text).not.toContain('Administrar módulos');
  });

  it('muestra Administrar módulos si el usuario es ADMIN', () => {
    TestBed.inject(AuthSessionService).applyAuthenticatedProfile({
      id: 2,
      personId: 2,
      username: 'pablo.rocha',
      email: 'pablo.rocha@example.test',
      roles: ['ADMIN', 'DISTRICT_DIRECTOR'],
      displayName: 'pablo.rocha',
    });

    const fixture = TestBed.createComponent(ModuleCatalog);
    fixture.detectChanges();
    http.expectOne('/api/attendance/modules').flush([]);
    fixture.detectChanges();

    const adminLink = fixture.nativeElement.querySelector(
      'a[href="/admin/modulos"]',
    ) as HTMLAnchorElement | null;
    expect(adminLink?.textContent).toContain('Administrar módulos');
  });
});
