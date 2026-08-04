/**
 * Rutas lazy de la feature `asistencia` (registro por deep link / QR).
 */
import { Routes } from '@angular/router';

export const ASISTENCIA_ROUTES: Routes = [
  {
    path: ':sessionId',
    loadComponent: () =>
      import('./asistencia-page').then((m) => m.AsistenciaPage),
  },
];
