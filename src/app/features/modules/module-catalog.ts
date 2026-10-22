/**
 * Listado de módulos de formación. El formulario de asistencia solo se abre
 * al elegir un ítem (`/asistencia/:code`).
 */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { TRAINING_CATALOG_ROLES } from '@core/models/auth-roles';
import type { TrainingModuleApiDto } from '@core/models/attendance-api.models';
import { AuthSessionService } from '@core/services/auth-session.service';
import { TrainingModulesService } from '@core/services/training-modules.service';
import { isRetryableHttpError, problemDetailMessage } from '@core/utils/http-error.utils';
import { StateCard } from '@shared/components/state-card';

@Component({
  selector: 'app-module-catalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, StateCard],
  templateUrl: './module-catalog.html',
})
export class ModuleCatalog {
  private readonly catalog = inject(TrainingModulesService);
  private readonly auth = inject(AuthSessionService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly modules = signal<readonly TrainingModuleApiDto[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly retryable = signal(false);

  /** Admin o secretaría: ven el acceso a editar el catálogo. */
  protected readonly canManageCatalog = computed(() =>
    TRAINING_CATALOG_ROLES.some((role) => this.auth.hasRole(role)),
  );

  constructor() {
    this.load();
  }

  /** Recarga el catálogo tras un error transitorio. */
  protected retry(): void {
    this.load();
  }

  /**
   * Pide la lista de módulos a la API.
   */
  private load(): void {
    this.loading.set(true);
    this.error.set('');
    this.retryable.set(false);
    this.catalog
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          this.modules.set(items);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          this.error.set(
            problemDetailMessage(err, 'No se pudieron cargar los módulos. Intenta de nuevo.'),
          );
          this.retryable.set(isRetryableHttpError(err));
        },
      });
  }
}
