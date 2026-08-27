/**
 * Permite solo rutas internas relativas (evita open-redirect).
 *
 * @param raw - Valor de `returnUrl` u otra query.
 * @param fallback - Ruta si el valor es inseguro o vacío.
 */
export function safeInternalUrl(raw: string | null | undefined, fallback = '/'): string {
  if (!raw) {
    return fallback;
  }

  const trimmed = raw.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) {
    return fallback;
  }

  return trimmed;
}
