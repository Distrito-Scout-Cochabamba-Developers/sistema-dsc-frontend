
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  output,
  viewChild
} from '@angular/core';

export type ButtonVariant =
  | 'solid'
  | 'outline'
  | 'text'
  | 'secondary';

export type ButtonColor =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'success';

export type ButtonSize =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg';

export type ButtonType =
  | 'button'
  | 'submit'
  | 'reset';

@Component({
  selector: 'app-button',
  standalone: true,
  templateUrl: './button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-block',
    '[class.block]': 'fullWidth()',
    '[class.w-full]': 'fullWidth()',
  },
})
export class ButtonComponent {
  // Texto visible del botón.
  readonly label = input<string>('');

  // Variante visual.
  readonly variant = input<ButtonVariant>('solid');

  // Color semántico.
  readonly color = input<ButtonColor>('primary');

  // Tamaño del botón.
  readonly size = input<ButtonSize>('md');

  // Comportamiento.
  readonly type = input<ButtonType>('button');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly fullWidth = input<boolean>(false);

  // Accesibilidad para botones sin texto visible.
  readonly ariaLabel = input<string>('');

  // Estado de disclosure (menús, paneles): `aria-expanded` y `aria-controls`.
  readonly ariaExpanded = input<boolean | null>(null);
  readonly ariaControls = input<string>('');

  // Botón conmutable (p. ej. selector de vista): `aria-pressed`. `null` lo omite.
  readonly ariaPressed = input<boolean | null>(null);

  // Evento de clic.
  readonly clicked = output<MouseEvent>();

  // Botón nativo, para devolver el foco desde el componente padre.
  private readonly nativeButton = viewChild.required<ElementRef<HTMLButtonElement>>('nativeButton');

  // Clases base compartidas por todas las variantes.
  private readonly baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed';

  // Clases de tamaño.
  private readonly sizeClasses: Record<ButtonSize, string> = {
    xs: 'min-h-7 px-2.5 py-1 text-xs',
    sm: 'min-h-8 px-3 py-1.5 text-sm',
    md: 'min-h-10 px-4 py-2 text-sm',
    lg: 'min-h-12 px-5 py-2.5 text-base'
  };

  // Clases por variante y color. El azul primario de texto y fondo es `dsc-primary-hover`
  // (#006a9b, 5,9:1 con blanco): `dsc-primary` (#009ee2) solo llega a 3:1 y queda para bordes.
  private readonly variantClasses: Record<
    ButtonVariant,
    Record<ButtonColor, string>
  > = {
    solid: {
      primary:
        'bg-dsc-primary-hover text-white hover:bg-dsc-dark focus-visible:ring-sky-500 disabled:bg-sky-200 disabled:text-white',
      secondary:
        'bg-dsc-secondary text-white hover:bg-yellow-700 focus-visible:ring-yellow-500 disabled:bg-yellow-200 disabled:text-yellow-500',
      danger:
        'bg-[#BA1A1A] text-white hover:bg-red-800 focus-visible:ring-red-500 disabled:bg-red-200 disabled:text-white',
      success:
        'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500 disabled:bg-emerald-200 disabled:text-white'
    },

    outline: {
      primary:
        'border border-dsc-primary bg-transparent text-dsc-primary-hover hover:bg-sky-50 focus-visible:ring-sky-500 disabled:border-slate-200 disabled:text-slate-400',
      secondary:
        'border border-dsc-secondary bg-transparent text-dsc-secondary hover:bg-yellow-100 focus-visible:ring-yellow-500 disabled:border-yellow-200 disabled:text-yellow-400',
      danger:
        'border border-[#BA1A1A] bg-transparent text-[#BA1A1A] hover:bg-red-50 focus-visible:ring-red-500 disabled:border-red-200 disabled:text-red-300',
      success:
        'border border-emerald-600 bg-transparent text-emerald-700 hover:bg-emerald-50 focus-visible:ring-emerald-500 disabled:border-emerald-200 disabled:text-emerald-300'
    },

    text: {
      primary:
        'bg-transparent text-dsc-primary-hover hover:bg-sky-50 focus-visible:ring-sky-500 disabled:text-slate-400',
      secondary:
        'bg-transparent text-dsc-secondary hover:bg-yellow-100 focus-visible:ring-yellow-500 disabled:text-yellow-400',
      danger:
        'bg-transparent text-[#BA1A1A] hover:bg-red-50 focus-visible:ring-red-500 disabled:text-red-300',
      success:
        'bg-transparent text-emerald-700 hover:bg-emerald-50 focus-visible:ring-emerald-500 disabled:text-emerald-300'
    },

    secondary: {
      primary:
        'bg-sky-100 text-sky-800 hover:bg-sky-200 focus-visible:ring-sky-500 disabled:bg-slate-100 disabled:text-slate-400',
      secondary:
        'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 focus-visible:ring-yellow-500 disabled:bg-yellow-100 disabled:text-yellow-400',
      danger:
        'bg-red-100 text-red-800 hover:bg-red-200 focus-visible:ring-red-500 disabled:bg-red-50 disabled:text-red-300',
      success:
        'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 focus-visible:ring-emerald-500 disabled:bg-emerald-50 disabled:text-emerald-300'
    }
  };

  // Calcula las clases según las propiedades recibidas.
  readonly buttonClasses = computed(() => {
    const widthClass = this.fullWidth() ? 'w-full' : '';

    return [
      this.baseClasses,
      this.sizeClasses[this.size()],
      this.variantClasses[this.variant()][this.color()],
      widthClass
    ].filter(Boolean).join(' ');
  });

  // Evita interacciones mientras está deshabilitado o cargando.
  readonly isDisabled = computed(() => {
    return this.disabled() || this.loading();
  });

  /** Mueve el foco al botón nativo (p. ej. al cerrar un menú con Escape). */
  focus(): void {
    this.nativeButton().nativeElement.focus();
  }

  onClick(event: MouseEvent): void {
    if (this.isDisabled()) {
      return;
    }

    this.clicked.emit(event);
  }
}
