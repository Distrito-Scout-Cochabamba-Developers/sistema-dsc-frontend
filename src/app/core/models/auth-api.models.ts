/**
 * Contratos HTTP de autenticación (camelCase, DSC.Application.DTOs).
 */

/** `POST /api/auth/login` y `POST /api/auth/login/email`. */
export interface LoginEmailRequestApiDto {
  readonly email: string;
  readonly password: string;
}

/** `POST /api/auth/login/username`. */
export interface LoginUsernameRequestApiDto {
  readonly username: string;
  readonly password: string;
}

/**
 * Perfil que devuelve login y `GET /api/auth/me`.
 * El JWT no viaja en el JSON: la API lo deja en cookie HttpOnly `access_token`.
 */
export interface UserProfileApiDto {
  readonly id: number;
  readonly username: string;
  readonly email: string;
  readonly roles: readonly string[];
}
