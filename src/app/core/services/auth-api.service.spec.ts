import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthApiService } from './auth-api.service';

describe('AuthApiService', () => {
  let service: AuthApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('POST /api/v1/auth/login', () => {
    let token = '';
    service.login({ identifier: 'pablo.rocha', password: 'x' }).subscribe((dto) => {
      token = dto.token;
    });

    const req = http.expectOne('/api/v1/auth/login');
    expect(req.request.body).toEqual({ identifier: 'pablo.rocha', password: 'x' });
    req.flush({
      token: 'jwt',
      tokenType: 'Bearer',
      expiresAt: '2099-01-01T00:00:00.000Z',
      user: {
        id: 1,
        personId: 1,
        username: 'pablo.rocha',
        email: 'pablo.rocha@example.test',
        roles: ['ADMIN'],
      },
    });
    expect(token).toBe('jwt');
  });

  it('GET /api/v1/auth/me', () => {
    let username = '';
    service.getCurrentUser().subscribe((dto) => {
      username = dto.username;
    });

    http.expectOne('/api/v1/auth/me').flush({
      id: 2,
      personId: 2,
      username: 'scout',
      email: 'scout@dsc.org',
      roles: ['BRANCH_COMMISSIONER'],
    });
    expect(username).toBe('scout');
  });
});
