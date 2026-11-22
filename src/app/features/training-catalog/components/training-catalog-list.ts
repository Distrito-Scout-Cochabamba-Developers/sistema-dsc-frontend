/**
 * Tabla presentational del catálogo admin (listado + acciones).
 */
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil, lucideTrash2 } from '@ng-icons/lucide';

import type { TrainingModuleApiDto } from '@core/models/attendance-api.models';

@Component({
  selector: 'app-training-catalog-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon],
  providers: [provideIcons({ lucidePencil, lucideTrash2 })],
  templateUrl: './training-catalog-list.html',
})
export class TrainingCatalogList {
  /** Filas del catálogo. */
  readonly modules = input.required<readonly TrainingModuleApiDto[]>();

  /** Alta de un módulo nuevo. */
  readonly create = output<void>();

  /** Edición de la fila elegida. */
  readonly edit = output<TrainingModuleApiDto>();

  /** Baja de la fila elegida. */
  readonly remove = output<TrainingModuleApiDto>();

  /** Abre el modal de convocatoria (fecha y horas). */
  readonly openSession = output<TrainingModuleApiDto>();

  /**
   * Códigos de línea para la columna.
   *
   * @param module - Fila del catálogo.
   */
  protected linesOf(module: TrainingModuleApiDto): string {
    const lines = module.trainingLines ?? [];
    return lines.length ? lines.map((line) => line.code).join(', ') : '—';
  }
}
