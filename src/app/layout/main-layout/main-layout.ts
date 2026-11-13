/**
 * Shell DSC: navbar, contenido y footer alineados al diseño de asistencia.
 * Sin lógica de negocio; solo composición estructural.
 */
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { CURRICULUM_CONFIG_ROLES } from '@core/models/auth-roles';
import { AuthSessionService } from '@core/services/auth-session.service';
import { DscLogoBadge } from '@shared/components/dsc-logo-badge';
import { FooterLinkGroup } from '@shared/components/footer-link-group';

@Component({
  selector: 'app-main-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, DscLogoBadge, FooterLinkGroup],
  templateUrl: './main-layout.html',
})
export class MainLayout {
  /** Sesión real hidratada desde JWT (storage + `/me`) o login. */
  protected readonly auth = inject(AuthSessionService);
  protected readonly router = inject(Router);

  protected readonly currentYear = new Date().getFullYear();

  /** Indica si el usuario autenticado puede administrar requisitos de formación. */
  protected readonly canManageCurriculum = computed(() =>
    this.auth.hasAnyRole(...CURRICULUM_CONFIG_ROLES),
  );

  /**
   * Cierra la sesión en el cliente (borra el JWT local).
   * El token sigue válido en el servidor hasta `exp`; no hay logout en la API.
   */
  protected onLogout(): void {
    this.auth.clearSession();
  }
}
