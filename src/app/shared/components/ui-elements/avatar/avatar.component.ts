
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal
} from '@angular/core';

/** Tamaños disponibles para el avatar. */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** Formas disponibles para el contenedor del avatar. */
export type AvatarShape = 'circle' | 'square';

/**
 * Estados de disponibilidad que puede representar un avatar.
 *
 * - `online`: usuario conectado.
 * - `offline`: usuario desconectado.
 * - `busy`: usuario ocupado.
 * - `away`: usuario ausente.
 * - `none`: sin indicador de estado.
 */
export type AvatarStatus =
  | 'online'
  | 'offline'
  | 'busy'
  | 'away'
  | 'none';

/**
 * Componente visual para representar personas o usuarios.
 *
 * Permite mostrar una imagen de perfil o, cuando no existe
 * una imagen disponible, utilizar iniciales como alternativa.
 *
 * También permite configurar el tamaño, la forma y el estado
 * de disponibilidad.
 *
 * @example
 * <app-avatar
 *   initials="AV"
 *   size="lg"
 *   status="online"
 * />
 */
@Component({
  selector: 'app-avatar',
  standalone: true,
  templateUrl: './avatar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvatarComponent {

  /** URL de la imagen de perfil. Si está vacía, se muestran las iniciales. */
  readonly src = input<string>('');

  /** Texto alternativo de la imagen y nombre accesible del avatar. */
  readonly alt = input<string>('Avatar');

  /** Iniciales que se muestran cuando no hay una imagen disponible. */
  readonly initials = input<string>('US');

  /** Tamaño visual del avatar. */
  readonly size = input<AvatarSize>('md');

  /** Forma del contenedor: circular o cuadrada. */
  readonly shape = input<AvatarShape>('circle');

  /** Estado de disponibilidad representado mediante un indicador. */
  readonly status = input<AvatarStatus>('none');

  /** Indica si la última carga de imagen falló. */
  readonly imageFailed = signal(false);

  /** Clases TailwindCSS asociadas a cada tamaño. */
  private readonly sizeClasses: Record<AvatarSize, string> = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg'
  };

  /** Clases TailwindCSS asociadas a cada estado de disponibilidad. */
  private readonly statusColors: Record<
    Exclude<AvatarStatus, 'none'>,
    string
  > = {
    online: 'bg-emerald-500',
    offline: 'bg-slate-400',
    busy: 'bg-red-500',
    away: 'bg-amber-500'
  };

  /**
   * Calcula las clases visuales del avatar.
   *
   * Combina el tamaño y la forma configurados mediante los inputs.
   */
  readonly avatarClasses = computed(() => [
    'relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-sky-100 font-semibold text-sky-800',
    this.sizeClasses[this.size()],
    this.shape() === 'circle' ? 'rounded-full' : 'rounded-lg'
  ].join(' '));

  /**
   * Obtiene las clases visuales del indicador de disponibilidad.
   *
   * Devuelve una cadena vacía cuando no se configura un estado.
   */
  readonly statusClass = computed(() => {
    const currentStatus = this.status();

    if (currentStatus === 'none') {
      return '';
    }

    return [
      'absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-white',
      this.statusColors[currentStatus]
    ].join(' ');
  });

  /**
   * Determina si se debe mostrar la imagen de perfil.
   *
   * La imagen se muestra únicamente cuando existe una URL
   * y su carga no ha fallado.
   */
  readonly showImage = computed(() => {
    return !!this.src() && !this.imageFailed();
  });

  /**
   * Maneja los errores durante la carga de la imagen.
   *
   * Activa el uso de las iniciales como alternativa visual.
   */
  onImageError(): void {
    this.imageFailed.set(true);
  }

  /**
   * Restablece el estado de error de la imagen.
   *
   * Debe invocarse cuando se proporciona una nueva fuente
   * después de un error de carga.
   */
  onSourceChange(): void {
    this.imageFailed.set(false);
  }
}
