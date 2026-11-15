
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core';

/**
 * Checkbox reutilizable para seleccionar opciones independientes.
 *
 * El componente no administra su propio estado de selección.
 * El componente padre controla el valor mediante checked
 * y recibe los cambios mediante checkedChange.
 */
@Component({
  selector: 'app-checkbox',
  standalone: true,
  templateUrl: './checkbox.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxComponent {

  /** Texto principal de la opción. */
  readonly label = input.required<string>();

  /** Descripción complementaria de la opción. */
  readonly description = input<string>('');

  /** Indica si la casilla está seleccionada. */
  readonly checked = input<boolean>(false);

  /** Deshabilita la interacción con la casilla. */
  readonly disabled = input<boolean>(false);

  /** Notifica al componente padre el nuevo estado. */
  readonly checkedChange = output<boolean>();

  /**
   * Emite el nuevo estado de selección.
   */
  onChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checkedChange.emit(target.checked);
  }
}
