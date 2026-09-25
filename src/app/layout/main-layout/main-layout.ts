/**
 * Shell DSC: navbar, contenido y footer alineados al diseño de asistencia.
 * Sin lógica de negocio; solo composición estructural.
 */
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AuthSessionService } from '@core/services/auth-session.service';
import { DscFooter } from '@shared/components/dsc-footer';
import { DscNavbar } from '@shared/components/dsc-navbar';

@Component({
  selector: 'app-main-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, DscNavbar, DscFooter],
  templateUrl: './main-layout.html',
})
export class MainLayout {
  /** Sesión mock para demostrar login / logout en el shell. */
  protected readonly auth = inject(AuthSessionService);

  protected onAuthClick(): void {
    this.auth.toggleDemoSession();
  }
}
