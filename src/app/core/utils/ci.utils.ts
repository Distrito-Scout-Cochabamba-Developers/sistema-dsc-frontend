/**
 * Opciones de extensión de CI (departamentos de Bolivia).
 */
import type { CiExtensionOption, DepartamentoCode } from '@core/models/asistencia.models';

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

/** Fuente única de verdad del formato de CI (7–10 dígitos, típico Bolivia). */
export const CI_NUMBER_PATTERN = /^\d{7,10}$/;

/** Fuente única de verdad del formato de móvil boliviano (8 dígitos). */
export const BOLIVIA_MOBILE_PATTERN = /^\d{8}$/;

/**
 * Indica si el CI es numérico válido (7–10 dígitos, típico Bolivia).
 *
 * @param value - Texto del CI (sin extensión).
 * @returns `true` si solo contiene dígitos y tiene longitud válida.
 */
export function isValidCiNumber(value: string): boolean {
  return CI_NUMBER_PATTERN.test(value.trim());
}

/**
 * Indica si el teléfono móvil boliviano es plausible (8 dígitos).
 *
 * @param value - Teléfono ingresado.
 */
export function isValidBoliviaMobile(value: string): boolean {
  return BOLIVIA_MOBILE_PATTERN.test(value.trim());
}

/**
 * Indica si un valor crudo de `<select>` es un código de departamento válido.
 *
 * @param value - Valor del campo de extensión, aún sin validar.
 */
export function isValidDepartamentoCode(value: string): value is DepartamentoCode {
  return CI_EXTENSIONS.some((ext) => ext.code === value);
}
