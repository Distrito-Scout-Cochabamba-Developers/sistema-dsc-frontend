/**
 * Construye la URL hacia un path de la API DSC.
 *
 * @param path - Ruta que comienza con `/api`.
 */
import { environment } from '../../../environments/environment';

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = environment.apiBaseUrl.replace(/\/$/, '');
  return `${base}${normalizedPath}`;
}
