/**
 * Shell DSC: navbar, contenido y footer alineados al diseño de asistencia.
 * Sin lógica de negocio; solo composición estructural.
 */
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

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
  /** Sesión mock para demostrar login / logout en el shell. */
  protected readonly auth = inject(AuthSessionService);

  protected readonly currentYear = new Date().getFullYear();

  protected onAuthClick(): void {
    this.auth.toggleDemoSession();
  }
}
