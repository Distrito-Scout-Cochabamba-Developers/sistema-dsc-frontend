import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  model,
  output,
  signal,
  viewChild
} from '@angular/core';

import { FormValueControl } from '@angular/forms/signals';

/**
 * Campo de entrada para administrar una colección de etiquetas.
 *
 * Implementa FormValueControl para integrarse con Angular Signal Forms.
 * Permite agregar y eliminar etiquetas, evitando duplicados y
 * respetando la cantidad máxima permitida.
 */
@Component({
  selector: 'app-tag-input',
  standalone: true,
  templateUrl: './tag-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagInputComponent implements FormValueControl<string[]> {

  /** Identificador único del control interno. */
  readonly inputId = input.required<string>();

  /**
   * Colección de etiquetas.
   *
   * El alias conserva la API anterior:
   * [tags] y (tagsChange).
   */
  readonly value = model<string[]>([], { alias: 'tags' });

  /** Texto de referencia del campo. */
  readonly label = input.required<string>();

  /** Placeholder del campo de entrada. */
  readonly placeholder = input<string>('Añadir...');

  /** Texto de ayuda. */
  readonly hint = input<string>('');

  /** Indica si el campo está deshabilitado. */
  readonly disabled = input<boolean>(false);

  /** Indica si el campo es obligatorio. */
  readonly required = input<boolean>(false);

  /** Estado de interacción del control. */
  readonly touched = input<boolean>(false);

  /** Cantidad máxima de etiquetas permitidas. */
  readonly maxTags = input<number>(10);

  /** Notifica cuando el control pierde el foco. */
  readonly touch = output<void>();

  /** Texto temporal que está escribiendo el usuario. */
  readonly draft = signal('');

  /** Referencia al input interno. */
  private readonly inputElement =
    viewChild.required<ElementRef<HTMLInputElement>>('inputElement');

  /** Indica si todavía se pueden agregar etiquetas. */
  readonly canAddTag = () =>
    !this.disabled() && this.value().length < this.maxTags();

  /**
   * Actualiza el texto temporal.
   */
  updateDraft(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.draft.set(target.value);
  }

  /**
   * Agrega una nueva etiqueta si es válida y no existe previamente.
   */
  addTag(): void {
    const newTag = this.draft().trim();

    if (
      !newTag ||
      !this.canAddTag() ||
      this.value().some(
        tag => tag.trim().toLowerCase() === newTag.toLowerCase()
      )
    ) {
      return;
    }

    this.value.update(tags => [...tags, newTag]);
    this.draft.set('');
  }

  /**
   * Elimina una etiqueta por su posición.
   */
  removeTag(index: number): void {
    if (this.disabled()) {
      return;
    }

    this.value.update(tags =>
      tags.filter((_, currentIndex) => currentIndex !== index)
    );
  }

  /**
   * Agrega una etiqueta al presionar Enter.
   */
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTag();
    }
  }

  /**
   * Notifica que el usuario salió del control.
   */
  onBlur(): void {
    this.touch.emit();
  }

  /**
   * Coloca el foco en el campo de entrada.
   */
  focus(options?: FocusOptions): void {
    this.inputElement().nativeElement.focus(options);
  }
}
