import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, defaultIfEmpty, defer, map, of, startWith, switchMap } from 'rxjs';

import { LEADER_DIRECTORY_DATA_SOURCE } from '../data-access/leader-directory.data-source';
import type { LeaderAccent, LeaderDetail, LeaderTrainingStatus } from '../models/kardex.models';

type DetailState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly leader: LeaderDetail }
  | { readonly kind: 'not-found' }
  | { readonly kind: 'error' };

const LOADING_STATE: DetailState = { kind: 'loading' };

/**
 * Ficha digital responsive de un dirigente del Kardex.
 *
 * Distingue carga, ausencia y error sin conservar datos de solicitudes previas.
 */
@Component({
  selector: 'app-kardex-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: '../kardex-detail-page-layout.html',
})
export class KardexDetailPage {
  /** Identificador opaco enlazado desde la ruta `/kardex/:leaderId`. */
  readonly leaderId = input.required<string>();

  private readonly directory = inject(LEADER_DIRECTORY_DATA_SOURCE);
  private readonly retryVersion = signal(0);
  private readonly request = computed(() => ({
    leaderId: this.leaderId(),
    retryVersion: this.retryVersion(),
  }));

  protected readonly state = toSignal(
    toObservable(this.request).pipe(
      switchMap(({ leaderId }) =>
        defer(() => this.directory.getLeaderById(leaderId)).pipe(
          defaultIfEmpty(null),
          map((leader): DetailState =>
            leader ? { kind: 'ready', leader } : { kind: 'not-found' },
          ),
          startWith(LOADING_STATE),
          catchError(() => of<DetailState>({ kind: 'error' })),
        ),
      ),
    ),
    { initialValue: LOADING_STATE },
  );

  /** Reintenta la ficha actual sin exponer información técnica del error. */
  protected retry(): void {
    this.retryVersion.update((version) => version + 1);
  }

  /** Devuelve clases de avatar controladas por el modelo de presentación. */
  protected avatarClass(accent: LeaderAccent): string {
    return {
      blue: 'bg-dsc-soft text-dsc-dark ring-1 ring-inset ring-dsc/15',
      yellow: 'bg-secondary-soft text-secondary-dark ring-2 ring-inset ring-secondary',
      neutral: 'bg-slate-100 text-muted ring-1 ring-inset ring-border',
    }[accent];
  }

  /** Devuelve clases locales para cada estado formativo permitido. */
  protected moduleStatusClass(status: LeaderTrainingStatus): string {
    return {
      completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
      enrolled: 'bg-dsc-soft text-dsc-dark ring-dsc/20',
      pending: 'bg-slate-100 text-slate-600 ring-slate-200',
    }[status];
  }
}
