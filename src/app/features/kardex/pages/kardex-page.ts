import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, defer, map, of, startWith, switchMap } from 'rxjs';

import { LEADER_DIRECTORY_DATA_SOURCE } from '../data-access/leader-directory.data-source';
import type {
  LeaderAccent,
  LeaderDirectoryQuery,
  LeaderFilterOptions,
  LeaderSummary,
  LeaderTrainingLevel,
} from '../models/kardex.models';

const EMPTY_FILTER_OPTIONS: LeaderFilterOptions = {
  scoutGroups: [],
  branches: [],
  trainingLevels: [],
};

type DirectoryState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly leaders: readonly LeaderSummary[] }
  | { readonly kind: 'error' };

const DIRECTORY_LOADING_STATE: DirectoryState = { kind: 'loading' };

type FilterOptionsState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly options: LeaderFilterOptions }
  | { readonly kind: 'error' };

const FILTER_OPTIONS_LOADING_STATE: FilterOptionsState = { kind: 'loading' };

/**
 * Directorio filtrable del Kardex distrital.
 *
 * Consume únicamente la abstracción de datos provista por el límite de ruta.
 */
@Component({
  selector: 'app-kardex-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './kardex-page.html',
})
export class KardexPage {
  private readonly directory = inject(LEADER_DIRECTORY_DATA_SOURCE);

  protected readonly searchTerm = signal('');
  protected readonly selectedGroup = signal('');
  protected readonly selectedBranch = signal('');
  protected readonly selectedTrainingLevel = signal<LeaderTrainingLevel | ''>('');
  private readonly retryVersion = signal(0);

  private readonly query = computed<LeaderDirectoryQuery>(() => {
    const search = this.searchTerm().trim();
    const group = this.selectedGroup();
    const branch = this.selectedBranch();
    const trainingLevel = this.selectedTrainingLevel();
    return {
      ...(search ? { search } : {}),
      ...(group ? { scoutGroup: group } : {}),
      ...(branch ? { branch } : {}),
      ...(trainingLevel ? { trainingLevel } : {}),
    };
  });

  private readonly request = computed(() => ({
    query: this.query(),
    retryVersion: this.retryVersion(),
  }));

  protected readonly state = toSignal(
    toObservable(this.request).pipe(
      switchMap(({ query }) =>
        defer(() => this.directory.listLeaders(query)).pipe(
          map((leaders): DirectoryState => ({ kind: 'ready', leaders })),
          startWith(DIRECTORY_LOADING_STATE),
          catchError(() => of<DirectoryState>({ kind: 'error' })),
        ),
      ),
    ),
    { initialValue: DIRECTORY_LOADING_STATE },
  );

  protected readonly filterState = toSignal(
    toObservable(this.retryVersion).pipe(
      switchMap(() =>
        defer(() => this.directory.getFilterOptions()).pipe(
          map((options): FilterOptionsState => ({ kind: 'ready', options })),
          startWith(FILTER_OPTIONS_LOADING_STATE),
          catchError(() => of<FilterOptionsState>({ kind: 'error' })),
        ),
      ),
    ),
    { initialValue: FILTER_OPTIONS_LOADING_STATE },
  );

  protected readonly filterOptions = computed(() => {
    const state = this.filterState();
    return state.kind === 'ready' ? state.options : EMPTY_FILTER_OPTIONS;
  });

  /** Actualiza el término de búsqueda desde el control de texto. */
  protected updateSearch(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.searchTerm.set(target.value);
    }
  }

  /** Actualiza el filtro de grupo scout. */
  protected updateGroup(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLSelectElement) {
      this.selectedGroup.set(target.value);
    }
  }

  /** Actualiza el filtro de rama. */
  protected updateBranch(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLSelectElement) {
      this.selectedBranch.set(target.value);
    }
  }

  /** Actualiza el filtro de nivel de formación. */
  protected updateTrainingLevel(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLSelectElement) {
      this.selectedTrainingLevel.set(target.value as LeaderTrainingLevel | '');
    }
  }

  /** Restaura todos los filtros a su estado inicial. */
  protected clearFilters(): void {
    this.searchTerm.set('');
    this.selectedGroup.set('');
    this.selectedBranch.set('');
    this.selectedTrainingLevel.set('');
  }

  /** Reintenta la consulta actual sin conservar un error técnico previo. */
  protected retry(): void {
    this.retryVersion.update((version) => version + 1);
  }

  /** Devuelve las clases de insignia controladas por frontend. */
  protected badgeClass(accent: LeaderAccent): string {
    return {
      blue: 'bg-dsc-soft text-dsc',
      yellow: 'bg-secondary-soft text-secondary-dark',
      neutral: 'bg-slate-100 text-muted',
    }[accent];
  }

  /** Devuelve las clases del avatar cuando no existe foto segura. */
  protected avatarClass(accent: LeaderAccent): string {
    return {
      blue: 'bg-dsc-soft text-dsc-dark ring-1 ring-inset ring-dsc/15',
      yellow: 'bg-secondary-soft text-secondary-dark ring-2 ring-inset ring-secondary',
      neutral: 'bg-slate-100 text-muted ring-1 ring-inset ring-border',
    }[accent];
  }

  /** Identidad estable para el render incremental de tarjetas. */
  protected trackByLeader(_: number, leader: LeaderSummary): string {
    return leader.id;
  }
}
