/**
 * Rutas raíz de la aplicación.
 * Las features se cargan de forma diferida; no importar features de forma eager.
 * Auth vive fuera del shell para coincidir con el login a pantalla completa.
 */
import { Routes } from '@angular/router';

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
