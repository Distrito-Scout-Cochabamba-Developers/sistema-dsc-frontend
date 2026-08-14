/**
 * Tarjeta genérica de estado de error/aviso con CTA opcional (presentational).
 * Vive en `shared`; agnóstica al dominio — cualquier feature puede usarla
 * para pantallas de "enlace inválido", "no encontrado", etc.
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-state-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="rounded-2xl border border-danger/30 bg-danger-soft p-6 text-danger">
      <h1 class="text-xl font-bold">{{ title() }}</h1>
      <p class="mt-2 text-sm"><ng-content /></p>
      @if (ctaLabel(); as label) {
        <a
          [routerLink]="ctaLink()"
          class="mt-4 inline-block text-sm font-semibold text-dsc no-underline"
        >
          {{ label }}
        </a>
      }
    </section>
  `,
})
export class StateCard {
  /** Título de la tarjeta. */
  readonly title = input.required<string>();

  /** Etiqueta del CTA; si se omite, no se muestra el enlace. */
  readonly ctaLabel = input<string>();

  /** Ruta destino del CTA. */
  readonly ctaLink = input<string>('/');
}
