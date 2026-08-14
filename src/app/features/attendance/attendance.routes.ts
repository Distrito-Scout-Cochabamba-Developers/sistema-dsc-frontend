/**
 * Rutas lazy de la feature `attendance` (registro por deep link / QR).
 */
import { Routes } from '@angular/router';

export const ATTENDANCE_ROUTES: Routes = [
  {
    path: ':sessionId',
    loadComponent: () =>
      import('./attendance-page').then((m) => m.AttendancePage),
  },
];
