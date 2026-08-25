import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { StateCard } from '@shared/components/state-card';

import { ParticipantForm } from '../components/participant-form';
import { ParticipantTable } from '../components/participant-table';
import { ModuleManagementService } from '../services/module-management.service';

/**
 * Orquestador de gestión de un módulo-evento: muestra la tabla de
 * participantes (con edición inline, criterio 3) y el formulario de alta
 * manual por CI (criterio 2).
 */
@Component({
  selector: 'app-module-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StateCard, ParticipantForm, ParticipantTable],
  template: `
    <div class="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      @if (moduleEvent(); as module) {
        <p class="mb-3 inline-flex items-center gap-2 rounded-full bg-dsc-soft px-3 py-1 text-xs font-bold tracking-wide text-dsc-dark">
          <span aria-hidden="true">🛡</span>
          GESTIÓN DE MÓDULO
        </p>
        <h1 class="text-headline-xl font-bold tracking-tight text-ink md:text-headline-xl-desktop">
          {{ module.moduleTitle }}
        </h1>
        <p class="mt-2 text-sm text-muted">{{ module.dateLabel }}</p>

        <div class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
          <app-participant-table
            [moduleId]="module.id"
            [participants]="participants()"
            [disabled]="!module.isRegistrationOpen"
          />
          <app-participant-form [moduleId]="module.id" [disabled]="!module.isRegistrationOpen" />
        </div>
      } @else {
        <app-state-card title="Módulo no encontrado" ctaLabel="Volver a la lista" ctaLink="/secretaria">
          El módulo solicitado no existe o fue removido.
        </app-state-card>
      }
    </div>
  `,
})
export class ModuleDetailPage {
  /** Id del módulo-evento (ruta `/secretaria/:moduleEventId`). */
  readonly moduleEventId = input.required<string>();

  private readonly moduleManagement = inject(ModuleManagementService);

  protected readonly moduleEvent = computed(() => this.moduleManagement.getModule(this.moduleEventId()));
  protected readonly participants = computed(() =>
    this.moduleManagement.listParticipants(this.moduleEventId())(),
  );
}
