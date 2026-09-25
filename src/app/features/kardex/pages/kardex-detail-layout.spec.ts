import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of } from 'rxjs';

import {
  LEADER_DIRECTORY_DATA_SOURCE,
  type LeaderDirectoryDataSource,
} from '../data-access/leader-directory.data-source';
import type {
  LeaderDetail,
  LeaderDirectoryQuery,
  LeaderFilterOptions,
  LeaderSummary,
} from '../models/kardex.models';
import { KardexDetailPage } from './kardex-detail-page';

const DETAIL: LeaderDetail = {
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
  email: null,
  phone: null,
  district: 'La Paz',
  joinedAt: '2019-03-16',
  trainingModules: [],
};

class LayoutLeaderDirectoryDataSource implements LeaderDirectoryDataSource {
  listLeaders(_: LeaderDirectoryQuery = {}): Observable<readonly LeaderSummary[]> {
    return of([]);
  }

  getLeaderById(_: string): Observable<LeaderDetail | null> {
    return of(DETAIL);
  }

  getFilterOptions(): Observable<LeaderFilterOptions> {
    return of({ scoutGroups: [], branches: [], trainingLevels: [] });
  }
}

describe('KardexDetailPage layout', () => {
  it('stacks the profile card before the training modules panel', async () => {
    await TestBed.configureTestingModule({
      imports: [KardexDetailPage],
      providers: [
        provideRouter([]),
        {
          provide: LEADER_DIRECTORY_DATA_SOURCE,
          useClass: LayoutLeaderDirectoryDataSource,
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(KardexDetailPage);
    fixture.componentRef.setInput('leaderId', 'leader-carlos-mendoza');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const profile = fixture.nativeElement.querySelector('[data-testid="profile-card"]');
    const modules = fixture.nativeElement.querySelector('[data-testid="training-modules-panel"]');

    expect(profile).toBeTruthy();
    expect(modules).toBeTruthy();
    expect(
      profile.compareDocumentPosition(modules) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
