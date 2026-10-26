/**
 * Token de sesión demo (deep link). Debe coincidir con `TrainingModule.Code`.
 */
import type { TrainingModuleApiDto } from '@core/models/attendance-api.models';
import type { ModuleSession } from '@core/models/attendance.models';

export const DEMO_SESSION_TOKEN = 'mod-liderazgo-20241024';

const FALLBACK_MODULE_IMAGE =
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80';

/**
 * Adapta el DTO de catálogo a la vista del formulario de asistencia.
 *
 * @param dto - Módulo persistido en la API.
 */
export function toModuleSession(dto: TrainingModuleApiDto): ModuleSession {
  return {
    sessionId: dto.code,
    moduleTitle: 'Registro de Participantes',
    moduleName: dto.name,
    description:
      dto.description?.trim() ||
      'Completa el formulario para confirmar tu asistencia. Verifica que tus datos sean correctos para asegurar el registro de tus créditos de formación.',
    imageAlt: `Formación: ${dto.name}`,
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
