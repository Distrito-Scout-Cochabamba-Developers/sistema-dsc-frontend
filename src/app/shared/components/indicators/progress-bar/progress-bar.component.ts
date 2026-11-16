
import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input
} from '@angular/core';

import type { ProgressColor } from
  '../progress-radial/progress-radial.component';

/**
 * Indicador de progreso lineal.
 *
 * Representa el avance de una operación mediante una barra horizontal.
 * También permite mostrar un estado indeterminado cuando no se conoce
 * el porcentaje exacto de avance.
 *
 * @example
 * <app-progress-bar
 *   [value]="60"
 *   [showLabel]="true"
 *   color="success"
 * />
 */
@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './progress-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressBarComponent {

  /** Valor actual del progreso. */
  readonly value = input<number>(0);

  /** Valor máximo utilizado para calcular el porcentaje. */
  readonly max = input<number>(100);

  /** Altura de la barra expresada en píxeles. */
  readonly height = input<number>(8);

  /** Color semántico de la barra de progreso. */
  readonly color = input<ProgressColor>('primary');

  /** Indica si se debe mostrar la etiqueta del porcentaje. */
  readonly showLabel = input<boolean>(false);

  /**
   * Activa el modo de progreso indeterminado.
   *
   * En este modo no se representa un porcentaje real,
   * sino una animación visual de carga.
   */
  readonly indeterminate = input<boolean>(false);

  /**
   * Calcula el porcentaje de progreso.
   *
   * El resultado se limita al intervalo de 0 a 100.
   * Si el máximo es menor o igual a cero, devuelve cero.
   */
  readonly percentage = computed(() => {
    if (this.max() <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(0, (this.value() / this.max()) * 100)
    );
  });

  /** Obtiene el color hexadecimal correspondiente al color semántico. */
  readonly progressColor = computed(() => {
    const colors: Record<ProgressColor, string> = {
      primary: 'var(--color-dsc-primary)',
      success: 'var(--color-dsc-success)',
      warning: 'var(--color-dsc-warning)',
      danger: 'var(--color-dsc-danger)',
      secondary: 'var(--color-dsc-default)'
    };

    return colors[this.color()];
  });
}
