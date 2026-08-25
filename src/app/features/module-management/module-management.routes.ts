/**
 * Rutas lazy de la feature `module-management` (gestión de módulos por Secretaría).
 */
import { Routes } from '@angular/router';

export const MODULE_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/module-list-page').then((m) => m.ModuleListPage),
  },
  {
    path: ':moduleEventId',
    loadComponent: () => import('./pages/module-detail-page').then((m) => m.ModuleDetailPage),
  },
];
