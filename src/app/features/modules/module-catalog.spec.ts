import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

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
  });
});
