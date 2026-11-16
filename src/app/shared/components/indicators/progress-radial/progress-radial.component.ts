
import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input
} from '@angular/core';

/** Colores semánticos disponibles para los indicadores de progreso. */
export type ProgressColor =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'secondary';

/**
 * Indicador de progreso circular basado en SVG.
 *
 * Representa un valor numérico mediante un arco circular.
 * El porcentaje se calcula utilizando el valor actual y el máximo.
 *
 * @example
 * <app-progress-radial
 *   [value]="75"
 *   [max]="100"
 *   color="success"
 * />
 */
@Component({
  selector: 'app-progress-radial',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './progress-radial.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressRadialComponent {

  /** Valor actual del progreso. */
  readonly value = input<number>(0);

  /** Valor máximo utilizado para calcular el porcentaje. */
  readonly max = input<number>(100);

  /** Diámetro del indicador expresado en píxeles. */
  readonly size = input<number>(100);

  /** Grosor del trazo circular expresado en píxeles SVG. */
  readonly strokeWidth = input<number>(8);

  /** Color semántico del indicador. */
  readonly color = input<ProgressColor>('primary');

  /** Indica si se debe mostrar el porcentaje en el centro. */
  readonly showLabel = input<boolean>(true);

  /** Longitud total de la circunferencia SVG. */
  readonly circumference = 2 * Math.PI * 42;

  /**
   * Calcula el porcentaje de progreso.
   *
   * El resultado se limita al intervalo de 0 a 100.
   * Si el máximo es menor o igual a cero, devuelve cero.
   */
  readonly percentage = computed(() => {
    const maximum = this.max();

    if (maximum <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(0, (this.value() / maximum) * 100)
    );
  });

  /**
   * Calcula el desplazamiento del trazo SVG.
   *
   * Este valor permite representar visualmente el porcentaje
   * mediante stroke-dashoffset.
   */
  readonly strokeOffset = computed(() => {
    return this.circumference -
      (this.percentage() / 100) * this.circumference;
  });

  /** Obtiene el color hexadecimal correspondiente al color semántico. */
  readonly strokeColor = computed(() => {
    const colors: Record<ProgressColor, string> = {
      primary: 'var(--color-dsc-primary)',
      success: 'var(--color-dsc-success)',
      warning: 'var(--color-dsc-warning)',
      danger: 'var(--color-dsc-danger)',
      secondary: 'var(--color-dsc-default)'
    };

    return colors[this.color()];
  });

  /**
   * Calcula el tamaño visible del indicador.
   *
   * Garantiza un diámetro mínimo de 40 píxeles.
   */
  readonly displaySize = computed(() => {
    return Math.max(40, this.size());
  });

  /**
   * Calcula el grosor visible del trazo.
   *
   * Limita el valor para evitar grosores negativos
   * o superiores al radio disponible.
   */
  readonly displayStrokeWidth = computed(() => {
    return Math.min(42, Math.max(1, this.strokeWidth()));
  });
}
