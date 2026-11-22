
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  model,
  output,
  viewChild
} from '@angular/core';

import { FormValueControl } from '@angular/forms/signals';

/**
 * Selector de fechas reutilizable.
 *
 * Implementa FormValueControl para integrarse con Angular Signal Forms.
 * Permite seleccionar fechas, establecer restricciones y controlar el foco.
 *
 * El valor utiliza el formato YYYY-MM-DD.
 */
@Component({
  selector: 'app-date-picker',
  standalone: true,
  templateUrl: './date-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatePickerComponent implements FormValueControl<string> {

  /** Identificador HTML único del elemento input interno. */
  readonly inputId = input.required<string>();

  /** Texto que aparece encima del selector. */
  readonly label = input.required<string>();

  /** Fecha seleccionada en formato YYYY-MM-DD. */
  readonly value = model<string>('');

  /** Texto de ayuda debajo del selector. */
  readonly hint = input<string>('');

  /** Fecha mínima permitida. */
  readonly min = input<string | undefined>(undefined);

  /** Fecha máxima permitida. */
  readonly max = input<string | undefined>(undefined);

  /** Indica si el campo es obligatorio. */
  readonly required = input<boolean>(false);

  /** Indica si el campo está deshabilitado. */
  readonly disabled = input<boolean>(false);

  /** Estado de interacción del control. */
  readonly touched = input<boolean>(false);

  /** Notifica la nueva fecha al componente padre. */
  readonly dateChange = output<string>();

  /** Notifica cuando el control pierde el foco. */
  readonly touch = output<void>();

  /** Referencia al input de fecha del DOM. */
  private readonly dateInput =
    viewChild.required<ElementRef<HTMLInputElement>>('dateInput');

  /**
   * Actualiza la fecha seleccionada.
   */
  onDateChange(event: Event): void {
    const target = event.target as HTMLInputElement;

    this.value.set(target.value);
    this.dateChange.emit(target.value);
  }

  /**
   * Notifica que el usuario salió del control.
   */
  onBlur(): void {
    this.touch.emit();
  }

  /**
   * Coloca el foco en el selector de fechas.
   */
  focus(options?: FocusOptions): void {
    this.dateInput().nativeElement.focus(options);
  }
}
