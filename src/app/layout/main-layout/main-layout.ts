/**
 * Shell DSC: navbar, contenido y footer alineados al diseño de asistencia.
 * Sin lógica de negocio; solo composición estructural.
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

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
  /** Sesión real hidratada desde cookie o login. */
  protected readonly auth = inject(AuthSessionService);
  protected readonly router = inject(Router);

  protected readonly currentYear = new Date().getFullYear();

  /**
   * Cierra la sesión en el cliente.
   * La cookie HttpOnly permanece hasta que exista logout en la API.
   */
  protected onLogout(): void {
    this.auth.clearSession();
  }
}
