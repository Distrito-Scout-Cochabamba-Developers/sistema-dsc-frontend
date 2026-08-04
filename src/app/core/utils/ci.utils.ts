/**
 * Opciones de extensión de CI (departamentos de Bolivia).
 */
import type { CiExtensionOption } from '@core/models/asistencia.models';

export const CI_EXTENSIONS: readonly CiExtensionOption[] = [
  { code: 'LP', label: 'La Paz' },
  { code: 'CB', label: 'Cochabamba' },
  { code: 'SC', label: 'Santa Cruz' },
  { code: 'OR', label: 'Oruro' },
  { code: 'PT', label: 'Potosí' },
  { code: 'TJ', label: 'Tarija' },
  { code: 'CH', label: 'Chuquisaca' },
  { code: 'BE', label: 'Beni' },
  { code: 'PD', label: 'Pando' },
] as const;

/**
 * Indica si el CI es numérico válido (7–10 dígitos, típico Bolivia).
 *
 * @param value - Texto del CI (sin extensión).
 * @returns `true` si solo contiene dígitos y tiene longitud válida.
 */
export function isValidCiNumber(value: string): boolean {
  return /^\d{7,10}$/.test(value.trim());
}

/**
 * Indica si el teléfono móvil boliviano es plausible (8 dígitos).
 *
 * @param value - Teléfono ingresado.
 */
export function isValidBoliviaMobile(value: string): boolean {
  return /^\d{8}$/.test(value.trim());
}
