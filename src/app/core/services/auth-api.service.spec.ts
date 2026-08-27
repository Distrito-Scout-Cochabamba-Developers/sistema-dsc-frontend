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

  it('POST /api/auth/login/email', () => {
    let email = '';
    service.loginWithEmail({ email: 'a@b.c', password: 'x' }).subscribe((dto) => {
      email = dto.email;
    });

    const req = http.expectOne('/api/auth/login/email');
    expect(req.request.body).toEqual({ email: 'a@b.c', password: 'x' });
    req.flush({ id: 1, username: 'a', email: 'a@b.c', roles: [] });
    expect(email).toBe('a@b.c');
  });

  it('GET /api/auth/me', () => {
    let username = '';
    service.getCurrentUser().subscribe((dto) => {
      username = dto.username;
    });

    http.expectOne('/api/auth/me').flush({
      id: 2,
      username: 'scout',
      email: 'scout@dsc.org',
      roles: ['leader'],
    });
    expect(username).toBe('scout');
  });
});
