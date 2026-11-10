
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output
} from '@angular/core';

/**
 * Campo de texto multilinea reutilizable.
 *
 * El contenido y sus límites son controlados desde el padre.
 */
@Component({
  selector: 'app-textarea',
  standalone: true,
  templateUrl: './textarea.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // `id` es el input del <textarea> interno; no duplicarlo en el host.
    '[attr.id]': 'null',
  },
})
export class TextareaComponent {

  /** Identificador HTML opcional del `<textarea>`. */
  readonly id = input<string>('');

  /** Etiqueta del campo. */
  readonly label = input.required<string>();

  /** Contenido actual del campo. */
  readonly value = input<string>('');

  /** Cantidad máxima de caracteres. */
  readonly maxLength = input<number>(300);

  /** Número de filas iniciales. */
  readonly rows = input<number>(4);

  /** Texto de ayuda. */
  readonly hint = input<string>('');

  /** Placeholder del campo. */
  readonly placeholder = input<string>('Escribe aquí...');

  /** Deshabilita la entrada. */
  readonly disabled = input<boolean>(false);

  /** Notifica el nuevo contenido. */
  readonly valueChange = output<string>();

  /** Calcula la cantidad de caracteres utilizados. */
  readonly characterCount = computed(
    () => this.value().length
  );

  /**
   * Emite el contenido actualizado.
   */
  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.valueChange.emit(target.value);
  }
}
