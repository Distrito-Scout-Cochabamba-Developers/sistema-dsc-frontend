/**
 * Separa un nombre completo en nombre y apellidos para el contrato de la API.
 *
 * @param fullName - Nombre ingresado en el formulario.
 */
export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  if (!first) {
    return { firstName: '', lastName: '' };
  }

  if (parts.length === 1) {
    return { firstName: first, lastName: first };
  }

  return { firstName: first, lastName: parts.slice(1).join(' ') };
}

/**
 * Une nombre y apellidos del DTO de lookup.
 *
 * @param firstName - Nombre.
 * @param lastName - Apellidos.
 */
export function joinPersonName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}
