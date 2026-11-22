/**
 * Página landing (inicio): acceso a módulos y al calendario de convocatorias.
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
      <div class="flex flex-wrap gap-3">
        <a
          class="inline-flex w-fit items-center justify-center rounded-xl bg-dsc px-5 py-3 text-sm font-bold text-white no-underline hover:bg-dsc-dark"
          routerLink="/modulos"
        >
          Ver módulos e inscribirse
        </a>
        <a
          class="inline-flex w-fit items-center justify-center rounded-xl border border-dsc px-5 py-3 text-sm font-bold text-dsc no-underline hover:bg-dsc-soft"
          routerLink="/calendario"
        >
          Ver calendario
        </a>
      </div>
    </section>
  `,
})
export class Landing {
  /** Título visible de la landing interna. */
  protected readonly title = signal('Sistema DSC');

  /** Texto de apoyo de la vista inicial. */
  protected readonly subtitle = signal(
    'Consulta el calendario de convocatorias o elige un módulo para registrar asistencia.',
  );
}
