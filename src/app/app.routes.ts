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
    path: 'kardex',
    loadChildren: () =>
      import('@features/kardex/kardex.routes').then((m) => m.KARDEX_ROUTES),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
