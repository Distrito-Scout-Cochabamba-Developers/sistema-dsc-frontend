/**
 * Shell estructural de la aplicación (navbar + área de contenido).
 * Sin lógica de negocio; solo composición de layout y `router-outlet`.
 */
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterOutlet],
  template: `
    <div class="grid min-h-dvh grid-rows-[auto_1fr_auto] bg-surface text-ink">
      <header class="border-b border-border px-6 py-4">
        <a class="font-bold tracking-wide text-ink no-underline" routerLink="/">Sistema DSC</a>
      </header>
      <main class="p-6">
        <router-outlet />
      </main>
      <footer class="border-t border-border px-6 py-4 text-sm text-muted">
        <span>Sistema DSC Frontend</span>
      </footer>
    </div>
  `,
})
export class MainLayout {}
