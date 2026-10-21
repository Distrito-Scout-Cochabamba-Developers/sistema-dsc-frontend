/**
 * Persistencia del JWT en `sessionStorage` o `localStorage`.
 * El token no es HttpOnly: un XSS puede leerlo (trade-off del contrato Bearer).
 */

/** Clave única de la sesión DSC en Web Storage. */
export const AUTH_TOKEN_STORAGE_KEY = 'dsc.auth.session';

/** Sesión serializada junto al JWT. */
export interface StoredAuthSession {
  readonly token: string;
  readonly expiresAt: string;
  readonly persist: boolean;
}

function canUseWebStorage(): boolean {
  return typeof globalThis.sessionStorage !== 'undefined';
}

function persistStore(persist: boolean): Storage {
  return persist ? globalThis.localStorage : globalThis.sessionStorage;
}

function isExpired(expiresAt: string): boolean {
  const ms = Date.parse(expiresAt);
  return Number.isNaN(ms) || ms <= Date.now();
}

/**
 * Lee un JWT vigente. Si expiró, limpia el storage.
 *
 * @returns Sesión guardada o `null`.
 */
export function readStoredAuth(): StoredAuthSession | null {
  if (!canUseWebStorage()) {
    return null;
  }

  for (const persist of [false, true]) {
    const raw = persistStore(persist).getItem(AUTH_TOKEN_STORAGE_KEY);
    if (!raw) {
      continue;
    }

    try {
      const parsed = JSON.parse(raw) as StoredAuthSession;
      if (!parsed.token?.trim() || isExpired(parsed.expiresAt)) {
        persistStore(persist).removeItem(AUTH_TOKEN_STORAGE_KEY);
        continue;
      }
      return { ...parsed, persist };
    } catch {
      persistStore(persist).removeItem(AUTH_TOKEN_STORAGE_KEY);
    }
  }

  return null;
}

/**
 * Guarda el JWT. `persist` usa `localStorage` (Recuérdame); si no, `sessionStorage`.
 *
 * @param session - Token y expiración ISO.
 */
export function writeStoredAuth(session: StoredAuthSession): void {
  if (!canUseWebStorage()) {
    return;
  }

  clearStoredAuth();
  persistStore(session.persist).setItem(AUTH_TOKEN_STORAGE_KEY, JSON.stringify(session));
}

/** Elimina el JWT de ambos storages. */
export function clearStoredAuth(): void {
  if (!canUseWebStorage()) {
    return;
  }

  globalThis.sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  globalThis.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}
