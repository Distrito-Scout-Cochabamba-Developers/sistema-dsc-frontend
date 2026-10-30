/**
 * Rutas lazy del catálogo administrativo de módulos.
 */
import { Routes } from '@angular/router';

export const TRAINING_CATALOG_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./training-catalog-page').then((m) => m.TrainingCatalogPage),
  },
];
