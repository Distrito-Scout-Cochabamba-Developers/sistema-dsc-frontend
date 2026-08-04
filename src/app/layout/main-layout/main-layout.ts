/**
 * Shell DSC: navbar, contenido y footer alineados al diseño de asistencia.
 * Sin lógica de negocio; solo composición estructural.
 */
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthSessionService } from '@core/services/auth-session.service';

@Component({
  selector: 'app-main-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="grid min-h-dvh grid-rows-[auto_1fr_auto] bg-surface text-ink">
      <header class="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur">
        <div
          class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6"
        >
          <a class="flex items-center gap-2 no-underline" routerLink="/">
            <span
              class="grid size-9 place-items-center rounded-full bg-dsc-navy text-xs font-bold tracking-wide text-white"
              aria-hidden="true"
            >
              DSC
            </span>
            <span class="text-lg font-bold text-dsc-navy">DSC</span>
          </a>

          <nav class="hidden items-center gap-6 text-sm font-medium text-muted md:flex" aria-label="Principal">
            <a
              routerLink="/"
              routerLinkActive="text-dsc border-b-2 border-dsc"
              [routerLinkActiveOptions]="{ exact: true }"
              class="border-b-2 border-transparent pb-0.5 text-ink no-underline hover:text-dsc"
            >
              Inicio
            </a>
            <a class="cursor-default border-b-2 border-transparent pb-0.5 text-ink/50 no-underline">
              Calendario
            </a>
            <a
              routerLink="/asistencia/mod-liderazgo-20241024"
              routerLinkActive="text-dsc border-b-2 border-dsc"
              class="border-b-2 border-transparent pb-0.5 text-ink no-underline hover:text-dsc"
            >
              Módulos
            </a>
            <a class="cursor-default border-b-2 border-transparent pb-0.5 text-ink/50 no-underline">
              Mapa
            </a>
          </nav>

          <button
            type="button"
            class="rounded-lg bg-dsc-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-dsc-dark"
            (click)="onAuthClick()"
          >
            {{ auth.isAuthenticated() ? 'Cerrar sesión' : 'Iniciar Sesión' }}
          </button>
        </div>
      </header>

      <main class="min-w-0">
        <router-outlet />
      </main>

      <footer class="border-t border-border bg-white">
        <div class="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3 md:px-6">
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <span
                class="grid size-8 place-items-center rounded-full bg-dsc-navy text-[10px] font-bold text-white"
              >
                DSC
              </span>
              <span class="font-bold text-dsc-navy">DSC</span>
            </div>
            <p class="max-w-xs text-sm leading-relaxed text-muted">
              Plataforma integral para la gestión de membresía, formación y
              actividades del Distrito Scout.
            </p>
          </div>

          <div>
            <h2 class="mb-3 text-sm font-bold text-ink">Enlaces Rápidos</h2>
            <ul class="space-y-2 text-sm text-muted">
              <li>Sobre Nosotros</li>
              <li>Contacto</li>
              <li>Términos de Uso</li>
            </ul>
          </div>

          <div>
            <h2 class="mb-3 text-sm font-bold text-ink">Legal</h2>
            <ul class="space-y-2 text-sm text-muted">
              <li>Privacidad</li>
              <li>Políticas de Datos</li>
            </ul>
          </div>
        </div>

        <div
          class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-4 text-xs text-muted md:px-6"
        >
          <span>© 2024 Scout Organization. Siempre Listos.</span>
          <span class="tracking-wide">DSC · Formación</span>
        </div>
      </footer>
    </div>
  `,
})
export class MainLayout {
  /** Sesión mock para demostrar login / logout en el shell. */
  protected readonly auth = inject(AuthSessionService);

  /**
   * Alterna sesión demo (Iniciar / Cerrar) sin backend.
   */
  protected onAuthClick(): void {
    if (this.auth.isAuthenticated()) {
      this.auth.clearSession();
      return;
    }
    this.auth.restoreDemoSession();
  }
}
