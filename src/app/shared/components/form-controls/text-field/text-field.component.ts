
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  model,
  output,
  signal,
  viewChild
} from '@angular/core';

import { FormValueControl } from '@angular/forms/signals';

/**
 * Estados visuales disponibles para el campo.
 */
export type TextFieldStatus =
  | 'default'
  | 'success'
  | 'warning'
  | 'error';

/**
 * Tipos de iconografía que pueden acompañar al campo.
 */
export type TextFieldIcon =
  | 'search'
  | 'at'
  | 'key'
  | 'building'
  | 'lock'
  | 'info'
  | 'ban'
  | 'eye';

/**
 * Componente de entrada de texto reutilizable.
 *
 * Permite representar diferentes variantes de campos:
 * texto, búsqueda, correo, contraseña y valores monetarios.
 *
 * Implementa FormValueControl para integrarse con Signal Forms.
 *
 * También permite su utilización independiente mediante
 * model() y el enlace bidireccional [(value)].
 */
@Component({
  selector: 'app-text-field',
  standalone: true,
  templateUrl: './text-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextFieldComponent implements FormValueControl<string> {

  // ==========================================
  // IDENTIFICACIÓN Y CONTENIDO
  // ==========================================

  /** Identificador HTML único del elemento input interno. */
  readonly inputId = input.required<string>();

  /** Etiqueta descriptiva del campo. */
  readonly label = input.required<string>();

  /** Valor sincronizado con Signal Forms. */
  readonly value = model<string>('');

  /** Texto mostrado cuando el campo está vacío. */
  readonly placeholder = input<string>('');

  /** Descripción o mensaje de ayuda. */
  readonly hint = input<string>('');

  // ==========================================
  // CONFIGURACIÓN
  // ==========================================

  /** Tipo de entrada HTML. */
  readonly type = input<
    'text' | 'email' | 'password' | 'search'
  >('text');

  /** Indica si el campo es obligatorio. */
  readonly required = input<boolean>(false);

  /** Impide modificar el contenido. */
  readonly readonlyMode = input<boolean>(false);

  /** Deshabilita completamente el campo. */
  readonly disabled = input<boolean>(false);

  /** Cantidad máxima de caracteres. */
  readonly maxLength = input<number | undefined>(undefined);

  // ==========================================
  // ESTADO DE SIGNAL FORMS
  // ==========================================

  /** Indica si el campo ya fue visitado. */
  readonly touched = input<boolean>(false);

  /** Notifica cuando el usuario abandona el control. */
  readonly touch = output<void>();

  // ==========================================
  // APARIENCIA
  // ==========================================

  /** Estado visual del campo. */
  readonly status = input<TextFieldStatus>('default');

  /** Etiqueta de estado opcional. */
  readonly statusLabel = input<string>('');

  /** Fuerza la apariencia visual de foco para documentación. */
  readonly focusedDemo = input<boolean>(false);

  /** Icono ubicado a la izquierda. */
  readonly leadingIcon = input<TextFieldIcon | null>(null);

  /** Icono ubicado a la derecha. */
  readonly trailingIcon = input<TextFieldIcon | null>(null);

  /** Texto ubicado antes del valor. */
  readonly prefix = input<string>('');

  /** Texto ubicado después del valor. */
  readonly suffix = input<string>('');

  // ==========================================
  // REFERENCIA AL CONTROL INTERNO
  // ==========================================

  /** Referencia al input HTML interno. */
  private readonly inputElement =
    viewChild.required<ElementRef<HTMLInputElement>>('inputElement');

  // ==========================================
  // ESTADO INTERNO DE PRESENTACIÓN
  // ==========================================

  /** Controla la visibilidad de una contraseña. */
  readonly passwordVisible = signal(false);

  /** Calcula el tipo HTML efectivo del input. */
  readonly effectiveType = computed(() => {
    if (
      this.type() === 'password' &&
      this.passwordVisible()
    ) {
      return 'text';
    }

    return this.type();
  });

  /** Indica si el campo permite alternar visibilidad. */
  readonly hasPasswordToggle = computed(
    () => this.type() === 'password'
  );

  // ==========================================
  // MÉTODOS
  // ==========================================

  /**
   * Actualiza el valor del campo.
   */
  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
  }

  /**
   * Notifica que el usuario abandonó el campo.
   */
  onBlur(): void {
    this.touch.emit();
  }

  /**
   * Enfoca el input interno.
   */
  focus(options?: FocusOptions): void {
    this.inputElement().nativeElement.focus(options);
  }

  /**
   * Alterna la visibilidad de la contraseña.
   */
  togglePasswordVisibility(): void {
    this.passwordVisible.update(value => !value);
  }
}
