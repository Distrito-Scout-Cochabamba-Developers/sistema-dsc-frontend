import { Injectable, Provider } from '@angular/core';
import { Observable, map, of } from 'rxjs';

import type {
  LeaderDetail,
  LeaderDetailDto,
  LeaderDirectoryQuery,
  LeaderFilterOptions,
  LeaderSummary,
} from '../models/kardex.models';
import {
  mapLeaderDetailDto,
  mapLeaderFilterOptionsDto,
  mapLeaderSummaryDto,
} from './kardex.mapper';
import {
  LEADER_DIRECTORY_DATA_SOURCE,
  type LeaderDirectoryDataSource,
} from './leader-directory.data-source';

const MOCK_LEADERS: readonly LeaderDetailDto[] = [
  {
    id: 'leader-carlos-mendoza',
    fullName: 'Carlos Mendoza',
    ci: '4.567.890-1',
    role: 'Responsable de Tropa',
    scoutGroup: 'Panda',
    branch: 'Tropa',
    trainingLevel: 'IM I-II',
    avatarUrl: null,
    email: 'carlos.mendoza@dsc.bo',
    phone: '70000000',
    district: 'La Paz',
    joinedAt: '2019-03-16',
    trainingModules: [
      {
        id: 'wood-badge-i-ii',
        name: 'Módulo Avanzado de Liderazgo',
        description: 'Formación en dinámicas de grupo y resolución de conflictos.',
        status: 'completed',
        completedAt: '2023-10-15',
      },
      {
        id: 'leadership-service',
        name: 'Curso Básico de Seguridad en Campamentos',
        description: 'Protocolos de emergencia y primeros auxilios básicos.',
        status: 'completed',
        completedAt: '2022-04-22',
      },
      {
        id: 'activity-safety',
        name: 'Gestión de Proyectos Comunitarios',
        description: 'Planificación y ejecución de servicios comunitarios.',
        status: 'enrolled',
        completedAt: null,
      },
    ],
  },
  {
    id: 'leader-ana-silva',
    fullName: 'Ana Silva',
    ci: '3.210.987-6',
    role: 'Responsable de Grupo',
    scoutGroup: 'Alemán',
    branch: 'Comunidad',
    trainingLevel: 'IM III',
    avatarUrl: null,
    email: 'ana.silva@dsc.bo',
    phone: '71234567',
    district: 'La Paz',
    joinedAt: '2017-08-12',
    trainingModules: [
      {
        id: 'wood-badge-i-ii',
        name: 'Insignia de Madera I-II',
        description: 'Fundamentos de liderazgo scout.',
        status: 'completed',
        completedAt: '2021-06-18',
      },
      {
        id: 'wood-badge-iii',
        name: 'Insignia de Madera III',
        description: 'Profundización en liderazgo y gestión de equipos.',
        status: 'completed',
        completedAt: '2024-02-10',
      },
      {
        id: 'training-trainers',
        name: 'Formación de Formadores',
        description: 'Herramientas para acompañar procesos de aprendizaje adulto.',
        status: 'enrolled',
        completedAt: null,
      },
    ],
  },
  {
    id: 'leader-luis-rivas',
    fullName: 'Luis Rivas',
    ci: '5.112.334-2',
    role: 'Asistente de Manada',
    scoutGroup: 'Saint Andrews',
    branch: 'Manada',
    trainingLevel: 'IM I-II',
    avatarUrl: null,
    email: null,
    phone: '72345678',
    district: 'La Paz',
    joinedAt: '2021-01-20',
    trainingModules: [
      {
        id: 'wood-badge-i-ii',
        name: 'Insignia de Madera I-II',
        description: 'Fundamentos de liderazgo scout.',
        status: 'completed',
        completedAt: '2022-09-05',
      },
      {
        id: 'leadership-service',
        name: 'Liderazgo y Servicio',
        description: 'Prácticas de servicio y conducción de equipos.',
        status: 'pending',
        completedAt: null,
      },
    ],
  },
];

const FILTER_OPTIONS = {
  scoutGroups: ['Panda', 'Alemán', 'Saint Andrews'],
  branches: ['Manada', 'Tropa', 'Comunidad'],
  trainingLevels: ['IM I-II', 'IM III', 'Sin registro'],
};

/** Fuente mock activa para desarrollar Kardex sin depender del backend. */
@Injectable()
export class MockLeaderDirectoryDataSource implements LeaderDirectoryDataSource {
  /**
   * Lista dirigentes del fixture y respeta los filtros del contrato.
   *
   * @param query - Filtros opcionales equivalentes a los query params HTTP.
   * @returns Flujo síncrono de tarjetas mapeadas.
   */
  listLeaders(query: LeaderDirectoryQuery = {}): Observable<readonly LeaderSummary[]> {
    const normalizedSearch = query.search?.trim().toLocaleLowerCase() ?? '';
    return of(MOCK_LEADERS).pipe(
      map((leaders) =>
        leaders
          .filter((leader) => {
            const searchable = leader.fullName.toLocaleLowerCase();
            return (
              (!normalizedSearch || searchable.includes(normalizedSearch)) &&
              (!query.scoutGroup || leader.scoutGroup === query.scoutGroup) &&
              (!query.branch || leader.branch === query.branch) &&
              (!query.trainingLevel || leader.trainingLevel === query.trainingLevel)
            );
          })
          .map(mapLeaderSummaryDto),
      ),
    );
  }

  /**
   * Busca una ficha mock por identificador opaco.
   *
   * @param leaderId - ID de la ruta, nunca un CI.
   * @returns Flujo con la ficha o `null`.
   */
  getLeaderById(leaderId: string): Observable<LeaderDetail | null> {
    const dto = MOCK_LEADERS.find((leader) => leader.id === leaderId);
    return of(dto ? mapLeaderDetailDto(dto) : null);
  }

  /** @returns Flujo con los catálogos mock validados por el mapper. */
  getFilterOptions(): Observable<LeaderFilterOptions> {
    return of(mapLeaderFilterOptionsDto(FILTER_OPTIONS));
  }
}

/** Provider de ruta activo mientras la API real no está autorizada. */
export const MOCK_LEADER_DIRECTORY_PROVIDER: Provider = {
  provide: LEADER_DIRECTORY_DATA_SOURCE,
  useClass: MockLeaderDirectoryDataSource,
};
