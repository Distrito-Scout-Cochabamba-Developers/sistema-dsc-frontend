/**
 * Pantalla de confirmación tras registrar la asistencia.
 * Compone el `SummaryList` genérico de `shared` con los datos del registro.
 */
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { RegistroAsistenciaResult } from '@core/models/asistencia.models';
import { SummaryItem, SummaryList } from '@shared/components/summary-list';

@Component({
  selector: 'app-asistencia-success',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SummaryList],
  template: `
    <section
      class="mx-auto max-w-xl rounded-2xl border border-border bg-elevated p-8 shadow-md"
      role="status"
    >
      <p
        class="mb-4 inline-flex items-center gap-2 rounded-full bg-dsc-soft px-3 py-1 text-xs font-bold tracking-wide text-dsc-dark"
      >
        ✓ ASISTENCIA CONFIRMADA
      </p>
      <h1 class="text-headline-lg font-bold text-ink md:text-headline-lg-desktop">Registro exitoso</h1>
      <p class="mt-3 text-muted">
        {{ result().participantName }}, tu asistencia quedó registrada.
      </p>
      <app-summary-list class="mt-6 block" [items]="summaryItems()">
        @if (result().estado === 'parcial') {
          <div class="rounded-lg bg-warning-bg px-3 py-2 text-warning-ink">
            Registro parcial: tus datos se guardaron para completar el perfil
            más adelante en el sistema.
          </div>
        }
      </app-summary-list>
      <a
        routerLink="/"
        class="mt-6 inline-flex rounded-lg bg-dsc px-5 py-3 text-sm font-bold text-white no-underline hover:bg-dsc-dark"
      >
        Ir al inicio
      </a>
    </section>
  `,
})
export class AsistenciaSuccess {
  /** Confirmación devuelta por el registro de asistencia. */
  readonly result = input.required<RegistroAsistenciaResult>();

  protected readonly summaryItems = computed<SummaryItem[]>(() => {
    const r = this.result();
    return [
      { label: 'Módulo', value: r.moduleSummary },
      { label: 'Fecha', value: r.sessionDate },
      { label: 'Hora', value: r.sessionTime },
    ];
  });
}
