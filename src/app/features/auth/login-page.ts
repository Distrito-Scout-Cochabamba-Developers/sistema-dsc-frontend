/**
 * Pantalla de inicio de sesión (layout partido, sin shell DSC).
 * Conecta con `POST /api/v1/auth/login`; Google, registro y recuperación
 * se muestran deshabilitados porque la API no los expone.
 */
import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormField, form, required, submit } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';

import { AuthApiService } from '@core/services/auth-api.service';
import { AuthSessionService } from '@core/services/auth-session.service';
import { isRetryableHttpError, problemDetailMessage } from '@core/utils/http-error.utils';
import { safeInternalUrl } from '@core/utils/navigation.utils';

interface LoginFormModel {
  identifier: string;
  password: string;
}

/** Ruta pública del emblema (archivo en `public/assets/branding/`). */
export const DISTRITO_EMBLEM_SRC = '/assets/branding/distrito-cochabamba-emblem.png';

@Component({
  selector: 'app-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, NgOptimizedImage, RouterLink],
  templateUrl: './login-page.html',
})
export class LoginPage {
  private readonly api = inject(AuthApiService);
  private readonly auth = inject(AuthSessionService);
  private readonly router = inject(Router);
  private readonly queryParamMap = toSignal(inject(ActivatedRoute).queryParamMap, {
    initialValue: inject(ActivatedRoute).snapshot.queryParamMap,
  });

  protected readonly emblemSrc = DISTRITO_EMBLEM_SRC;
  protected readonly currentYear = new Date().getFullYear();
  protected readonly submitting = signal(false);
  protected readonly submitError = signal('');
  protected readonly submitRetryable = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly rememberMe = signal(false);
  protected readonly touchedIdentifier = signal(false);
  protected readonly touchedPassword = signal(false);

  protected readonly loginModel = signal<LoginFormModel>({
    identifier: '',
    password: '',
  });

  protected readonly loginForm = form(this.loginModel, (p) => {
    required(p.identifier, { message: 'El usuario o correo es obligatorio' });
    required(p.password, { message: 'La contraseña es obligatoria' });
  });

  protected readonly showIdentifierError = computed(
    () => this.touchedIdentifier() && this.loginForm.identifier().invalid(),
  );

  protected readonly showPasswordError = computed(
    () => this.touchedPassword() && this.loginForm.password().invalid(),
  );

  protected readonly unavailableHint =
    'Esta opción todavía no está disponible: la API no expone el flujo.';

  constructor() {
    effect(() => {
      if (!this.auth.isAuthenticated()) {
        return;
      }
      void this.router.navigateByUrl(this.returnUrl());
    });
  }

  /**
   * Envía identificador y contraseña; guarda JWT + perfil.
   *
   * @param event - Submit del formulario.
   */
  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.touchedIdentifier.set(true);
    this.touchedPassword.set(true);
    this.submitError.set('');
    this.submitRetryable.set(false);

    void submit(this.loginForm, async () => {
      const { identifier, password } = this.loginModel();
      this.submitting.set(true);
      try {
        const response = await firstValueFrom(
          this.api.login({ identifier: identifier.trim(), password }),
        );
        this.auth.applyLogin(response, this.rememberMe());
        await this.router.navigateByUrl(this.returnUrl());
      } catch (error) {
        this.submitError.set(
          problemDetailMessage(error, 'No se pudo iniciar sesión. Intenta de nuevo.'),
        );
        this.submitRetryable.set(isRetryableHttpError(error));
      } finally {
        this.submitting.set(false);
      }
    });
  }

  /** Reenvía el formulario tras un error transitorio. */
  protected retrySubmit(): void {
    this.onSubmit(new Event('submit', { cancelable: true, bubbles: true }));
  }

  /** Alterna visibilidad de la contraseña. */
  protected togglePasswordVisibility(): void {
    this.showPassword.update((visible) => !visible);
  }

  /**
   * Recuérdame: persiste el JWT en `localStorage` en lugar de `sessionStorage`.
   *
   * @param event - Change del checkbox.
   */
  protected onRememberMeChange(event: Event): void {
    const target = event.target;
    this.rememberMe.set(target instanceof HTMLInputElement && target.checked);
  }

  /**
   * Destino post-login. Solo rutas internas.
   */
  private returnUrl(): string {
    return safeInternalUrl(this.queryParamMap().get('returnUrl'));
  }
}
