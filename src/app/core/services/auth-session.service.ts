/**
 * Sesión de autenticación de la aplicación.
 * Expone `currentUser`, `isAuthenticated` y `roles` como Signals.
 * El JWT se guarda en Web Storage para que el interceptor envíe Bearer.
 */
import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, catchError, filter, map, of, take, tap } from 'rxjs';

import type { LoginResponseApiDto } from '@core/models/auth-api.models';
import { toAuthUserProfile, type AuthUserProfile } from '@core/models/auth.models';
import { AuthApiService } from '@core/services/auth-api.service';
import { clearStoredAuth, readStoredAuth, writeStoredAuth } from '@core/utils/auth-token.storage';

export type AuthHydrationStatus = 'idle' | 'pending' | 'ready';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly api = inject(AuthApiService);

  /** Perfil actual; `null` si no hay sesión. */
  private readonly sessionState = signal<AuthUserProfile | null>(null);

  /** Hidratación desde storage + `GET /api/v1/auth/me`. */
  private readonly hydrationState = signal<AuthHydrationStatus>('idle');

  private readonly tokenState = signal<string | null>(null);

  /** Perfil autenticado o `null`. */
  readonly currentUser = this.sessionState.asReadonly();

  /**
   * Alias de `currentUser` para pantallas que ya leían `session()`.
   */
  readonly session = this.currentUser;

  /** JWT en memoria (el interceptor lo lee). */
  readonly accessToken = this.tokenState.asReadonly();

  /** `idle` hasta el primer hydrate. */
  readonly hydrationStatus = this.hydrationState.asReadonly();

  /** Indica si hay perfil en sesión. */
  readonly isAuthenticated = computed(() => this.sessionState() !== null);

  /** Códigos de rol del usuario actual. */
  readonly roles = computed(() => this.sessionState()?.roles ?? []);

  /**
   * Restaura el JWT del storage y, si existe, valida el perfil con `/me`.
   * Sin token no llama a la API.
   */
  hydrateFromServer(): void {
    if (this.hydrationState() !== 'idle') {
      return;
    }

    const stored = readStoredAuth();
    if (!stored) {
      this.hydrationState.set('ready');
      return;
    }

    this.tokenState.set(stored.token);
    this.hydrationState.set('pending');
    this.api
      .getCurrentUser()
      .pipe(
        tap((dto) => {
          this.sessionState.set(toAuthUserProfile(dto));
          this.hydrationState.set('ready');
        }),
        catchError(() => {
          this.clearSession();
          this.hydrationState.set('ready');
          return of(null);
        }),
      )
      .subscribe();
  }

  /**
   * Completa cuando la hidratación terminó (útil en guards).
   *
   * @returns Observable que emite `true` si hay sesión.
   */
  ensureReady(): Observable<boolean> {
    if (this.hydrationState() === 'idle') {
      this.hydrateFromServer();
    }

    if (this.hydrationState() === 'ready') {
      return of(this.isAuthenticated());
    }

    return toObservable(this.hydrationState).pipe(
      filter((status) => status === 'ready'),
      take(1),
      map(() => this.isAuthenticated()),
    );
  }

  /**
   * Persiste el JWT y el perfil tras un login 200.
   *
   * @param response - Body de `POST /api/v1/auth/login`.
   * @param persist - Si es `true`, usa `localStorage` (Recuérdame).
   */
  applyLogin(response: LoginResponseApiDto, persist = false): void {
    const token = response.token.trim();
    this.tokenState.set(token);
    this.sessionState.set(toAuthUserProfile(response.user));
    this.hydrationState.set('ready');
    writeStoredAuth({
      token,
      expiresAt: response.expiresAt,
      persist,
    });
  }

  /**
   * Aplica un perfil sin token (tests o banner de UI).
   *
   * @param profile - Perfil ya mapeado.
   */
  applyAuthenticatedProfile(profile: AuthUserProfile): void {
    this.sessionState.set(profile);
    this.hydrationState.set('ready');
  }

  /**
   * Indica si el usuario tiene el rol indicado.
   *
   * @param role - Código de `role.code` (p. ej. `ADMIN`).
   */
  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  /**
   * Cierra la sesión en el cliente (borra JWT de memoria y storage).
   * No hay logout en la API: el token sigue válido hasta `exp`.
   */
  clearSession(): void {
    this.tokenState.set(null);
    this.sessionState.set(null);
    clearStoredAuth();
  }
}
