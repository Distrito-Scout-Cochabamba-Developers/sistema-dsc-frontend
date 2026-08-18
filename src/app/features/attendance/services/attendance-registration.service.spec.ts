import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AttendanceRegistrationService } from './attendance-registration.service';

describe('AttendanceRegistrationService', () => {
  let service: AttendanceRegistrationService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AttendanceRegistrationService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('envía firstName/lastName partidos al POST', () => {
    let result: unknown;
    service
      .register({
        sessionId: 'TOKEN-123',
        ci: '7654321',
        fullName: 'Juan Pérez',
        extension: 'CB',
        phone: '77712345',
      })
      .subscribe((value) => {
        result = value;
      });

    const req = http.expectOne('/api/attendance/register');
    expect(req.request.body).toEqual({
      sessionToken: 'TOKEN-123',
      ciNumber: '7654321',
      extension: 'CB',
      firstName: 'Juan',
      lastName: 'Pérez',
      phone: '77712345',
    });
    req.flush({
      attendanceId: 'a',
      trainingModuleId: 1,
      moduleTitle: 'Módulo',
      scoutLeaderId: 2,
      scoutLeaderFullName: 'Juan Pérez',
      ciNumber: '7654321-CB',
      registeredAt: '2026-08-18T17:00:00.000Z',
      isPartialRegistration: true,
    });

    expect(result).toMatchObject({
      participantName: 'Juan Pérez',
      estado: 'parcial',
    });
  });
});
