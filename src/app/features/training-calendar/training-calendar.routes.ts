/**
 * Rutas lazy del calendario de módulos (público).
 */
import { Routes } from '@angular/router';

export const TRAINING_CALENDAR_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./training-calendar-page').then((m) => m.TrainingCalendarPage),
  },
];
