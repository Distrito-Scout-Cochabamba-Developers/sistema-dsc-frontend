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
 * Conmutador binario para activar o desactivar configuraciones.
 *
 * Implementa FormCheckboxControl para integrarse con Angular Signal Forms.
 * Permite controlar el estado, la interacción y el foco.
 */
@Component({
  selector: 'app-toggle',
  standalone: true,
  templateUrl: './toggle.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class ToggleComponent implements FormCheckboxControl {

  /** Nombre de la configuración. */
  readonly label = input.required<string>();

  /** Descripción de la configuración. */
  readonly description = input<string>('');

  /** Estado actual del conmutador. */
  readonly checked = model<boolean>(false);

  /** Indica si el conmutador está deshabilitado. */
  readonly disabled = input<boolean>(false);

  /** Indica si la selección es obligatoria. */
  readonly required = input<boolean>(false);

  /** Estado de interacción del control. */
  readonly touched = input<boolean>(false);

  /** Notifica cuando el control pierde el foco. */
  readonly touch = output<void>();

  /** Referencia al botón del conmutador. */
  private readonly toggleElement =
    viewChild.required<ElementRef<HTMLButtonElement>>('toggleElement');

  /**
   * Alterna el estado del conmutador.
   */
  toggle(): void {
    if (!this.disabled()) {
      this.checked.update(value => !value);
    }
  }

  /**
   * Notifica que el usuario salió del control.
   */
  onBlur(): void {
    this.touch.emit();
  }

  /**
   * Coloca el foco en el conmutador.
   */
  focus(options?: FocusOptions): void {
    this.toggleElement().nativeElement.focus(options);
  }
}
