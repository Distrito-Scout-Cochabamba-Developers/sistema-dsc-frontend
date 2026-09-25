/** Rutas lazy de la feature Kardex de Dirigentes. */
import { Routes } from '@angular/router';

import { MOCK_LEADER_DIRECTORY_PROVIDER } from './data-access/mock-leader-directory.data-source';

export const KARDEX_ROUTES: Routes = [
  {
    path: '',
    providers: [MOCK_LEADER_DIRECTORY_PROVIDER],
    children: [
      {
        path: ':leaderId',
        loadComponent: () => import('./pages/kardex-detail-page').then((m) => m.KardexDetailPage),
      },
      {
        path: '',
        loadComponent: () => import('./pages/kardex-page').then((m) => m.KardexPage),
      },
    ],
  },
];
