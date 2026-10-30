import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TrainingModuleService } from './training-module';

describe('TrainingModuleService', () => {
  let http: HttpTestingController;
  let service: TrainingModuleService;

  const sample = {
    id: 1,
    code: 'mod-liderazgo-20241024',
    name: 'Módulo de Liderazgo y Servicio',
    description: 'Taller',
    moduleTypeCode: 'AE',
    moduleTypeName: 'Adultos en el Escultismo',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(TrainingModuleService);
  });

  afterEach(() => {
    http.verify();
  });

  it('GET /api/v1/admin/modules', () => {
    service.list().subscribe((items) => {
      expect(items[0]?.code).toBe('mod-liderazgo-20241024');
    });

    const req = http.expectOne('/api/v1/admin/modules');
    expect(req.request.method).toBe('GET');
    req.flush([sample]);
  });

  it('POST /api/v1/admin/modules', () => {
    const body = {
      code: 'mod-nuevo',
      name: 'Nuevo',
      description: '',
      moduleTypeCode: 'AE',
    };
    service.create(body).subscribe((dto) => {
      expect(dto.code).toBe('mod-nuevo');
    });

    const req = http.expectOne('/api/v1/admin/modules');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ ...sample, code: 'mod-nuevo', name: 'Nuevo' });
  });

  it('PUT /api/v1/admin/modules/{code}', () => {
    const body = {
      code: 'mod-liderazgo-20241024',
      name: 'Actualizado',
      description: 'x',
      moduleTypeCode: 'PJ',
    };
    service.update('mod-liderazgo-20241024', body).subscribe((dto) => {
      expect(dto.name).toBe('Actualizado');
    });

    const req = http.expectOne('/api/v1/admin/modules/mod-liderazgo-20241024');
    expect(req.request.method).toBe('PUT');
    req.flush({ ...sample, name: 'Actualizado', moduleTypeCode: 'PJ' });
  });
});
