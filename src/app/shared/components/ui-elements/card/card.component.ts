
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input
} from '@angular/core';

/** Variantes visuales disponibles para una tarjeta. */
export type CardVariant = 'default' | 'outlined' | 'elevated';

/** Espaciados internos disponibles para el contenido de la tarjeta. */
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * Contenedor visual reutilizable para organizar contenido.
 *
 * Permite proyectar contenido personalizado mediante ng-content,
 * incluyendo encabezados, contenido principal y pie de tarjeta.
 *
 * No contiene lógica de negocio ni depende del tipo de información
 * que se presente en su interior.
 *
 * @example
 * <app-card title="Información general" variant="elevated">
 *   <p>Contenido de la tarjeta.</p>
 * </app-card>
 */
@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class CardComponent {

  /** Título opcional que se muestra en el encabezado. */
  readonly title = input<string>('');

  /** Descripción opcional que acompaña al título. */
  readonly subtitle = input<string>('');

  /** Variante visual de la tarjeta. */
  readonly variant = input<CardVariant>('default');

  /** Espaciado interno del contenido principal. */
  readonly padding = input<CardPadding>('md');

  /** Indica si se permite mostrar el encabezado cuando hay título o subtítulo. */
  readonly header = input<boolean>(true);

  /** Indica si se debe mostrar el área de pie de tarjeta. */
  readonly footer = input<boolean>(false);

  /** Clases TailwindCSS correspondientes a cada variante visual. */
  private readonly variantClasses: Record<CardVariant, string> = {
    default: 'border border-slate-200 bg-white',
    outlined: 'border border-dsc-border bg-white',
    elevated: 'border border-slate-100 bg-white shadow-md'
  };

  /** Clases TailwindCSS correspondientes a cada nivel de espaciado. */
  private readonly paddingClasses: Record<CardPadding, string> = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6'
  };

  /**
   * Calcula las clases visuales del contenedor.
   *
   * Aplica la variante seleccionada y los estilos base compartidos.
   */
  readonly cardClasses = computed(() => [
    'overflow-hidden rounded-xl',
    this.variantClasses[this.variant()]
  ].join(' '));

  /**
   * Obtiene las clases de espaciado del contenido principal.
   */
  readonly contentClasses = computed(() => {
    return this.paddingClasses[this.padding()];
  });
}
