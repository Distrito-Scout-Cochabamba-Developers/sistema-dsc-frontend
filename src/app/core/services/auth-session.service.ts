/**
 * Sesión mock de autenticación del dirigente.
 * Sustituir por integración real (JWT / cookies) cuando exista backend.
 */
import { Injectable, computed, signal } from '@angular/core';

import type { DirigenteSession } from '@core/models/asistencia.models';

const MOCK_SESSION: DirigenteSession = {
  id: 'dir-001',
  displayName: 'Dir. Juan Pérez',
  fullName: 'Juan Pérez Mendoza',
  ci: '12345678',
  extension: 'LP',
  phone: '70000000',
};

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  /** Sesión actual; `null` si el dirigente no está autenticado. */
  private readonly sessionState = signal<DirigenteSession | null>(MOCK_SESSION);

  /** Perfil autenticado o `null`. */
  readonly session = this.sessionState.asReadonly();

  /** Indica si hay sesión activa. */
  readonly isAuthenticated = computed(() => this.sessionState() !== null);

  /**
   * Simula cierre / cambio de perfil (frontend-only).
   */
  clearSession(): void {
    this.sessionState.set(null);
  }

  /**
   * Simula login con el perfil mock del demo.
   */
  restoreDemoSession(): void {
    this.sessionState.set(MOCK_SESSION);
  }
}
