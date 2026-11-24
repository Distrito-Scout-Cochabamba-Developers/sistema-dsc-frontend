
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input
} from '@angular/core';

/**
 * Variantes visuales disponibles para un badge.
 *
 * - `solid`: fondo sólido con texto contrastante.
 * - `soft`: fondo suave con texto de color.
 * - `outline`: borde y texto coloreados, sin fondo sólido.
 */
export type BadgeVariant = 'solid' | 'soft' | 'outline';

/**
 * Colores semánticos disponibles para identificar estados
 * y clasificaciones dentro de la interfaz.
 */
export type BadgeColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'default';

/**
 * Tamaños disponibles para el badge.
 */
export type BadgeSize = 'sm' | 'md' | 'lg';

/**
 * Componente visual para mostrar etiquetas compactas.
 *
 * Permite identificar estados, categorías y clasificaciones
 * mediante diferentes variantes, colores y tamaños.
 *
 * Es un componente de presentación: no contiene lógica de negocio.
 *
 * @example
 * <app-badge color="success" [dot]="true">
 *   Activo
 * </app-badge>
 */
@Component({
  selector: 'app-badge',
  standalone: true,
  templateUrl: './badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeComponent {

  /** Variante visual del badge. Por defecto utiliza `soft`. */
  readonly variant = input<BadgeVariant>('soft');

  /** Color semántico del badge. Por defecto utiliza `primary`. */
  readonly color = input<BadgeColor>('primary');

  /** Tamaño del badge. Por defecto utiliza `md`. */
  readonly size = input<BadgeSize>('md');

  /** Indica si se debe mostrar un punto de estado. */
  readonly dot = input<boolean>(false);

  /** Define si el badge utiliza bordes completamente redondeados. */
  readonly pill = input<boolean>(true);

  /** Clases TailwindCSS asociadas a cada tamaño. */
  private readonly sizeClasses: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2'
  };

  /** Clases TailwindCSS asociadas a cada variante y color. */
  private readonly variantClasses: Record<
    BadgeVariant,
    Record<BadgeColor, string>
  > = {
    solid: {
      primary: 'bg-dsc-primary text-white',
      secondary: 'bg-dsc-secondary text-white',
      success: 'bg-emerald-600 text-white',
      warning: 'bg-amber-500 text-white',
      danger: 'bg-[#BA1A1A] text-white',
      info: 'bg-sky-600 text-white',
      default: 'bg-dsc-default text-white',
    },
    soft: {
      primary: 'bg-sky-100 text-sky-800',
      secondary: 'bg-yellow-100 text-yellow-700',
      success: 'bg-emerald-100 text-emerald-800',
      warning: 'bg-amber-100 text-amber-800',
      danger: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800',
      default: 'bg-slate-200 text-slate-700'
    },
    outline: {
      primary: 'border border-dsc-primary text-dsc-primary',
      secondary: 'border border-dsc-secondary text-dsc-secondary',
      success: 'border border-emerald-600 text-emerald-700',
      warning: 'border border-amber-500 text-amber-700',
      danger: 'border border-[#BA1A1A] text-[#BA1A1A]',
      info: 'border border-sky-600 text-sky-700',
      default: 'border border-slate-600 text-slate-70'
    }
  };

  /** Clases de fondo para los indicadores circulares. */
  private readonly dotColors: Record<BadgeColor, string> = {
    primary: 'bg-dsc-primary',
    secondary: 'bg-dsc-secondary',
    success: 'bg-emerald-600',
    warning: 'bg-amber-500',
    danger: 'bg-[#BA1A1A]',
    info: 'bg-sky-600',
    default: 'bg-dsc-default',
  };

  /**
   * Calcula las clases CSS finales del badge.
   *
   * Combina la variante, el color, el tamaño y la forma
   * configurados mediante los inputs.
   */
  readonly badgeClasses = computed(() => [
    'inline-flex w-fit items-center font-medium',
    this.pill() ? 'rounded-full' : 'rounded-md',
    this.sizeClasses[this.size()],
    this.variantClasses[this.variant()][this.color()]
  ].join(' '));

  /** Obtiene la clase de color del indicador circular. */
  readonly dotClass = computed(() => this.dotColors[this.color()]);
}
