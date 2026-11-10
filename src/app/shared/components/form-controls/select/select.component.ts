
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core';

/**
 * Estructura de una opción del selector.
 */
export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Selector desplegable reutilizable.
 *
 * Recibe sus opciones y valor desde el componente padre.
 */
@Component({
  selector: 'app-select',
  standalone: true,
  templateUrl: './select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // `id` es el input del <select> interno; no duplicarlo en el host.
    '[attr.id]': 'null',
  },
})
export class SelectComponent {

  /** Identificador HTML opcional del `<select>`. */
  readonly id = input<string>('');

  /** Etiqueta del selector. */
  readonly label = input.required<string>();

  /** Opciones disponibles. */
  readonly options = input.required<SelectOption[]>();

  /** Valor seleccionado. */
  readonly value = input<string>('');

  /** Texto de ayuda debajo del selector. */
  readonly hint = input<string>('');

  /** Texto que se muestra cuando no hay selección. */
  readonly placeholder = input<string>('Seleccionar opción');

  /** Deshabilita el selector. */
  readonly disabled = input<boolean>(false);

  /** Notifica el valor seleccionado. */
  readonly valueChange = output<string>();

  /**
   * Emite el valor elegido en el selector.
   */
  onChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.valueChange.emit(target.value);
  }
}
