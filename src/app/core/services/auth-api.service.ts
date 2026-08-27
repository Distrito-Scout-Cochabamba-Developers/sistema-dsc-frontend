/**
 * Cliente HTTP de autenticación DSC.
 * El token queda en cookie HttpOnly; estas llamadas deben ir con credenciales.
 */
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import type {
  LoginEmailRequestApiDto,
  LoginUsernameRequestApiDto,
  UserProfileApiDto,
} from '@core/models/auth-api.models';
import { apiUrl } from '@core/utils/api-url.utils';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);

  /**
   * Inicia sesión con correo. La API setea `access_token` y devuelve el perfil.
   *
   * @param body - Correo y contraseña.
   */
  loginWithEmail(body: LoginEmailRequestApiDto): Observable<UserProfileApiDto> {
    return this.http.post<UserProfileApiDto>(apiUrl('/api/auth/login/email'), body);
  }

  /**
   * Inicia sesión con nombre de usuario (endpoint existente, no usado por la UI).
   *
   * @param body - Usuario y contraseña.
   */
  loginWithUsername(body: LoginUsernameRequestApiDto): Observable<UserProfileApiDto> {
    return this.http.post<UserProfileApiDto>(apiUrl('/api/auth/login/username'), body);
  }

  /**
   * Restaura el perfil si la cookie `access_token` sigue vigente.
   */
  getCurrentUser(): Observable<UserProfileApiDto> {
    return this.http.get<UserProfileApiDto>(apiUrl('/api/auth/me'));
  }
}
