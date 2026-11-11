/**
 * Rutas raíz de la aplicación.
 * Las features se cargan de forma diferida; no importar features de forma eager.
 * Auth vive fuera del shell para coincidir con el login a pantalla completa.
 * `/admin/modulos` usa `authGuard` + `roleGuard` (ADMIN / DISTRICT_SECRETARY).
 * `/modulos` y `/asistencia` siguen públicos: la API de asistencia es anónima.
 */
import { Routes } from '@angular/router';

import { authGuard } from '@core/guards/auth.guard';
import { roleGuard } from '@core/guards/role.guard';
import { TRAINING_CATALOG_ROLES } from '@core/models/auth-roles';

export const routes: Routes = [
  {
    path: 'login',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('@features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    loadComponent: () =>
      import('@layout/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('@features/landing/landing.routes').then((m) => m.LANDING_ROUTES),
      },
      {
        path: 'modulos',
        loadChildren: () =>
          import('@features/modules/modules.routes').then((m) => m.MODULES_ROUTES),
      },
      {
        path: 'admin/modulos',
        canActivate: [authGuard, roleGuard(...TRAINING_CATALOG_ROLES)],
        loadChildren: () =>
          import('@features/training-catalog/training-catalog.routes').then(
            (m) => m.TRAINING_CATALOG_ROUTES,
          ),
      },
      {
        path: 'asistencia',
        loadChildren: () =>
          import('@features/attendance/attendance.routes').then((m) => m.ATTENDANCE_ROUTES),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
