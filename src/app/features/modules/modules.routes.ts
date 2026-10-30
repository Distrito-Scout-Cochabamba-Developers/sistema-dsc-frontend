/**
 * Rutas lazy de la feature `modules` (catálogo para inscribirse).
 */
import { Routes } from '@angular/router';

export const MODULES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./module-catalog').then((m) => m.ModuleCatalog),
  },
];
