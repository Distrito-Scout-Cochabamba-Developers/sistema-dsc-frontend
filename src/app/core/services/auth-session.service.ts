/**
 * Sesión mock de autenticación del dirigente.
 * Sustituir por integración real (JWT / cookies) cuando exista backend.
 */
import { Injectable, computed, signal } from '@angular/core';

import type { LeaderSession } from '@core/models/attendance.models';

const MOCK_SESSION: LeaderSession = {
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
  private readonly sessionState = signal<LeaderSession | null>(MOCK_SESSION);

  /** JWT real cuando el backend lo emita. */
  private readonly tokenState = signal<string | null>(null);

  /** Perfil autenticado o `null`. */
  readonly session = this.sessionState.asReadonly();

  /** Token Bearer opcional para el interceptor. */
  readonly accessToken = this.tokenState.asReadonly();

  /** Indica si hay sesión activa. */
  readonly isAuthenticated = computed(() => this.sessionState() !== null);

  /**
   * Simula cierre / cambio de perfil (frontend-only).
   */
  clearSession(): void {
    this.sessionState.set(null);
    this.tokenState.set(null);
  }

  /**
   * Simula login con el perfil mock del demo.
   */
  restoreDemoSession(): void {
    this.sessionState.set(MOCK_SESSION);
    this.tokenState.set(null);
  }

  /**
   * Alterna la sesión demo: cierra si hay una activa, la restaura si no.
   * Encapsula la decisión de sesión para que consumidores (ej. el shell)
   * no tengan que conocer la regla de negocio.
   */
  toggleDemoSession(): void {
    if (this.isAuthenticated()) {
      this.clearSession();
      return;
    }
    this.restoreDemoSession();
  }
}
