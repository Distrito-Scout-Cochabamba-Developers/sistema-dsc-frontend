
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
 * Estructura de una opción del selector.
 */
export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Selector desplegable reutilizable.
 *
 * Implementa FormValueControl para integrarse con Angular Signal Forms.
 * Recibe sus opciones y permite controlar su valor, estado y foco.
 */
@Component({
  selector: 'app-select',
  standalone: true,
  templateUrl: './select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectComponent implements FormValueControl<string> {

  /** Identificador único del control interno. */
  readonly inputId = input.required<string>();

  /** Etiqueta del selector. */
  readonly label = input.required<string>();

  /** Opciones disponibles. */
  readonly options = input.required<SelectOption[]>();

  /** Valor seleccionado. */
  readonly value = model<string>('');

  /** Texto de ayuda debajo del selector. */
  readonly hint = input<string>('');

  /** Texto que se muestra cuando no hay selección. */
  readonly placeholder = input<string>('Seleccionar opción');

  /** Indica si el selector es obligatorio. */
  readonly required = input<boolean>(false);

  /** Deshabilita el selector. */
  readonly disabled = input<boolean>(false);

  /** Estado de interacción del control. */
  readonly touched = input<boolean>(false);

  /** Notifica cuando el selector pierde el foco. */
  readonly touch = output<void>();

  /** Referencia al elemento select del DOM. */
  private readonly selectElement =
    viewChild.required<ElementRef<HTMLSelectElement>>('selectElement');

  /**
   * Actualiza el valor seleccionado.
   */
  onChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.value.set(target.value);
  }

  /**
   * Notifica que el usuario salió del selector.
   */
  onBlur(): void {
    this.touch.emit();
  }

  /**
   * Coloca el foco en el selector.
   */
  focus(options?: FocusOptions): void {
    this.selectElement().nativeElement.focus(options);
  }
}
