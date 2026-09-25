/**
 * Footer institucional reutilizable del shell DSC.
 *
 * No contiene navegación de negocio; sus enlaces son marcadores hasta que las
 * features legales y de contacto tengan rutas propias.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dsc-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './dsc-footer.html',
})
export class DscFooter {
  /** Año actual para evitar una fecha fija en el copyright. */
  protected readonly currentYear = new Date().getFullYear();
}
