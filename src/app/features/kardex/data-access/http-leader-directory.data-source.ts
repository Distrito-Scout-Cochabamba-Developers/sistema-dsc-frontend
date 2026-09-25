import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';

import type {
  LeaderDetail,
  LeaderDirectoryQuery,
  LeaderFilterOptions,
  LeaderSummary,
} from '../models/kardex.models';
import {
  KardexDataError,
  mapLeaderDetailDto,
  mapLeaderFilterOptionsDto,
  mapLeaderSummaryListDto,
  requireOpaqueLeaderId,
} from './kardex.mapper';
import type { LeaderDirectoryDataSource } from './leader-directory.data-source';

const LEADERS_API = '/api/kardex/dirigentes';
const SAFE_NAME_SEARCH = /^[\p{L}\p{M}' -]+$/u;

/** Adaptador HTTP listo para el contrato camelCase de ASP.NET Core. */
@Injectable()
export class HttpLeaderDirectoryDataSource implements LeaderDirectoryDataSource {
  private readonly http = inject(HttpClient);

  /**
   * Consulta el directorio enviando solamente filtros con valor.
   *
   * @param query - Filtros que se serializan como query params camelCase.
   * @returns Flujo de tarjetas validadas y mapeadas.
   */
  listLeaders(query: LeaderDirectoryQuery = {}): Observable<readonly LeaderSummary[]> {
    return this.http
      .get<unknown>(LEADERS_API, { params: buildQueryParams(query) })
      .pipe(map(mapLeaderSummaryListDto));
  }

  /**
   * Consulta una ficha codificando el identificador como un único segmento.
   *
   * @param leaderId - Identificador opaco; nunca debe contener CI.
   * @returns Ficha validada, o `null` únicamente ante HTTP 404.
   */
  getLeaderById(leaderId: string): Observable<LeaderDetail | null> {
    let normalizedLeaderId: string;
    try {
      normalizedLeaderId = requireOpaqueLeaderId(leaderId);
    } catch (error: unknown) {
      return throwError(() => error);
    }
    const encodedLeaderId = encodeURIComponent(normalizedLeaderId);
    return this.http.get<unknown>(`${LEADERS_API}/${encodedLeaderId}`).pipe(
      map((response) => {
        const leader = mapLeaderDetailDto(response);
        if (leader.id !== normalizedLeaderId) {
          throw new KardexDataError(
            'La ficha recibida no coincide con el identificador solicitado.',
          );
        }
        return leader;
      }),
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 404) {
          return of(null);
        }
        return throwError(() => error);
      }),
    );
  }

  /** @returns Catálogos de filtros validados desde la API relativa. */
  getFilterOptions(): Observable<LeaderFilterOptions> {
    return this.http.get<unknown>(`${LEADERS_API}/filtros`).pipe(map(mapLeaderFilterOptionsDto));
  }
}

function buildQueryParams(query: LeaderDirectoryQuery): HttpParams {
  let params = new HttpParams();
  const values: ReadonlyArray<readonly [string, string | undefined]> = [
    ['search', query.search],
    ['scoutGroup', query.scoutGroup],
    ['branch', query.branch],
    ['trainingLevel', query.trainingLevel],
  ];

  for (const [key, value] of values) {
    if (value !== undefined && value.trim().length > 0) {
      const trimmedValue = value.trim();
      if (key === 'search' && !SAFE_NAME_SEARCH.test(trimmedValue)) {
        throw new KardexDataError('La búsqueda remota sólo admite nombres.');
      }
      params = params.set(key, trimmedValue);
    }
  }
  return params;
}
