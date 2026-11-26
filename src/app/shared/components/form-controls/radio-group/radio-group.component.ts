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
 * Implementa FormValueControl para integrarse con Angular Signal Forms.
 * El valor seleccionado es administrado mediante un ModelSignal.
 */
@Component({
  selector: 'app-radio-group',
  standalone: true,
  templateUrl: './radio-group.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class RadioGroupComponent implements FormValueControl<string> {

  /** Identificador único del grupo de radios. */
  readonly name = input.required<string>();

  /** Opciones disponibles para seleccionar. */
  readonly options = input.required<RadioOption[]>();

  /** Valor seleccionado. */
  readonly value = model<string>('');

  /** Deshabilita todas las opciones. */
  readonly disabled = input<boolean>(false);

  /** Indica si la selección es obligatoria. */
  readonly required = input<boolean>(false);

  /** Indica si el control fue visitado. */
  readonly touched = input<boolean>(false);

  /** Notifica cuando el control pierde el foco. */
  readonly touch = output<void>();

  /** Referencia al primer radio disponible para gestionar el foco. */
  private readonly radioInput =
    viewChild<ElementRef<HTMLInputElement>>('radioInput');

  /**
   * Enfoca la primera opción disponible.
   */
  focus(options?: FocusOptions): void {
    this.radioInput()?.nativeElement.focus(options);
  }

  /**
   * Actualiza el valor seleccionado.
   */
  selectOption(value: string): void {
    if (this.disabled()) {
      return;
    }

    this.value.set(value);
  }

  /**
   * Notifica touch únicamente cuando el foco sale de todo el grupo.
   */
  onFocusOut(event: FocusEvent): void {
    const container = event.currentTarget as HTMLElement;
    const nextFocusedElement = event.relatedTarget as Node | null;

    if (!nextFocusedElement || !container.contains(nextFocusedElement)) {
      this.touch.emit();
    }
  }
}
