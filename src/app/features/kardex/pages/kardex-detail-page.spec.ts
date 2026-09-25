import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, ReplaySubject, of } from 'rxjs';

import type {
  LeaderDetail,
  LeaderDirectoryQuery,
  LeaderFilterOptions,
  LeaderSummary,
} from '../models/kardex.models';
import {
  LEADER_DIRECTORY_DATA_SOURCE,
  type LeaderDirectoryDataSource,
} from '../data-access/leader-directory.data-source';
import { KardexDetailPage } from './kardex-detail-page';

const LEADER: LeaderDetail = {
  id: 'leader-carlos-mendoza',
  fullName: 'Carlos Mendoza',
  ci: '4.567.890-1',
  role: 'Responsable de Tropa',
  scoutGroup: 'Panda',
  branch: 'Tropa',
  trainingLevel: 'IM I-II',
  accent: 'blue',
  initials: 'CM',
  avatarUrl: null,
  email: 'carlos@example.org',
  phone: '70000000',
  district: 'La Paz',
  joinedAt: '2019-03-16',
  trainingModules: [
    {
      id: 'wood-badge',
      name: 'Insignia de Madera I-II',
      description: 'Formación base.',
      status: 'completed',
      statusLabel: 'Completado',
      completedAt: '2025-03-10',
    },
    {
      id: 'leadership',
      name: 'Liderazgo y Servicio',
      description: 'Acompañamiento de equipos.',
      status: 'enrolled',
      statusLabel: 'Inscrito',
      completedAt: null,
    },
    {
      id: 'safety',
      name: 'Seguridad en Actividades',
      description: 'Prevención de riesgos.',
      status: 'pending',
      statusLabel: 'Pendiente',
      completedAt: null,
    },
  ],
};

class ControllableLeaderDirectoryDataSource implements LeaderDirectoryDataSource {
  private readonly requests = new Map<string, ReplaySubject<LeaderDetail | null>[]>();

  listLeaders(_: LeaderDirectoryQuery = {}): Observable<readonly LeaderSummary[]> {
    return of([]);
  }

  getFilterOptions(): Observable<LeaderFilterOptions> {
    return of({ scoutGroups: [], branches: [], trainingLevels: [] });
  }

  getLeaderById(leaderId: string): Observable<LeaderDetail | null> {
    const request = new ReplaySubject<LeaderDetail | null>(1);
    const requests = this.requests.get(leaderId) ?? [];
    requests.push(request);
    this.requests.set(leaderId, requests);
    return request.asObservable();
  }

  request(leaderId: string, index = 0): ReplaySubject<LeaderDetail | null> {
    const request = this.requests.get(leaderId)?.[index];
    if (!request) {
      throw new Error(`No request ${index} for ${leaderId}`);
    }
    return request;
  }
}

describe('KardexDetailPage', () => {
  let fixture: ComponentFixture<KardexDetailPage>;
  let source: ControllableLeaderDirectoryDataSource;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KardexDetailPage],
      providers: [
        provideRouter([]),
        ControllableLeaderDirectoryDataSource,
        {
          provide: LEADER_DIRECTORY_DATA_SOURCE,
          useExisting: ControllableLeaderDirectoryDataSource,
        },
      ],
    }).compileComponents();

    source = TestBed.inject(ControllableLeaderDirectoryDataSource);
    fixture = TestBed.createComponent(KardexDetailPage);
    fixture.componentRef.setInput('leaderId', 'leader-carlos-mendoza');
    fixture.detectChanges();
  });

  it('shows a loading state without stale profile data', () => {
    expect(fixture.nativeElement.textContent).toContain('Cargando ficha');
    expect(fixture.nativeElement.textContent).not.toContain('Carlos Mendoza');
  });

  it('renders the profile and all supported training statuses', () => {
    source.request('leader-carlos-mendoza').next(LEADER);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Carlos Mendoza');
    expect(text).toContain('Completado');
    expect(text).toContain('Inscrito');
    expect(text).toContain('Pendiente');
  });

  it('renders a safe not-found state without profile data', () => {
    source.request('leader-carlos-mendoza').next(null);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Ficha no encontrada');
    expect(text).not.toContain('Carlos Mendoza');
  });

  it('clears the previous profile and shows a generic error for a later failed ID', () => {
    source.request('leader-carlos-mendoza').next(LEADER);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Carlos Mendoza');

    fixture.componentRef.setInput('leaderId', 'failure');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Cargando ficha');
    expect(fixture.nativeElement.textContent).not.toContain('Carlos Mendoza');

    source.request('failure').error(new Error('private backend detail'));
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('No pudimos cargar la ficha');
    expect(text).not.toContain('private backend detail');
    expect(text).not.toContain('Carlos Mendoza');
  });

  it('retries a failed request and renders the recovered profile', () => {
    source.request('leader-carlos-mendoza').error(new Error('network'));
    fixture.detectChanges();

    const retry = fixture.nativeElement.querySelector(
      '[data-testid="retry-detail"]',
    ) as HTMLButtonElement;
    retry.click();
    fixture.detectChanges();
    source.request('leader-carlos-mendoza', 1).next(LEADER);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Carlos Mendoza');
  });

  it('treats a source that completes without a value as not found', () => {
    source.request('leader-carlos-mendoza').complete();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Ficha no encontrada');
  });
});
