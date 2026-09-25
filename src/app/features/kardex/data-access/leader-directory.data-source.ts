import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import type {
  LeaderDetail,
  LeaderDirectoryQuery,
  LeaderFilterOptions,
  LeaderSummary,
} from '../models/kardex.models';

/** Contrato intercambiable de datos para las páginas de Kardex. */
export interface LeaderDirectoryDataSource {
  /**
   * Lista dirigentes aplicando los filtros soportados por el origen.
   *
   * @param query - Filtros opcionales del directorio.
   * @returns Flujo de tarjetas de dirigente.
   */
  listLeaders(query?: LeaderDirectoryQuery): Observable<readonly LeaderSummary[]>;

  /**
   * Obtiene una ficha por su identificador opaco.
   *
   * @param leaderId - Identificador que nunca contiene CI.
   * @returns Flujo con la ficha o `null` cuando no existe.
   */
  getLeaderById(leaderId: string): Observable<LeaderDetail | null>;

  /** @returns Flujo con catálogos para los filtros del directorio. */
  getFilterOptions(): Observable<LeaderFilterOptions>;
}

/** Token DI para conmutar entre el mock y el adaptador HTTP. */
export const LEADER_DIRECTORY_DATA_SOURCE = new InjectionToken<LeaderDirectoryDataSource>(
  'LEADER_DIRECTORY_DATA_SOURCE',
);
