/**
 * Directorio mock de adultos del distrito (lookup por CI).
 * Reemplazar por HttpClient cuando exista API.
 */
import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

import type { DistrictAdult, ModuleSession } from '@core/models/attendance.models';

const MOCK_ADULTS: readonly DistrictAdult[] = [
  {
    ci: '12345678',
    fullName: 'Juan Pérez Mendoza',
    extension: 'LP',
    phone: '70000000',
  },
  {
    ci: '87654321',
    fullName: 'María López Quispe',
    extension: 'CB',
    phone: '71234567',
  },
];

const MOCK_SESSIONS: Record<string, ModuleSession> = {
  'mod-liderazgo-20241024': {
    sessionId: 'mod-liderazgo-20241024',
    moduleTitle: 'Registro de Participantes',
    moduleName: 'Módulo de Liderazgo y Servicio',
    description:
      'Completa el formulario para confirmar tu asistencia. Verifica que tus datos sean correctos para asegurar el registro de tus créditos de formación.',
    dateLabel: 'Hoy: 24 Oct 2024',
    timeLabel: 'Hora: 19:30',
    imageAlt: 'Dirigentes scout en taller de liderazgo',
    imageUrl:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
  },
};

@Injectable({ providedIn: 'root' })
export class AdultDirectoryService {
  /**
   * Busca un adulto por CI en el directorio distrital (mock).
   *
   * @param ci - Carnet de identidad numérico.
   * @returns Observable con el adulto o `null` si no existe.
   */
  lookupByCi(ci: string): Observable<DistrictAdult | null> {
    const normalized = ci.trim();
    const found = MOCK_ADULTS.find((adult) => adult.ci === normalized) ?? null;
    return of(found).pipe(delay(450));
  }

  /**
   * Obtiene metadatos de la sesión del módulo (mock / deep link QR).
   *
   * @param sessionId - Identificador de sesión del QR o link directo.
   */
  getModuleSession(sessionId: string): Observable<ModuleSession | null> {
    const session = MOCK_SESSIONS[sessionId] ?? null;
    return of(session).pipe(delay(150));
  }
}
