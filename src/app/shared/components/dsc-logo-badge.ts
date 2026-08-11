/**
 * Insignia circular del logo "DSC" (presentational, sin lógica de negocio).
 * Vive en `shared`; agnóstica al dominio, controlada solo por `size`.
 */
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-dsc-logo-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="grid place-items-center rounded-full bg-dsc-navy font-bold text-white"
      [class]="sizeClasses()"
      aria-hidden="true"
    >
      DSC
    </span>
  `,
})
export class DscLogoBadge {
  readonly size = input<'sm' | 'md'>('md');

  protected readonly sizeClasses = computed(() =>
    this.size() === 'sm' ? 'size-8 text-caption' : 'size-9 text-xs',
  );
}
