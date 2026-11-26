
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  model,
  output,
  viewChild
} from '@angular/core';

import { FormValueControl } from '@angular/forms/signals';

/**
 * Campo de texto multilínea reutilizable.
 *
 * Implementa FormValueControl para integrarse con Angular Signal Forms.
 * Permite controlar su contenido, longitud máxima, estado y foco.
 */
@Component({
  selector: 'app-textarea',
  standalone: true,
  templateUrl: './textarea.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class TextareaComponent implements FormValueControl<string> {

  /** Identificador único del control interno. */
  readonly inputId = input.required<string>();

  /** Etiqueta del campo. */
  readonly label = input.required<string>();

  /** Contenido actual del campo. */
  readonly value = model<string>('');

  /** Cantidad máxima de caracteres. */
  readonly maxLength = input<number | undefined>(300);

  /** Número de filas iniciales. */
  readonly rows = input<number>(4);

  /** Texto de ayuda. */
  readonly hint = input<string>('');

  /** Placeholder del campo. */
  readonly placeholder = input<string>('Escribe aquí...');

  /** Indica si el campo es obligatorio. */
  readonly required = input<boolean>(false);

  /** Indica si el campo está deshabilitado. */
  readonly disabled = input<boolean>(false);

  /** Estado de interacción del control. */
  readonly touched = input<boolean>(false);

  /** Notifica cuando el control pierde el foco. */
  readonly touch = output<void>();

  /** Referencia al elemento textarea del DOM. */
  private readonly textareaElement =
    viewChild.required<ElementRef<HTMLTextAreaElement>>('textareaElement');

  /** Calcula la cantidad de caracteres utilizados. */
  readonly characterCount = computed(
    () => this.value().length
  );

  /** Indica si se superó el límite de caracteres. */
  readonly exceedsMaxLength = computed(() => {
    const limit = this.maxLength();

    return limit !== undefined && this.characterCount() > limit;
  });

  /**
   * Actualiza el valor del control cuando el usuario escribe.
   */
  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.value.set(target.value);
  }

  /**
   * Notifica que el usuario salió del control.
   */
  onBlur(): void {
    this.touch.emit();
  }

  /**
   * Coloca el foco en el textarea.
   */
  focus(options?: FocusOptions): void {
    this.textareaElement().nativeElement.focus(options);
  }
}
