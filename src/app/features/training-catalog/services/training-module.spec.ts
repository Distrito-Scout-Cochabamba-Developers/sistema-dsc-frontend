import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TrainingModuleService } from './training-module';

describe('TrainingModuleService', () => {
  let http: HttpTestingController;
  let service: TrainingModuleService;

  const sample = {
    id: 1,
    name: 'Módulo de Liderazgo y Servicio',
    description: 'Taller',
    trainingLines: [{ id: 1, code: 'AE', name: 'Adultos en el Escultismo', description: null }],
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
      expect(items[0]?.name).toBe('Módulo de Liderazgo y Servicio');
    });

    const req = http.expectOne('/api/v1/admin/modules');
    expect(req.request.method).toBe('GET');
    req.flush([sample]);
  });

  it('POST /api/v1/admin/modules', () => {
    const body = {
      name: 'Nuevo',
      description: '',
      trainingLineCodes: ['AE'],
    };
    service.create(body).subscribe((dto) => {
      expect(dto.name).toBe('Nuevo');
    });

    const req = http.expectOne('/api/v1/admin/modules');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ ...sample, name: 'Nuevo' });
  });

  it('PUT /api/v1/admin/modules/{id}', () => {
    const body = {
      name: 'Actualizado',
      description: 'x',
      trainingLineCodes: ['PJ'],
    };
    service.update(1, body).subscribe((dto) => {
      expect(dto.name).toBe('Actualizado');
    });

    const req = http.expectOne('/api/v1/admin/modules/1');
    expect(req.request.method).toBe('PUT');
    req.flush({ ...sample, name: 'Actualizado' });
  });

  it('POST /api/v1/admin/modules/{id}/sessions', () => {
    const body = {
      statusCode: 'OPEN',
      isRegistrationOpen: true,
      schedules: [
        {
          sessionDate: '2026-12-01',
          startTime: '08:30:00',
          endTime: '12:30:00',
          partNumber: 1,
        },
      ],
    };
    service.createSession(1, body).subscribe();
    const req = http.expectOne('/api/v1/admin/modules/1/sessions');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ id: 10 });
  });
});
