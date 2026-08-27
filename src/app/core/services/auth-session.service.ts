/**
 * Sesión de autenticación de la aplicación.
 * El JWT vive en cookie HttpOnly; aquí solo se guarda el perfil.
 */
import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, of, tap } from 'rxjs';

import { toAuthUserProfile, type AuthUserProfile } from '@core/models/auth.models';
import { AuthApiService } from '@core/services/auth-api.service';

export type AuthHydrationStatus = 'idle' | 'pending' | 'ready';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly api = inject(AuthApiService);

  /** Perfil actual; `null` si no hay sesión. */
  private readonly sessionState = signal<AuthUserProfile | null>(null);

  /** Estado de la hidratación desde cookie (`GET /api/auth/me`). */
  private readonly hydrationState = signal<AuthHydrationStatus>('idle');

  /** Perfil autenticado o `null`. */
  readonly session = this.sessionState.asReadonly();

  /** `idle` hasta el primer hydrate; `ready` cuando ya se consultó `/me` o se hizo login. */
  readonly hydrationStatus = this.hydrationState.asReadonly();

  /**
   * Reservado por si un flujo futuro entrega JWT en JSON.
   * El login actual usa cookie: el interceptor no envía Bearer.
   */
  private readonly tokenState = signal<string | null>(null);
  readonly accessToken = this.tokenState.asReadonly();

  /** Indica si hay sesión activa. */
  readonly isAuthenticated = computed(() => this.sessionState() !== null);

  /**
   * Consulta `/api/auth/me` para restaurar la sesión desde la cookie.
   * Un 401 deja la sesión vacía; no bloquea el arranque.
   */
  hydrateFromServer(): void {
    if (this.hydrationState() !== 'idle') {
      return;
    }

    this.hydrationState.set('pending');
    this.api
      .getCurrentUser()
      .pipe(
        tap((dto) => {
          this.sessionState.set(toAuthUserProfile(dto));
          this.hydrationState.set('ready');
        }),
        catchError(() => {
          this.sessionState.set(null);
          this.hydrationState.set('ready');
          return of(null);
        }),
      )
      .subscribe();
  }

  /**
   * Guarda el perfil tras un login exitoso.
   *
   * @param profile - Perfil devuelto por la API.
   */
  applyAuthenticatedProfile(profile: AuthUserProfile): void {
    this.sessionState.set(profile);
    this.hydrationState.set('ready');
  }

  /**
   * Cierra la sesión en el cliente.
   * No puede borrar la cookie HttpOnly: no hay endpoint de logout.
   */
  clearSession(): void {
    this.sessionState.set(null);
  }
}
