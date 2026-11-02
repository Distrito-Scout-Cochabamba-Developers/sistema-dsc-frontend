
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal
} from '@angular/core';

/**
 * Campo de entrada para administrar una colección de etiquetas.
 *
 * La colección pertenece al componente padre.
 * Este componente solamente gestiona el texto temporal
 * y emite las nuevas colecciones de etiquetas.
 */
@Component({
  selector: 'app-tag-input',
  standalone: true,
  templateUrl: './tag-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagInputComponent {

  /** Etiquetas actuales. */
  readonly tags = input<string[]>([]);

  /** Texto de referencia del campo. */
  readonly label = input.required<string>();

  /** Placeholder del campo de entrada. */
  readonly placeholder = input<string>('Añadir...');

  /** Texto de ayuda. */
  readonly hint = input<string>('');

  /** Deshabilita las interacciones. */
  readonly disabled = input<boolean>(false);

  /** Cantidad máxima de etiquetas permitidas. */
  readonly maxTags = input<number>(10);

  /** Texto temporal que está escribiendo el usuario. */
  readonly draft = signal('');

  /** Notifica los cambios en la colección. */
  readonly tagsChange = output<string[]>();

  /**
   * Actualiza el texto temporal.
   */
  updateDraft(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.draft.set(target.value);
  }

  /**
   * Agrega una nueva etiqueta si no existe previamente.
   */
  addTag(): void {
    const newTag = this.draft().trim();

    if (
      !newTag ||
      this.disabled() ||
      this.tags().length >= this.maxTags() ||
      this.tags().some(
        tag => tag.toLowerCase() === newTag.toLowerCase()
      )
    ) {
      return;
    }

    this.tagsChange.emit([...this.tags(), newTag]);
    this.draft.set('');
  }

  /**
   * Elimina una etiqueta por su posición.
   */
  removeTag(index: number): void {
    if (this.disabled()) {
      return;
    }

    this.tagsChange.emit(
      this.tags().filter((_, currentIndex) => currentIndex !== index)
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
}
