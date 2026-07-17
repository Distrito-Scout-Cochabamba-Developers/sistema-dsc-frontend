/**
 * Rutas lazy de la feature `landing`.
 */
import { Routes } from '@angular/router';

export const LANDING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing').then((m) => m.Landing),
  },
];
