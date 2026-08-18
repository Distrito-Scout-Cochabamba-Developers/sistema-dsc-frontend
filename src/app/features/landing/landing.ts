/**
 * Página landing (inicio) con acceso al registro de asistencia demo.
 */
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="mx-auto grid max-w-3xl gap-6 px-4 py-12 md:px-6">
      <p
        class="w-fit rounded-full bg-dsc-soft px-3 py-1 text-xs font-bold tracking-wide text-dsc-dark"
      >
        SISTEMA DSC
      </p>
      <h1 class="m-0 text-headline-xl font-bold tracking-tight text-ink md:text-headline-xl-desktop">
        {{ title() }}
      </h1>
      <p class="m-0 max-w-xl text-body text-muted">
        {{ subtitle() }}
      </p>
      <a
        class="inline-flex w-fit items-center justify-center rounded-xl bg-dsc px-5 py-3 text-sm font-bold text-white no-underline hover:bg-dsc-dark"
        routerLink="/asistencia/mod-liderazgo-20241024"
      >
        Abrir registro de asistencia (demo QR)
      </a>
      <p class="text-xs text-muted">
        Deep link de ejemplo:
        <code class="rounded bg-elevated px-1.5 py-0.5 text-dsc-dark">
          /asistencia/mod-liderazgo-20241024
        </code>
      </p>
    </section>
  `,
})
export class Landing {
  /** Título visible de la landing interna. */
  protected readonly title = signal('Sistema DSC');

  /** Texto de apoyo de la vista inicial. */
  protected readonly subtitle = signal(
        'Registro digital de asistencia a módulos. Requiere la API DSC en marcha para lookup y persistencia.',
  );
}
