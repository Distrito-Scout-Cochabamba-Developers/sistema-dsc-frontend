import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  model,
  output,
  viewChild
} from '@angular/core';

import { FormCheckboxControl } from '@angular/forms/signals';

/**
 * Checkbox reutilizable para seleccionar opciones independientes.
 *
 * Implementa FormCheckboxControl para integrarse con Angular Signal Forms.
 * Permite controlar la selección, el estado y el foco.
 */
@Component({
  selector: 'app-checkbox',
  standalone: true,
  templateUrl: './checkbox.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxComponent implements FormCheckboxControl {

  /** Texto principal de la opción. */
  readonly label = input.required<string>();

  /** Descripción complementaria de la opción. */
  readonly description = input<string>('');

  /** Indica si la casilla está seleccionada. */
  readonly checked = model<boolean>(false);

  /** Deshabilita la interacción con la casilla. */
  readonly disabled = input<boolean>(false);

  /** Indica si la selección es obligatoria. */
  readonly required = input<boolean>(false);

  /** Estado de interacción del control. */
  readonly touched = input<boolean>(false);

  /** Notifica cuando el control pierde el foco. */
  readonly touch = output<void>();

  /** Referencia al checkbox nativo. */
  private readonly checkboxElement =
    viewChild.required<ElementRef<HTMLInputElement>>('checkboxElement');

  /**
   * Actualiza el estado de selección.
   */
  onChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checked.set(target.checked);
  }

  /**
   * Notifica que el usuario salió del control.
   */
  onBlur(): void {
    this.touch.emit();
  }

  /**
   * Coloca el foco en el checkbox.
   */
  focus(options?: FocusOptions): void {
    this.checkboxElement().nativeElement.focus(options);
  }
}
