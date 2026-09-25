/**
 * Navbar principal reutilizable del shell DSC.
 *
 * La navegación es presentational; el shell conserva la decisión de sesión y
 * recibe el evento para ejecutar el side-effect de autenticación.
 */
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-dsc-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './dsc-navbar.html',
})
export class DscNavbar {
  /** Indica si la sesión actual está autenticada. */
  readonly isAuthenticated = input(false);

  /** Evento para que el shell ejecute el login/logout correspondiente. */
  readonly authClicked = output<void>();

  /** Emite la intención de alternar la sesión sin conocer su implementación. */
  protected onAuthClick(): void {
    this.authClicked.emit();
  }
}
