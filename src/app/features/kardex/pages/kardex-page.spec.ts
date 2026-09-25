import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, ReplaySubject, of } from 'rxjs';

import {
  LEADER_DIRECTORY_DATA_SOURCE,
  type LeaderDirectoryDataSource,
} from '../data-access/leader-directory.data-source';
import { MockLeaderDirectoryDataSource } from '../data-access/mock-leader-directory.data-source';
import type {
  LeaderDetail,
  LeaderDirectoryQuery,
  LeaderFilterOptions,
  LeaderSummary,
} from '../models/kardex.models';
import { KardexPage } from './kardex-page';

describe('KardexPage', () => {
  let fixture: ComponentFixture<KardexPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KardexPage],
      providers: [
        provideRouter([]),
        {
          provide: LEADER_DIRECTORY_DATA_SOURCE,
          useClass: MockLeaderDirectoryDataSource,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(KardexPage);
    fixture.detectChanges();
  });

  it('renders the directory cards from the active data source', () => {
    expect(fixture.nativeElement.querySelectorAll('article')).toHaveLength(3);
  });

  it('filters leaders by name without placing a CI in query strings', () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'Ana';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('article')).toHaveLength(1);
    expect(fixture.nativeElement.textContent).toContain('Ana Silva');
  });

  it('combines branch and training filters', () => {
    const selects = fixture.nativeElement.querySelectorAll(
      'select',
    ) as NodeListOf<HTMLSelectElement>;
    const branchSelect = selects.item(1);
    const trainingSelect = selects.item(2);
    if (!branchSelect || !trainingSelect) {
      throw new Error('Expected branch and training selectors to be rendered');
    }

    branchSelect.value = 'Tropa';
    branchSelect.dispatchEvent(new Event('change'));
    trainingSelect.value = 'IM I-II';
    trainingSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('article')).toHaveLength(1);
    expect(fixture.nativeElement.textContent).toContain('Carlos Mendoza');
  });

  it('links each card by opaque ID without exposing its CI in the URL', () => {
    const link = fixture.nativeElement.querySelector('article a') as HTMLAnchorElement;

    expect(link.getAttribute('href')).toBe('/kardex/leader-carlos-mendoza');
    expect(link.getAttribute('href')).not.toContain('4.567.890-1');
  });
});

class ControllableDirectoryDataSource implements LeaderDirectoryDataSource {
  readonly queries: LeaderDirectoryQuery[] = [];
  readonly requests: ReplaySubject<readonly LeaderSummary[]>[] = [];
  readonly filterRequests: ReplaySubject<LeaderFilterOptions>[] = [];

  listLeaders(query: LeaderDirectoryQuery = {}): Observable<readonly LeaderSummary[]> {
    this.queries.push(query);
    const request = new ReplaySubject<readonly LeaderSummary[]>(1);
    this.requests.push(request);
    return request;
  }

  getLeaderById(_: string): Observable<LeaderDetail | null> {
    return of(null);
  }

  getFilterOptions(): Observable<LeaderFilterOptions> {
    const request = new ReplaySubject<LeaderFilterOptions>(1);
    this.filterRequests.push(request);
    return request;
  }
}

describe('KardexPage asynchronous states', () => {
  let fixture: ComponentFixture<KardexPage>;
  let source: ControllableDirectoryDataSource;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KardexPage],
      providers: [
        provideRouter([]),
        ControllableDirectoryDataSource,
        { provide: LEADER_DIRECTORY_DATA_SOURCE, useExisting: ControllableDirectoryDataSource },
      ],
    }).compileComponents();

    source = TestBed.inject(ControllableDirectoryDataSource);
    fixture = TestBed.createComponent(KardexPage);
    fixture.detectChanges();
  });

  it('distinguishes loading from an empty result', () => {
    expect(fixture.nativeElement.textContent).toContain('Cargando dirigentes');
    expect(fixture.nativeElement.textContent).not.toContain('No encontramos dirigentes');

    source.requests[0]?.next([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No encontramos dirigentes');
  });

  it('sends the selected filters to the data source', () => {
    source.requests[0]?.next([]);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = ' Ana ';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(source.queries.at(-1)).toMatchObject({ search: 'Ana' });
  });

  it('renders a generic error and retries without exposing backend details', () => {
    source.requests[0]?.error(new Error('private backend detail'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No pudimos cargar el directorio');
    expect(fixture.nativeElement.textContent).not.toContain('private backend detail');
    const retry = fixture.nativeElement.querySelector(
      '[data-testid="retry-directory"]',
    ) as HTMLButtonElement;
    retry.click();
    fixture.detectChanges();

    expect(source.requests).toHaveLength(2);
  });

  it('reports a filter catalog failure and retries it with the directory', () => {
    source.filterRequests[0]?.error(new Error('private filter payload'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No pudimos cargar los filtros');
    expect(fixture.nativeElement.textContent).not.toContain('private filter payload');
    const retry = fixture.nativeElement.querySelector(
      '[data-testid="retry-filters"]',
    ) as HTMLButtonElement;
    retry.click();
    fixture.detectChanges();

    expect(source.filterRequests).toHaveLength(2);
    expect(source.requests).toHaveLength(2);
  });
});
