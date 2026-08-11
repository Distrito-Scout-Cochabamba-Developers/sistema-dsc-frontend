/**
 * Grupo de enlaces del footer (presentational, sin lógica de negocio).
 * Vive en `shared`; agnóstico al dominio. Los enlaces son solo texto hasta
 * que existan rutas reales (ver `docs/seguimiento.md`, sección Producto).
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-footer-link-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav [attr.aria-label]="heading()">
      <h2 class="mb-3 text-sm font-bold text-ink">{{ heading() }}</h2>
      <ul class="space-y-2 text-sm text-muted">
        @for (label of links(); track label) {
          <li>{{ label }}</li>
        }
      </ul>
    </nav>
  `,
})
export class FooterLinkGroup {
  /** Título del grupo (usado también como `aria-label` del `<nav>`). */
  readonly heading = input.required<string>();

  /** Etiquetas de enlaces del grupo (sin ruta real todavía). */
  readonly links = input.required<readonly string[]>();
}
