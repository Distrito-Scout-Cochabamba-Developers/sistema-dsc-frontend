
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal
} from '@angular/core';

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
 * Es un componente Dumb:
 * - Recibe su configuración mediante inputs.
 * - Emite cambios mediante outputs.
 * - No contiene lógica de negocio.
 */
@Component({
  selector: 'app-text-field',
  standalone: true,
  templateUrl: './text-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // `id` es el input del <input> interno; no duplicarlo en el host.
    '[attr.id]': 'null',
  },
})
export class TextFieldComponent {

  // ==========================================
  // IDENTIFICACIÓN Y CONTENIDO
  // ==========================================

  /** Identificador HTML único del campo. */
  readonly id = input.required<string>();

  /** Etiqueta descriptiva del campo. */
  readonly label = input.required<string>();

  /** Valor actual del campo. */
  readonly value = input<string>('');

  /** Texto mostrado cuando el campo está vacío. */
  readonly placeholder = input<string>('');

  /** Descripción o mensaje de ayuda. */
  readonly hint = input<string>('');


  // ==========================================
  // CONFIGURACIÓN
  // ==========================================

  /** Tipo de entrada HTML. */
  readonly type = input<
    'text' | 'email' | 'password' | 'search' | 'tel'
  >('text');

  /** Indica si el campo es obligatorio. */
  readonly required = input<boolean>(false);

  /** Impide modificar el contenido. */
  readonly readonlyMode = input<boolean>(false);

  /** Deshabilita completamente el campo. */
  readonly disabled = input<boolean>(false);

  /** Cantidad máxima de caracteres. */
  readonly maxLength = input<number | null>(null);


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
  // EVENTOS
  // ==========================================

  /** Emite el nuevo valor del campo. */
  readonly valueChange = output<string>();


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
   * Emite el contenido actualizado del campo.
   */
  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }

  /**
   * Alterna la visibilidad de la contraseña.
   */
  togglePasswordVisibility(): void {
    this.passwordVisible.update(value => !value);
  }
}
