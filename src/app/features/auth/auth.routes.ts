/**
 * Rutas públicas de autenticación, sin shell.
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
  {
    path: 'activar',
    title: 'Activar cuenta | DSC',
    loadComponent: () => import('./pages/activation-page').then((m) => m.ActivationPage),
  },
];
