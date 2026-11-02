import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';


/**
 * Página de documentación del botón DSC.
 *
 * Permite visualizar y probar las propiedades
 * del componente reutilizable.
 */
@Component({
  selector: 'app-buttons-page',
  standalone: true,
  templateUrl: './buttons-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonsPage {
}
