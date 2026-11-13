/**
 * Rutas diferidas (lazy loaded) para la parametrización de requisitos de formación.
 */
import { Routes } from '@angular/router';

export const CURRICULUM_CONFIG_ROUTES: Routes = [
  {
    path: '',
    title: 'Requisitos de formación | DSC',
    loadComponent: () => import('./curriculum-config-page').then((m) => m.CurriculumConfigPage),
  },
];
