/**
 * Pantalla de inicio de sesión (layout partido, sin shell DSC).
 * Conecta con `POST /api/auth/login/email`; Google, registro y recuperación
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
import { FormField, email, form, required, submit } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';

import { toAuthUserProfile } from '@core/models/auth.models';
import { AuthApiService } from '@core/services/auth-api.service';
import { AuthSessionService } from '@core/services/auth-session.service';
import { isRetryableHttpError, problemDetailMessage } from '@core/utils/http-error.utils';
import { safeInternalUrl } from '@core/utils/navigation.utils';

interface LoginFormModel {
  email: string;
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
  protected readonly touchedEmail = signal(false);
  protected readonly touchedPassword = signal(false);

  protected readonly loginModel = signal<LoginFormModel>({
    email: '',
    password: '',
  });

  protected readonly loginForm = form(this.loginModel, (p) => {
    required(p.email, { message: 'El correo es obligatorio' });
    email(p.email, { message: 'Ingresa un correo válido' });
    required(p.password, { message: 'La contraseña es obligatoria' });
  });

  protected readonly showEmailError = computed(
    () => this.touchedEmail() && this.loginForm.email().invalid(),
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
   * Envía las credenciales a la API y guarda el perfil en sesión.
   *
   * @param event - Submit del formulario.
   */
  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.touchedEmail.set(true);
    this.touchedPassword.set(true);
    this.submitError.set('');
    this.submitRetryable.set(false);

    void submit(this.loginForm, async () => {
      const { email, password } = this.loginModel();
      this.submitting.set(true);
      try {
        const dto = await firstValueFrom(
          this.api.loginWithEmail({ email: email.trim(), password }),
        );
        this.auth.applyAuthenticatedProfile(toAuthUserProfile(dto));
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
   * Actualiza "Recuérdame" (solo UI: la API fija la cookie a 60 minutos).
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
