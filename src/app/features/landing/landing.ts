/**
 * Página de inicio (landing) del Sistema DSC:
 * presenta la portada institucional del distrito, próximas programaciones y accesos según sesión.
 */
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideAward,
  lucideBookOpen,
  lucideCalendar,
  lucideClipboardCheck,
  lucideClock,
  lucideMapPin,
} from '@ng-icons/lucide';
import { catchError, of } from 'rxjs';

import { CURRICULUM_CONFIG_ROLES, TRAINING_CATALOG_ROLES } from '@core/models/auth-roles';
import { AuthSessionService } from '@core/services/auth-session.service';
import { apiUrl } from '@core/utils/api-url.utils';
import { BadgeComponent, type BadgeColor } from '@shared/components/ui-elements/badge/badge.component';
import { CardComponent } from '@shared/components/ui-elements/card/card.component';

/** Resumen mínimo de una sesión programada devuelta por el calendario público. */
interface UpcomingSessionSummary {
  readonly id: number;
  readonly moduleName: string;
  readonly startsAt: string;
  readonly location: string | null;
  readonly status: string;
}

/** Tarjeta de acceso rápido para el espacio de trabajo autenticado. */
interface WorkspaceCardItem {
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly ctaLabel: string;
  readonly tag: string;
  readonly badgeColor: BadgeColor;
  readonly icon: string;
  readonly iconContainerClass: string;
}

@Component({
  selector: 'app-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, NgIcon, CardComponent, BadgeComponent],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideAward,
      lucideBookOpen,
      lucideCalendar,
      lucideClipboardCheck,
      lucideClock,
      lucideMapPin,
    }),
  ],
  templateUrl: './landing.html',
})
export class Landing {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly auth = inject(AuthSessionService);

  /** Título principal de la portada. */
  protected readonly title = signal('Sistema DSC');

  /** Descripción institucional bajo el título. */
  protected readonly subtitle = signal(
    'Plataforma del Distrito Scout Cochabamba para consultar el calendario de programaciones, gestionar inscripciones y configurar la formación distrital.',
  );

  /** Próximas sesiones programadas para la vista previa de portada. */
  protected readonly upcomingSessions = signal<readonly UpcomingSessionSummary[]>([]);

  /** Accesos disponibles según los roles de la sesión actual. */
  protected readonly workspaceCards = computed<readonly WorkspaceCardItem[]>(() => {
    const items: WorkspaceCardItem[] = [
      {
        path: '/calendario',
        title: 'Calendario de módulos',
        description: 'Revisa las programaciones publicadas, horarios y cupos disponibles.',
        ctaLabel: 'Abrir calendario',
        tag: 'Público',
        badgeColor: 'info',
        icon: 'lucideCalendar',
        iconContainerClass: 'bg-dsc-soft text-dsc-dark',
      },
    ];

    if (this.auth.hasRole('DISTRICT_SECRETARY')) {
      items.push({
        path: '/secretaria/inscripciones',
        title: 'Inscripción a módulos de formación',
        description: 'Busca participantes por Carnet de Identidad e inscríbelos en una programación.',
        ctaLabel: 'Ir a inscripciones',
        tag: 'Secretaría',
        badgeColor: 'warning',
        icon: 'lucideClipboardCheck',
        iconContainerClass: 'bg-secondary-soft text-warning-ink',
      });
    }

    if (this.auth.hasAnyRole(...TRAINING_CATALOG_ROLES)) {
      items.push({
        path: '/admin/modulos',
        title: 'Módulos de formación',
        description: 'Administra el catálogo curricular y abre nuevas programaciones en el calendario.',
        ctaLabel: 'Administrar módulos',
        tag: 'Catálogo',
        badgeColor: 'primary',
        icon: 'lucideBookOpen',
        iconContainerClass: 'bg-sky-100 text-sky-800',
      });
    }

    if (this.auth.hasAnyRole(...CURRICULUM_CONFIG_ROLES)) {
      items.push({
        path: '/admin/requisitos-formacion',
        title: 'Requisitos de formación',
        description: 'Define el total de módulos y los obligatorios elegibles para cada nivel.',
        ctaLabel: 'Configurar requisitos',
        tag: 'Currícula',
        badgeColor: 'success',
        icon: 'lucideAward',
        iconContainerClass: 'bg-emerald-100 text-emerald-800',
      });
    }

    return items;
  });

  /** Atajo principal en el hero para usuarios autenticados con funcionalidades de gestión. */
  protected readonly primaryShortcut = computed(() => {
    const firstManagement = this.workspaceCards().find((card) => card.path !== '/calendario');
    return firstManagement
      ? { path: firstManagement.path, label: firstManagement.title }
      : null;
  });

  constructor() {
    this.loadUpcomingSessions();
  }

  private loadUpcomingSessions(): void {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const minTimestamp = startOfToday.getTime();

    this.http
      .get<readonly UpcomingSessionSummary[]>(apiUrl('/api/v1/calendar/sessions'))
      .pipe(
        catchError(() => of([] as readonly UpcomingSessionSummary[])),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((sessions) => {
        const upcoming = sessions
          .filter(
            (s) =>
              s.status !== 'CANCELLED' &&
              s.status !== 'FINISHED' &&
              Date.parse(s.startsAt) >= minTimestamp,
          )
          .slice()
          .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
          .slice(0, 3);
        this.upcomingSessions.set(upcoming);
      });
  }
}
