/**
 * Directorio de adultos: lookup por CI contra la API.
 */
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';

import type { ScoutLeaderApiDto } from '@core/models/attendance-api.models';
import type { DepartmentCode, DistrictAdult } from '@core/models/attendance.models';
import { apiUrl } from '@core/utils/api-url.utils';
import { isValidDepartmentCode } from '@core/utils/ci.utils';
import { joinPersonName } from '@core/utils/person-name.utils';

@Injectable({ providedIn: 'root' })
export class AdultDirectoryService {
  private readonly http = inject(HttpClient);

  /**
   * Busca un adulto por CI (`GET api/attendance/lookup-ci/{ci}`).
   *
   * @param ci - Carnet de identidad numérico.
   * @param extension - Extensión departamental opcional.
   * @returns Adulto o `null` si no existe (404).
   */
  lookupByCi(ci: string, extension = ''): Observable<DistrictAdult | null> {
    const normalized = ci.trim();
    let params = new HttpParams();
    if (extension.trim()) {
      params = params.set('extension', extension.trim());
    }

    return this.http
      .get<ScoutLeaderApiDto>(
        apiUrl(`/api/attendance/lookup-ci/${encodeURIComponent(normalized)}`),
        { params },
      )
      .pipe(
        map((dto) => this.mapLeader(dto)),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            return of(null);
          }
          return throwError(() => error);
        }),
      );
  }

  /**
   * Mapea el DTO de lookup al modelo de UI.
   *
   * @param dto - Dirigente devuelto por la API.
   */
  private mapLeader(dto: ScoutLeaderApiDto): DistrictAdult {
    const extension: DepartmentCode = isValidDepartmentCode(dto.extension)
      ? dto.extension
      : 'CB';

    return {
      ci: dto.ciNumber,
      fullName: joinPersonName(dto.firstName, dto.lastName),
      extension,
      phone: dto.phone,
    };
  }
}
