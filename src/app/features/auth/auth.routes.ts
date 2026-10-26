/**
 * Rutas lazy de la feature `auth` (login a pantalla completa, sin shell).
 */
import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    loadComponent: () => import('./login-page').then((m) => m.LoginPage),
  },
];
