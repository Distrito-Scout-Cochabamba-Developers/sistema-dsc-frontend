/**
 * Cliente HTTP de autenticación DSC (`/api/v1/auth`).
 * El JWT viaja en el JSON de login; las llamadas autenticadas usan Bearer.
 */
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import type { LoginRequestApiDto, LoginResponseApiDto, UserProfileApiDto } from '@core/models/auth-api.models';
import { apiUrl } from '@core/utils/api-url.utils';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);

  /**
   * Inicia sesión con email o username y recibe el JWT en el body.
   *
   * @param body - Identificador y contraseña.
   */
  login(body: LoginRequestApiDto): Observable<LoginResponseApiDto> {
    return this.http.post<LoginResponseApiDto>(apiUrl('/api/v1/auth/login'), body);
  }

  /**
   * Perfil y roles del JWT actual (`Authorization: Bearer`).
   */
  getCurrentUser(): Observable<UserProfileApiDto> {
    return this.http.get<UserProfileApiDto>(apiUrl('/api/v1/auth/me'));
  }
}
