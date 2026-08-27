/**
 * Token de sesión demo (deep link). Debe coincidir con `TrainingModule.Code`.
 */
export const DEMO_SESSION_TOKEN = 'mod-liderazgo-20241024';

const FALLBACK_MODULE_IMAGE =
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80';

/**
 * Vista de sesión desde el token de la URL.
 * El backend no expone GET de metadatos; el POST valida el código.
 *
 * @param sessionId - `TrainingModule.Code` del deep link.
 */
export function buildModuleSessionView(sessionId: string): {
  sessionId: string;
  moduleTitle: string;
  moduleName: string;
  description: string;
  imageAlt: string;
  imageUrl: string;
} | null {
  const id = sessionId.trim();
  if (!id) {
    return null;
  }

  return {
    sessionId: id,
    moduleTitle: 'Registro de Participantes',
    moduleName:
      id === DEMO_SESSION_TOKEN ? 'Módulo de Liderazgo y Servicio' : id,
    description:
      'Completa el formulario para confirmar tu asistencia. Verifica que tus datos sean correctos para asegurar el registro de tus créditos de formación.',
    imageAlt: 'Dirigentes scout en taller de liderazgo',
    imageUrl: FALLBACK_MODULE_IMAGE,
  };
}

/**
 * URL de imagen QR para un deep link de asistencia.
 *
 * @param absoluteUrl - URL absoluta de `/asistencia/{sessionId}`.
 */
export function attendanceQrImageUrl(absoluteUrl: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(absoluteUrl)}`;
}
