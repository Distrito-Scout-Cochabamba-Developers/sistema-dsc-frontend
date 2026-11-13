/**
 * Página administrativa para parametrizar requisitos por nivel de formación.
 * Restringida a Coordinador de Adultos (CAE), Director Distrital y Secretaría Distrital.
 */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { problemDetailMessage } from '@core/utils/http-error.utils';
import { StateCard } from '@shared/components/state-card';

import { CurriculumRequirementsViewer } from './components/curriculum-requirements-viewer';
import type {
  EligibleModuleDto,
  TrainingLevelItemDto,
  TrainingLevelRequirementsDto,
  WriteTrainingLevelRequirementsDto,
} from './curriculum-config.models';
import { TrainingLevelRequirementsService } from './services/training-level-requirements.service';

@Component({
  selector: 'app-curriculum-config-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, StateCard, CurriculumRequirementsViewer],
  templateUrl: './curriculum-config-page.html',
})
export class CurriculumConfigPage implements OnInit {
  private readonly service = inject(TrainingLevelRequirementsService);
  private readonly destroyRef = inject(DestroyRef);

  /** Contador secuencial para evitar condiciones de carrera al alternar niveles rápidamente. */
  private requirementRequestId = 0;

  /** Lista completa de niveles de formación. */
  protected readonly levels = signal<readonly TrainingLevelItemDto[]>([]);

  /** Código del nivel actualmente seleccionado en el selector. */
  protected readonly selectedLevelCode = signal<string>('');

  /** Catálogo de módulos disponibles para selección. */
  protected readonly eligibleModules = signal<readonly EligibleModuleDto[]>([]);

  /** Requisitos actuales guardados en backend para el nivel seleccionado. */
  protected readonly currentRequirements = signal<TrainingLevelRequirementsDto | null>(null);

  /** Filtro de búsqueda textual para los módulos del catálogo. */
  protected readonly moduleSearch = signal<string>('');

  /** Estado de carga inicial (niveles y catálogo de módulos). */
  protected readonly isLoadingInitial = signal<boolean>(true);

  /** Estado de carga de requisitos específicos del nivel seleccionado. */
  protected readonly isLoadingRequirements = signal<boolean>(false);

  /** Estado de guardado en curso del formulario. */
  protected readonly isSaving = signal<boolean>(false);

  /** Mensaje de error general para anunciar al usuario. */
  protected readonly errorMessage = signal<string | null>(null);

  /** Mensaje de éxito al completar el guardado. */
  protected readonly successMessage = signal<string | null>(null);

  /** Valor del campo: Total de módulos requeridos. */
  protected readonly totalModulesCount = signal<number | null>(null);

  /** Valor del campo: Mínimo de módulos obligatorios a aprobar. */
  protected readonly minMandatoryModulesCount = signal<number | null>(null);

  /** Conjunto de identificadores de módulos seleccionados como obligatorios elegibles. */
  protected readonly selectedModuleIds = signal<ReadonlySet<number>>(new Set());

  /** Nivel de formación seleccionado actualmente, o `null` si no hay selección. */
  protected readonly selectedLevel = computed<TrainingLevelItemDto | null>(() => {
    const code = this.selectedLevelCode();
    return this.levels().find((level) => level.code === code) ?? null;
  });

