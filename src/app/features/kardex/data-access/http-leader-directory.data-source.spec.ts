import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { HttpLeaderDirectoryDataSource } from './http-leader-directory.data-source';

const SUMMARY_DTO = {
  id: 'leader-ana-silva',
  fullName: 'Ana Silva',
  ci: '3.210.987-6',
  role: 'Responsable de Grupo',
  scoutGroup: 'Alemán',
  branch: 'Comunidad',
  trainingLevel: 'IM III',
  avatarUrl: null,
};

const DETAIL_DTO = {
  ...SUMMARY_DTO,
  email: 'ana@example.org',
  phone: '71234567',
  district: 'La Paz',
  joinedAt: '2018-02-10',
  trainingModules: [
    {
      id: 'wood-badge',
      name: 'Insignia de Madera III',
      description: 'Profundización en liderazgo.',
      status: 'completed',
      completedAt: '2025-02-14',
    },
  ],
};

describe('HttpLeaderDirectoryDataSource', () => {
  let source: HttpLeaderDirectoryDataSource;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), HttpLeaderDirectoryDataSource],
    });

    source = TestBed.inject(HttpLeaderDirectoryDataSource);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends only defined camelCase filters and maps the list response', async () => {
    const resultPromise = firstValueFrom(
      source.listLeaders({
        search: ' Ana ',
        scoutGroup: ' Alemán ',
        branch: ' Comunidad ',
        trainingLevel: 'IM III',
      }),
    );
    const request = http.expectOne((candidate) => candidate.url === '/api/kardex/dirigentes');

    expect(request.request.method).toBe('GET');
    expect(request.request.params.keys().sort()).toEqual([
      'branch',
      'scoutGroup',
      'search',
      'trainingLevel',
    ]);
    expect(request.request.params.get('search')).toBe('Ana');
    expect(request.request.params.get('scoutGroup')).toBe('Alemán');
    expect(request.request.params.get('branch')).toBe('Comunidad');
    expect(request.request.params.get('trainingLevel')).toBe('IM III');
    request.flush([SUMMARY_DTO]);

    const result = await resultPromise;
    expect(result[0]?.initials).toBe('AS');
  });

  it('never serializes a CI-like search value into a GET URL', () => {
    expect(() => source.listLeaders({ search: '3.210.987-6' })).toThrow();
    http.expectNone(() => true);
  });

  it('encodes the leader ID as one path segment', async () => {
    const resultPromise = firstValueFrom(source.getLeaderById('leader:42'));
    const request = http.expectOne('/api/kardex/dirigentes/leader%3A42');

    expect(request.request.method).toBe('GET');
    request.flush({ ...DETAIL_DTO, id: 'leader:42' });

    await expect(resultPromise).resolves.toMatchObject({ id: 'leader:42' });
  });

  it.each(['.', '..', 'leader/unsafe'])(
    'rejects unsafe path segment %s before HTTP',
    async (id) => {
      await expect(firstValueFrom(source.getLeaderById(id))).rejects.toThrow();
      http.expectNone(() => true);
    },
  );

  it('rejects a detail response that belongs to another leader', async () => {
    const resultPromise = firstValueFrom(source.getLeaderById('leader-requested'));
    const request = http.expectOne('/api/kardex/dirigentes/leader-requested');
    request.flush(DETAIL_DTO);

    await expect(resultPromise).rejects.toThrow();
  });

  it('maps only a 404 detail response to absence', async () => {
    const resultPromise = firstValueFrom(source.getLeaderById('missing'));
    const request = http.expectOne('/api/kardex/dirigentes/missing');
    request.flush({ message: 'not found' }, { status: 404, statusText: 'Not Found' });

    await expect(resultPromise).resolves.toBeNull();
  });

  it('keeps server failures as errors for the page state', async () => {
    const resultPromise = firstValueFrom(source.getLeaderById('failure'));
    const request = http.expectOne('/api/kardex/dirigentes/failure');
    request.flush({ traceId: 'private-value' }, { status: 500, statusText: 'Error' });

    await expect(resultPromise).rejects.toMatchObject({ status: 500 });
  });

  it('loads and maps the filter catalog from the relative API', async () => {
    const resultPromise = firstValueFrom(source.getFilterOptions());
    const request = http.expectOne('/api/kardex/dirigentes/filtros');
    request.flush({
      scoutGroups: ['Alemán'],
      branches: ['Comunidad'],
      trainingLevels: ['IM III'],
    });

    await expect(resultPromise).resolves.toEqual({
      scoutGroups: ['Alemán'],
      branches: ['Comunidad'],
      trainingLevels: ['IM III'],
    });
  });
});
