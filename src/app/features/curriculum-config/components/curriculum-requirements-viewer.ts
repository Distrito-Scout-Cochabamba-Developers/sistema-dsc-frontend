/**
 * Componente presentacional para visualizar los requisitos curriculares estándar de un nivel.
 * No realiza llamadas HTTP ni evalúa permisos (dumb component).
 */
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { SummaryList, type SummaryItem } from '@shared/components/summary-list';

import type { ModuleRequirementsDto } from '../curriculum-config.models';

@Component({
  selector: 'app-curriculum-requirements-viewer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SummaryList],
  templateUrl: './curriculum-requirements-viewer.html',
})
export class CurriculumRequirementsViewer {
  /** Nombre del nivel de formación actual (p. ej. `Insignia de Madera I-II`). */
  readonly levelName = input.required<string>();

  /** Código de la línea de formación asociada (p. ej. `PJ`, `GI`, `AE`). */
  readonly trainingLineCode = input.required<string>();

  /** Requisitos del criterio de módulos configurados para el nivel, o `null` si aún no fue configurado. */
  readonly requirements = input<ModuleRequirementsDto | null>(null);

  /** Indica si los requisitos se encuentran en proceso de carga. */
  readonly loading = input<boolean>(false);

  /**
   * Elementos formateados para el componente reutilizable `app-summary-list`.
   */
  protected readonly summaryItems = computed<readonly SummaryItem[]>(() => {
    const data = this.requirements();
    if (!data) {
      return [];
    }

    const voluntaryCount = Math.max(0, data.totalModulesCount - data.minMandatoryModulesCount);

    return [
      {
        label: 'Total de módulos requeridos',
        value: `${data.totalModulesCount} módulos`,
      },
      {
        label: 'Mínimo de obligatorios a aprobar',
        value: `${data.minMandatoryModulesCount} de la lista`,
      },
      {
        label: 'Obligatorios elegibles en la lista',
        value: `${data.mandatoryModules.length} módulos disponibles`,
      },
      {
        label: 'Módulos voluntarios complementarios',
        value: `${voluntaryCount} módulos (a elección del dirigente)`,
      },
    ];
  });
}
