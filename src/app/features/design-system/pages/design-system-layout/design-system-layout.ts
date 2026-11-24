import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';

import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';

/**
 * Layout interno del catálogo DSC.
 *
 * Proporciona navegación entre las páginas
 * de documentación de los componentes.
 */
@Component({
  selector: 'app-design-system-layout',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  templateUrl: './design-system-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DesignSystemLayout {}
