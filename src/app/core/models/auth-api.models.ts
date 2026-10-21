/**
 * Contratos HTTP de autenticación (`/api/v1/auth`, camelCase).
 */

/** `POST /api/v1/auth/login`. `identifier` es email o username. */
export interface LoginRequestApiDto {
  readonly identifier: string;
  readonly password: string;
}

/**
 * Perfil en el body de login y en `GET /api/v1/auth/me`.
 */
export interface UserProfileApiDto {
  readonly id: number;
  readonly personId: number;
  readonly username: string;
  readonly email: string;
  readonly roles: readonly string[];
}

/** Respuesta 200 de `POST /api/v1/auth/login`. El JWT viaja en `token`, no en cookie. */
export interface LoginResponseApiDto {
  readonly token: string;
  readonly tokenType: string;
  readonly expiresAt: string;
  readonly user: UserProfileApiDto;
}
