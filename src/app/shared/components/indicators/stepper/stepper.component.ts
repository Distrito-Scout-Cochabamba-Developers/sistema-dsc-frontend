
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input
} from '@angular/core';

/**
 * Representa una etapa individual dentro de un Stepper.
 */
export interface StepperStep {

  /** Nombre o título de la etapa. */
  title: string;

  /** Descripción opcional de la etapa. */
  description?: string;
}

/** Orientaciones disponibles para mostrar el Stepper. */
export type StepperOrientation = 'horizontal' | 'vertical';

/**
 * Indicador visual de progreso por etapas.
 *
 * Permite representar procesos secuenciales mediante pasos
 * completados, actuales y pendientes.
 *
 * El componente únicamente representa el estado recibido.
 * La navegación y las validaciones deben ser gestionadas
 * por el componente padre.
 *
 * El índice de `activeStep` comienza en cero.
 *
 * @example
 * <app-stepper
 *   [steps]="steps"
 *   [activeStep]="1"
 *   orientation="horizontal"
 * />
 */
@Component({
  selector: 'app-stepper',
  standalone: true,
  templateUrl: './stepper.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepperComponent {

  /** Lista de etapas que se mostrarán en el indicador. */
  readonly steps = input<StepperStep[]>([]);

  /** Índice de la etapa actual. El primer elemento corresponde al índice cero. */
  readonly activeStep = input<number>(0);

  /** Orientación visual del Stepper. */
  readonly orientation = input<StepperOrientation>('horizontal');

  /** Indica si se deben mostrar las descripciones de las etapas. */
  readonly showDescriptions = input<boolean>(true);

  /**
   * Normaliza el índice de la etapa actual.
   *
   * Evita índices negativos o superiores a la cantidad de etapas.
   * Cuando no existen etapas, devuelve cero.
   */
  readonly normalizedActiveStep = computed(() => {
    const total = this.steps().length;

    if (total === 0) {
      return 0;
    }

    return Math.min(
      total - 1,
      Math.max(0, this.activeStep())
    );
  });

  /**
   * Determina si una etapa ya fue completada.
   *
   * @param index Índice de la etapa que se desea comprobar.
   * @returns `true` cuando la etapa está antes de la etapa actual.
   */
  isCompleted(index: number): boolean {
    return index < this.normalizedActiveStep();
  }

  /**
   * Determina si una etapa corresponde a la etapa actual.
   *
   * @param index Índice de la etapa que se desea comprobar.
   * @returns `true` cuando coincide con el índice actual.
   */
  isActive(index: number): boolean {
    return index === this.normalizedActiveStep();
  }

  /**
   * Determina si una etapa todavía está pendiente.
   *
   * @param index Índice de la etapa que se desea comprobar.
   * @returns `true` cuando la etapa está después de la etapa actual.
   */
  isPending(index: number): boolean {
    return index > this.normalizedActiveStep();
  }
}
