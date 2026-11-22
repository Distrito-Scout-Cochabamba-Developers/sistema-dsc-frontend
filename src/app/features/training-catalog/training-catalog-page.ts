/**
 * Administración del catálogo de módulos y alta de convocatorias
 * (solo ADMIN y DISTRICT_SECRETARY).
 */
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import type { TrainingModuleApiDto } from '@core/models/attendance-api.models';
import { isRetryableHttpError, problemDetailMessage } from '@core/utils/http-error.utils';
import { StateCard } from '@shared/components/state-card';

import { TrainingCatalogDeleteDialog } from './components/training-catalog-delete-dialog';
import { TrainingCatalogFormModal } from './components/training-catalog-form-modal';
import { TrainingCatalogList } from './components/training-catalog-list';
import { TrainingCatalogSessionModal } from './components/training-catalog-session-modal';
import { TrainingModuleService } from './services/training-module';
import type {
  CatalogTrainingLineDto,
  ConvocatoriaDraft,
  WriteTrainingModuleDto,
} from './training-catalog.models';

@Component({
  selector: 'app-training-catalog-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    StateCard,
    TrainingCatalogList,
    TrainingCatalogFormModal,
    TrainingCatalogDeleteDialog,
    TrainingCatalogSessionModal,
  ],
  templateUrl: './training-catalog-page.html',
})
export class TrainingCatalogPage {
  private readonly catalog = inject(TrainingModuleService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly modules = signal<readonly TrainingModuleApiDto[]>([]);
  protected readonly trainingLines = signal<readonly CatalogTrainingLineDto[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly retryable = signal(false);
  protected readonly modalOpen = signal(false);
  protected readonly editing = signal<TrainingModuleApiDto | null>(null);
  protected readonly saveError = signal('');
  protected readonly submitting = signal(false);
  protected readonly deleting = signal<TrainingModuleApiDto | null>(null);
  protected readonly deleteError = signal('');
  protected readonly deleteSubmitting = signal(false);
  protected readonly sessionModule = signal<TrainingModuleApiDto | null>(null);
  protected readonly sessionError = signal('');
  protected readonly sessionSubmitting = signal(false);
  protected readonly sessionNotice = signal('');

  constructor() {
    this.load();
  }

  /** Recarga tras un error transitorio. */
  protected retry(): void {
    this.load();
  }

  /** Abre el modal en modo alta. */
  protected openCreate(): void {
    this.saveError.set('');
    this.editing.set(null);
    this.modalOpen.set(true);
  }

  /**
   * Abre el modal con el módulo elegido.
   *
   * @param module - Fila del listado.
   */
  protected openEdit(module: TrainingModuleApiDto): void {
    this.saveError.set('');
    this.editing.set(module);
    this.modalOpen.set(true);
  }

  /** Cierra el modal. */
  protected closeModal(): void {
    this.modalOpen.set(false);
    this.editing.set(null);
    this.saveError.set('');
    this.submitting.set(false);
  }

  /**
   * Abre la confirmación de baja.
   *
   * @param module - Fila del listado.
   */
  protected openDelete(module: TrainingModuleApiDto): void {
    this.deleteError.set('');
    this.deleting.set(module);
  }

  /** Cierra el diálogo de baja. */
  protected closeDelete(): void {
    this.deleting.set(null);
    this.deleteError.set('');
    this.deleteSubmitting.set(false);
  }

  /**
   * Abre el modal de convocatoria para un módulo del catálogo.
   *
   * @param module - Fila elegida.
   */
  protected openSession(module: TrainingModuleApiDto): void {
    this.sessionError.set('');
    this.sessionNotice.set('');
    this.sessionModule.set(module);
  }

  /** Cierra el modal de convocatoria. */
  protected closeSession(): void {
    this.sessionModule.set(null);
    this.sessionError.set('');
    this.sessionSubmitting.set(false);
  }

  /** `DELETE /api/v1/admin/modules/{id}`. */
  protected confirmDelete(): void {
    const current = this.deleting();
    if (!current) {
      return;
    }

    this.deleteSubmitting.set(true);
    this.deleteError.set('');
    this.catalog
      .remove(current.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.deleteSubmitting.set(false);
          this.closeDelete();
          this.load();
        },
        error: (err: unknown) => {
          this.deleteSubmitting.set(false);
          this.deleteError.set(
            problemDetailMessage(err, 'No se pudo eliminar el módulo. Intenta de nuevo.'),
          );
        },
      });
  }

  /**
   * POST o PUT según el modo del modal.
   *
   * @param draft - Valores del formulario.
   */
  protected save(draft: WriteTrainingModuleDto): void {
    this.submitting.set(true);
    this.saveError.set('');
    const current = this.editing();
    const request$ = current
      ? this.catalog.update(current.id, draft)
      : this.catalog.create(draft);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeModal();
        this.load();
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        this.saveError.set(
          problemDetailMessage(err, 'No se pudo guardar el módulo. Intenta de nuevo.'),
        );
      },
    });
  }

  /**
   * Publica una convocatoria con los bloques de horario.
   *
   * @param draft - Fecha, horas e inscripción abierta.
   */
  protected saveSession(draft: ConvocatoriaDraft): void {
    const module = this.sessionModule();
    if (!module) {
      return;
    }

    this.sessionSubmitting.set(true);
    this.sessionError.set('');
    this.catalog
      .createSession(module.id, {
        statusCode: 'OPEN',
        isRegistrationOpen: draft.isRegistrationOpen,
        schedules: draft.schedules.map((block, index) => ({
          sessionDate: block.sessionDate,
          startTime: toTimeApi(block.startTime),
          endTime: toTimeApi(block.endTime),
          partNumber: index + 1,
        })),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.sessionSubmitting.set(false);
          this.sessionNotice.set(
            `Convocatoria de «${module.name}» publicada. Ya aparece en el calendario.`,
          );
          this.closeSession();
        },
        error: (err: unknown) => {
          this.sessionSubmitting.set(false);
          this.sessionError.set(
            problemDetailMessage(err, 'No se pudo abrir la convocatoria. Intenta de nuevo.'),
          );
        },
      });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set('');
    this.retryable.set(false);
    forkJoin({
      modules: this.catalog.list(),
      lines: this.catalog.listLines(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ modules, lines }) => {
          this.modules.set(modules);
          this.trainingLines.set(lines);
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

function toTimeApi(value: string): string {
  return value.length === 5 ? `${value}:00` : value;
}
