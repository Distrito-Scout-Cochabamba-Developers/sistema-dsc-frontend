/**
 * Bootstrap de la aplicación Angular (raíz).
 * El outlet elige entre login a pantalla completa y el shell DSC.
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AuthSessionService } from '@core/services/auth-session.service';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: `
    :host {
      display: block;
      min-block-size: 100%;
    }
  `,
})
export class App {
  constructor() {
    inject(AuthSessionService).hydrateFromServer();
  }
}
