
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core';

/**
 * Conmutador binario para activar o desactivar configuraciones.
 *
 * El estado es controlado externamente por el componente padre.
 */
@Component({
  selector: 'app-toggle',
  standalone: true,
  templateUrl: './toggle.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleComponent {

  /** Nombre de la configuración. */
  readonly label = input.required<string>();

  /** Descripción de la configuración. */
  readonly description = input<string>('');

  /** Estado actual del conmutador. */
  readonly checked = input<boolean>(false);

  /** Indica si el conmutador está deshabilitado. */
  readonly disabled = input<boolean>(false);

  /** Notifica el nuevo estado. */
  readonly checkedChange = output<boolean>();

  /**
   * Alterna el estado del conmutador.
   */
  toggle(): void {
    if (!this.disabled()) {
      this.checkedChange.emit(!this.checked());
    }
  }
}
