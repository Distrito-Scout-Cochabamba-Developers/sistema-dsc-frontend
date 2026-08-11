/**
 * Lista resumen clave/valor (presentational, sin lógica de negocio).
 * Vive en `shared`; agnóstica al dominio — cualquier feature con una
 * pantalla de confirmación/resumen puede reusarla.
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Un par clave/valor a mostrar en la lista. */
export interface SummaryItem {
  readonly label: string;
  readonly value: string;
}

@Component({
  selector: 'app-summary-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dl class="space-y-3 rounded-xl bg-surface p-4 text-sm">
      @for (item of items(); track item.label) {
        <div class="flex justify-between gap-4">
          <dt class="text-muted">{{ item.label }}</dt>
          <dd class="font-semibold text-ink">{{ item.value }}</dd>
        </div>
      }
      <ng-content />
    </dl>
  `,
})
export class SummaryList {
  /** Pares clave/valor a renderizar en orden. */
  readonly items = input.required<readonly SummaryItem[]>();
}
