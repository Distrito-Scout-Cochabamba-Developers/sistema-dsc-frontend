/**
 * Rutas raíz de la aplicación.
 * Las features se cargan de forma diferida; no importar features de forma eager.
 */
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('@features/landing/landing.routes').then((m) => m.LANDING_ROUTES),
  },
  {
    path: 'asistencia',
    loadChildren: () =>
      import('@features/attendance/attendance.routes').then(
        (m) => m.ATTENDANCE_ROUTES,
      ),
  },
  {
    path: 'secretaria',
    loadChildren: () =>
      import('@features/module-management/module-management.routes').then(
        (m) => m.MODULE_MANAGEMENT_ROUTES,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
