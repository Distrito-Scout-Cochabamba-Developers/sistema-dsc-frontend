/**
 * Bootstrap de la aplicación Angular (raíz).
 * Compone únicamente el shell de layout; las páginas viven en `features/` vía lazy loading.
 */
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MainLayout } from '@layout/main-layout/main-layout';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MainLayout],
  template: `<app-main-layout />`,
  styles: `
    :host {
      display: block;
      min-block-size: 100%;
    }
  `,
})
export class App {}
