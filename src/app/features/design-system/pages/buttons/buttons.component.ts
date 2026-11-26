
import {
  ChangeDetectionStrategy,
  Component,
  signal
} from '@angular/core';

import { ButtonComponent } from
  '../../../../shared/components/buttons/button/button.component';

@Component({
  selector: 'app-buttons',
  standalone: true,
  imports: [
    ButtonComponent
  ],
  templateUrl: './buttons.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonsComponent {
  // Opciones de tamaños que se muestran en el catálogo de módulos.
  readonly sizes = [
    { size: 'xs', name: 'Extra pequeño' },
    { size: 'sm', name: 'Pequeño' },
    { size: 'md', name: 'Mediano (por defecto)' },
    { size: 'lg', name: 'Grande' }
  ] as const;

  // Contador para demostrar los eventos de clic.
  readonly clickCount = signal(0);

  // Estado de carga para futuras demostraciones interactivas.
  readonly loadingDemo = signal(false);

  onDemoClick(): void {
    this.clickCount.update(value => value + 1);
  }

  toggleLoading(): void {
    this.loadingDemo.update(value => !value);
  }

  resetDemo(): void {
    this.clickCount.set(0);
    this.loadingDemo.set(false);
  }
}
