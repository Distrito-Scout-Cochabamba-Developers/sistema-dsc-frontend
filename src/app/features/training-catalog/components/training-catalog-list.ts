/**
 * Tabla presentational del catálogo admin (listado + acciones).
 */
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import type { TrainingModuleApiDto } from '@core/models/attendance-api.models';

@Component({
  selector: 'app-training-catalog-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
}
