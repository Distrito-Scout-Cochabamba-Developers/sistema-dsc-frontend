/**
 * Shell DSC: navbar, contenido y footer alineados al diseño de asistencia.
 * Sin lógica de negocio; solo composición estructural.
 */
import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { CURRICULUM_CONFIG_ROLES, TRAINING_CATALOG_ROLES } from '@core/models/auth-roles';
import { AuthSessionService } from '@core/services/auth-session.service';
import { ButtonComponent } from '@shared/components/buttons/button/button.component';
import { DscLogoBadge } from '@shared/components/dsc-logo-badge';

/**
 * Enlace de la navegación de funcionalidades (sidebar y menú móvil).
 */
export interface FeatureNavLink {
  /** Ruta absoluta del enlace. */
  readonly path: string;
  /** Texto visible, según el vocabulario de `GLOSSARY.md`. */
  readonly label: string;
}

/**
 * Layout principal: encabezado, navegación de funcionalidades y outlet.
 *
 * @remarks
 * En móvil la navegación vive en un panel desplegable abierto por el botón «Menú»;
 * en escritorio se muestra como sidebar. Ambas vistas consumen `featureLinks`.
 */
@Component({
  selector: 'app-main-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, DscLogoBadge, NgTemplateOutlet, ButtonComponent],
  templateUrl: './main-layout.html',
  host: { '(document:keydown.escape)': 'onEscape()' },
})
export class MainLayout {
  /** Sesión real hidratada desde JWT (storage + `/me`) o login. */
  protected readonly auth = inject(AuthSessionService);
  protected readonly router = inject(Router);

  /** Id del panel de navegación móvil (destino de `aria-controls`). */
  protected readonly mobileMenuId = 'menu-movil';

  /** Enlaces públicos del encabezado; en móvil con sesión se listan dentro del menú. */
  protected readonly primaryLinks: readonly FeatureNavLink[] = [
    { path: '/calendario', label: 'Calendario' },
    { path: '/', label: 'Inicio' },
  ];

  /** Estado del menú móvil. */
  protected readonly menuOpen = signal(false);

  private readonly menuButton = viewChild<ButtonComponent>('menuButton');

  /** Indica si el usuario autenticado puede administrar requisitos de formación. */
  protected readonly canManageCurriculum = computed(() =>
    this.auth.hasAnyRole(...CURRICULUM_CONFIG_ROLES),
  );

  /** Indica si puede abrir programaciones y editar el catálogo de módulos. */
  protected readonly canManageCatalog = computed(() =>
    this.auth.hasAnyRole(...TRAINING_CATALOG_ROLES),
  );

  /** Enlaces de funcionalidades visibles para los roles de la sesión actual. */
  protected readonly featureLinks = computed<readonly FeatureNavLink[]>(() => {
    const links: FeatureNavLink[] = [];
    if (this.auth.hasRole('DISTRICT_SECRETARY')) {
      links.push({ path: '/secretaria/inscripciones', label: 'Inscripción a módulos de formación' });
    }
    if (this.canManageCatalog()) {
      links.push({ path: '/admin/modulos', label: 'Módulos de formación' });
    }
    if (this.canManageCurriculum()) {
      links.push({ path: '/admin/requisitos-formacion', label: 'Requisitos de formación' });
    }
    return links;
  });

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.closeMenu());
  }

  /** Abre o cierra el menú móvil. */
  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  /** Cierra el menú móvil (clic en enlace, navegación o logout). */
  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  /** Escape cierra el menú abierto y devuelve el foco al botón «Menú». */
  protected onEscape(): void {
    if (!this.menuOpen()) {
      return;
    }
    this.closeMenu();
    this.menuButton()?.focus();
  }

  /**
   * Cierra la sesión en el cliente (borra el JWT local).
   * El token sigue válido en el servidor hasta `exp`; no hay logout en la API.
   */
  protected onLogout(): void {
    this.closeMenu();
    this.auth.clearSession();
  }
}
