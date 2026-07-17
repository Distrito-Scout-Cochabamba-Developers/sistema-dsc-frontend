/**
 * Página landing (inicio) (feature de ejemplo con lazy loading).
 * Contenedor de ruta; estado local vía Signals.
 */
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';

@Component({
  selector: 'app-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="grid max-w-xl gap-3">
      <h1 class="m-0 text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
        {{ title() }}
      </h1>
      <p class="m-0 leading-relaxed text-muted">
        {{ subtitle() }}
      </p>
    </section>
  `,
})
export class Landing {
  /** Título visible de la landing interna. */
  protected readonly title = signal('Sistema DSC');

  /** Texto de apoyo de la vista inicial. */
  protected readonly subtitle = signal(
    'Frontend Angular standalone, TypeScript estricto, Tailwind CSS y arquitectura Core / Shared / Features.',
  );
}
