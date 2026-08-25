import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ModuleManagementService } from '../services/module-management.service';

/**
 * Vista de gestión de módulos: busca y lista módulos-evento para que la
 * Secretaría seleccione uno y gestione su asistencia (criterio 1).
 */
@Component({
  selector: 'app-module-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <h1 class="text-headline-xl font-bold tracking-tight text-ink md:text-headline-xl-desktop">Gestión de Módulos</h1>
      <p class="mt-2 max-w-2xl text-body text-muted">
        Busca un módulo-evento para registrar o corregir la asistencia de sus participantes.
      </p>

      <input
        type="search"
        placeholder="Buscar por nombre o código de módulo…"
        class="mt-6 w-full rounded-xl border border-border bg-elevated px-4 py-3 text-ink outline-none ring-dsc/30 placeholder:text-muted/60 focus:ring-2"
        [value]="query()"
        (input)="query.set($any($event.target).value)"
      />

      <ul class="mt-6 space-y-3">
        @for (module of modules(); track module.id) {
          <li>
            <a
              [routerLink]="[module.id]"
              class="flex items-center justify-between rounded-2xl border border-border bg-elevated p-5 shadow-md no-underline hover:ring-2 hover:ring-dsc/30"
            >
              <div>
                <p class="font-bold text-ink">{{ module.moduleTitle }}</p>
                <p class="mt-1 text-sm text-muted">{{ module.dateLabel }} · {{ module.participantsCount }} participantes</p>
              </div>
              @if (!module.isRegistrationOpen) {
                <span class="rounded-full bg-warning-bg px-3 py-1 text-xs font-semibold text-warning-ink">
                  Cerrado
                </span>
              }
            </a>
          </li>
        } @empty {
          <li class="rounded-2xl border border-border bg-elevated p-5 text-center text-muted">
            No se encontraron módulos con ese criterio.
          </li>
        }
      </ul>
    </div>
  `,
})
export class ModuleListPage {
  private readonly moduleManagement = inject(ModuleManagementService);

  protected readonly query = signal('');
  protected readonly modules = this.moduleManagement.searchModules(this.query);
}
