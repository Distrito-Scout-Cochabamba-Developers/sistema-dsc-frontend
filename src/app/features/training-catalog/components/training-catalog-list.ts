/**
 * Tabla presentational del catálogo de módulos admin (listado + acciones).
 */
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil, lucideTrash2 } from '@ng-icons/lucide';

import type { TrainingModuleApiDto } from '@core/models/attendance-api.models';
import { ButtonComponent } from '@shared/components/buttons/button/button.component';
import { BadgeComponent } from '@shared/components/ui-elements/badge/badge.component';
import { CardComponent } from '@shared/components/ui-elements/card/card.component';

@Component({
  selector: 'app-training-catalog-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, ButtonComponent, BadgeComponent, CardComponent],
  providers: [provideIcons({ lucidePencil, lucideTrash2 })],
  templateUrl: './training-catalog-list.html',
})
export class TrainingCatalogList {
  /** Filas del catálogo de módulos. */
  readonly modules = input.required<readonly TrainingModuleApiDto[]>();

  /** Alta de un módulo nuevo. */
  readonly create = output<void>();

  /** Edición de la fila elegida. */
  readonly edit = output<TrainingModuleApiDto>();

  /** Baja de la fila elegida. */
  readonly remove = output<TrainingModuleApiDto>();

  /** Abre el modal de programación (fecha y horas). */
  readonly openSession = output<TrainingModuleApiDto>();

  /**
   * Códigos de línea para la columna.
   *
   * @param module - Fila del catálogo de módulos.
   */
  protected linesOf(module: TrainingModuleApiDto): string {
    const lines = module.trainingLines ?? [];
    return lines.length ? lines.map((line) => line.code).join(', ') : '—';
  }
}