  /** Módulos del catálogo filtrados por el término de búsqueda. */
  protected readonly filteredModules = computed<readonly EligibleModuleDto[]>(() => {
    const query = this.moduleSearch().trim().toLowerCase();
    const modules = this.eligibleModules();
    if (!query) {
      return modules;
    }
    return modules.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        (m.description?.toLowerCase().includes(query) ?? false) ||
        (m.trainingLines?.some((line) => line.code.toLowerCase().includes(query)) ?? false),
    );
  });

  /** Cantidad de módulos seleccionados como obligatorios elegibles. */
  protected readonly selectedCount = computed<number>(() => this.selectedModuleIds().size);

  /** Validación reactiva en cliente para habilitar el guardado y orientar al usuario. */
  protected readonly validationError = computed<string | null>(() => {
    if (!this.selectedLevelCode()) {
      return 'Selecciona un nivel de formación para continuar.';
    }

    const total = this.totalModulesCount();
    if (total === null || isNaN(total) || total < 0 || !Number.isInteger(total)) {
      return 'El total de módulos debe ser un número entero mayor o igual a 0.';
    }

    const minMandatory = this.minMandatoryModulesCount();
    if (
      minMandatory === null ||
      isNaN(minMandatory) ||
      minMandatory < 0 ||
      !Number.isInteger(minMandatory)
    ) {
      return 'El mínimo obligatorio debe ser un número entero mayor o igual a 0.';
    }

    if (minMandatory > total) {
      return 'El mínimo de módulos obligatorios no puede ser superior al total de módulos del nivel.';
    }

    const selectedSize = this.selectedCount();
    if (minMandatory > selectedSize) {
      return `El mínimo obligatorio (${minMandatory}) no puede superar la cantidad de módulos obligatorios seleccionados (${selectedSize}).`;
    }

    return null;
  });

  ngOnInit(): void {
    this.loadInitialData();
  }

  /**
   * Carga los niveles de formación y el catálogo de módulos elegibles.
   */
  protected loadInitialData(): void {
    this.isLoadingInitial.set(true);
    this.errorMessage.set(null);

    forkJoin({
      levels: this.service.listLevels(),
      modules: this.service.listEligibleModules(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ levels, modules }) => {
          this.levels.set(levels);
          this.eligibleModules.set(modules);
          this.isLoadingInitial.set(false);

          if (levels.length > 0 && !this.selectedLevelCode()) {
            const first = levels[0];
            if (first) {
              this.onSelectLevel(first.code);
            }
          }
        },
        error: (err) => {
          this.isLoadingInitial.set(false);
          this.errorMessage.set(
            problemDetailMessage(
              err,
              'Error al cargar el catálogo de niveles o módulos. Verifica tu conexión e inténtalo de nuevo.',
            ),
          );
        },
      });
  }

  /**
   * Cambia el nivel activo y solicita sus requisitos específicos con protección de carrera.
   *
   * @param code - Código único del nivel seleccionado.
   */
  protected onSelectLevel(code: string): void {
    if (!code || code === this.selectedLevelCode()) {
      return;
    }

    this.selectedLevelCode.set(code);
    // No reutilizar los valores del nivel anterior si la siguiente carga falla.
    this.currentRequirements.set(null);
    this.totalModulesCount.set(null);
    this.minMandatoryModulesCount.set(null);
    this.selectedModuleIds.set(new Set());
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isLoadingRequirements.set(true);

    const requestId = ++this.requirementRequestId;

    this.service
      .getRequirements(code)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (requestId !== this.requirementRequestId) {
            return;
          }

          this.currentRequirements.set(response);
          this.populateFormFromRequirements(response);
          this.isLoadingRequirements.set(false);
        },
        error: (err) => {
          if (requestId !== this.requirementRequestId) {
            return;
          }

          this.isLoadingRequirements.set(false);
          this.errorMessage.set(
            problemDetailMessage(err, `No se pudieron cargar los requisitos del nivel ${code}.`),
          );
        },
      });
  }

  /**
   * Alterna la selección de un módulo como obligatorio elegible.
   *
   * @param moduleId - Identificador del módulo a alternar.
   */
  protected toggleModule(moduleId: number): void {
    const updated = new Set(this.selectedModuleIds());
    if (updated.has(moduleId)) {
      updated.delete(moduleId);
    } else {
      updated.add(moduleId);
    }
    this.selectedModuleIds.set(updated);
  }

  /**
   * Selecciona todos los módulos filtrados actualmente.
   */
  protected selectAllFiltered(): void {
    const updated = new Set(this.selectedModuleIds());
    for (const mod of this.filteredModules()) {
      updated.add(mod.id);
    }
    this.selectedModuleIds.set(updated);
  }

  /**
   * Desmarca todos los módulos seleccionados.
   */
  protected clearAllSelections(): void {
    this.selectedModuleIds.set(new Set());
  }

  /**
   * Envía la configuración de requisitos al backend con validación previa.
   */
  protected onSubmit(): void {
    if (this.isLoadingRequirements() || this.isSaving()) {
      return;
    }
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const validation = this.validationError();
    if (validation) {
      this.errorMessage.set(validation);
      return;
    }

    const code = this.selectedLevelCode();
    const total = this.totalModulesCount()!;
    const minMandatory = this.minMandatoryModulesCount()!;
    const selectedIds = Array.from(this.selectedModuleIds()).sort((a, b) => a - b);

    const payload: WriteTrainingLevelRequirementsDto = {
      totalModulesCount: total,
      minMandatoryModulesCount: minMandatory,
      mandatoryModuleIds: selectedIds,
    };

    this.isSaving.set(true);

    this.service
      .saveRequirements(code, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (saved) => {
          this.isSaving.set(false);
          this.currentRequirements.set(saved);
          this.populateFormFromRequirements(saved);
          this.successMessage.set(`Requisitos para el nivel ${code} guardados correctamente.`);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.errorMessage.set(
            problemDetailMessage(
              err,
              'Error al guardar la configuración de requisitos. Verifica los datos e inténtalo nuevamente.',
            ),
          );
        },
      });
  }

  /**
   * Rellena los campos del formulario con la información obtenida del backend.
   */
  private populateFormFromRequirements(data: TrainingLevelRequirementsDto): void {
    if (data.modules) {
      this.totalModulesCount.set(data.modules.totalModulesCount);
      this.minMandatoryModulesCount.set(data.modules.minMandatoryModulesCount);
      const ids = new Set(data.modules.mandatoryModules.map((m) => m.id));
      this.selectedModuleIds.set(ids);
    } else {
      this.totalModulesCount.set(0);
      this.minMandatoryModulesCount.set(0);
      this.selectedModuleIds.set(new Set());
    }
  }
}
