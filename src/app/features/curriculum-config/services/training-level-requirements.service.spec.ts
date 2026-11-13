import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TrainingLevelRequirementsService } from './training-level-requirements.service';

describe('TrainingLevelRequirementsService', () => {
  let service: TrainingLevelRequirementsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TrainingLevelRequirementsService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TrainingLevelRequirementsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('debe sanitizar y codificar el código de nivel en las rutas HTTP de consulta y guardado', () => {
    service.getRequirements(' IM / 01 ').subscribe();
    const getReq = http.expectOne('/api/v1/training-levels/IM%20%2F%2001/requirements');
    expect(getReq.request.method).toBe('GET');
    getReq.flush({});

    const payload = { totalModulesCount: 1, minMandatoryModulesCount: 1, mandatoryModuleIds: [1] };
    service.saveRequirements(' IM / 01 ', payload).subscribe();
    const putReq = http.expectOne('/api/v1/admin/training-levels/IM%20%2F%2001/requirements');
    expect(putReq.request.method).toBe('PUT');
    expect(putReq.request.body).toEqual(payload);
    putReq.flush({});
  });
});
