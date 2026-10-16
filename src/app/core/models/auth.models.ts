/**
 * Perfil autenticado en la sesión de aplicación.
 * La API no entrega CI, teléfono ni nombre completo de dirigente.
 */
export interface AuthUserProfile {
  readonly id: number;
  readonly username: string;
  readonly email: string;
  readonly roles: readonly string[];
  /** Nombre visible en UI (username, o email si el username viene vacío). */
  readonly displayName: string;
}

/**
 * Adapta el DTO de la API al modelo de sesión del frontend.
 *
 * @param dto - Perfil camelCase de login o `/me`.
 */
export function toAuthUserProfile(dto: {
  readonly id: number;
  readonly username: string;
  readonly email: string;
  readonly roles: readonly string[] | null;
}): AuthUserProfile {
  const username = dto.username?.trim() ?? '';
  return {
    id: dto.id,
    username,
    email: dto.email,
    roles: dto.roles ?? [],
    displayName: username || dto.email,
  };
}
