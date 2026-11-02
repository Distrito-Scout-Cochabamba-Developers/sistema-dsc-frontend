
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core';

/**
 * Estructura de una opción disponible en el grupo de radios.
 */
export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
}

/**
 * Grupo de opciones de selección única.
 *
 * Recibe las opciones y el valor seleccionado desde el padre.
 * Emite el valor elegido sin administrar reglas de negocio.
 */
@Component({
  selector: 'app-radio-group',
  standalone: true,
  templateUrl: './radio-group.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadioGroupComponent {

  /** Identificador único del grupo de radios. */
  readonly name = input.required<string>();

  /** Opciones disponibles para seleccionar. */
  readonly options = input.required<RadioOption[]>();

  /** Valor actualmente seleccionado. */
  readonly value = input<string>('');

  /** Deshabilita todas las opciones. */
  readonly disabled = input<boolean>(false);

  /** Notifica el valor seleccionado. */
  readonly valueChange = output<string>();

  /**
   * Emite el valor de la opción seleccionada.
   */
  selectOption(value: string): void {
    this.valueChange.emit(value);
  }
}
