import { Routes } from '@angular/router';

/**
 * Rutas internas del catálogo de componentes DSC.
 *
 * Se cargan de manera diferida y únicamente
 * están disponibles cuando la aplicación
 * registra la ruta del Design System.
 */
export const DESIGN_SYSTEM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import(
        './pages/design-system-layout/design-system-layout'
      ).then(m => m.DesignSystemLayout),

    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'colors',
      },
      {
        path: 'colors',
        title: 'Colores & Tokens | DSC Design System',
        loadComponent: () =>
          import(
            './pages/colors-page/colors-page'
          ).then(m => m.ColorsPage),
      },
      {
        path: 'formularios',
        title: 'Formularios & Entradas | DSC Design System',
        loadComponent: () =>
          import(
            './pages/forms-and-inputs/forms-and-inputs.component'
          ).then(m => m.FormsAndInputsComponent),
      },
      {
        path: 'buttons',
        title: 'Botones | DSC Design System',
        loadComponent: () =>
          import(
            './pages/buttons-page/buttons-page'
          ).then(m => m.ButtonsPage),
      },
    ],
  },
];
