import { Location } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { apiUrl } from '@core/utils/api-url.utils';

/** Permite que la persona invitada elija su contraseña sin iniciar sesión automáticamente. */
@Component({
  selector: 'app-activation-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './activation-page.html',
})
export class ActivationPage {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly location = inject(Location);
  // El fragmento no viaja al servidor. Nunca se copia a parámetros, almacenamiento o mensajes.
  private token = new URLSearchParams(inject(ActivatedRoute).snapshot.fragment ?? '').get('token');

  protected readonly hasToken = signal(/^[A-Za-z0-9_-]{43}$/.test(this.token ?? ''));
  protected readonly submitting = signal(false);
  protected readonly activated = signal(false);
  protected readonly error = signal('');
  protected readonly invalidField = signal<'password' | 'confirmation' | null>(null);

  /**
   * Valida ambos campos, luego canjea el enlace por POST; nunca lo canjea al navegar.
   * @param event - Envío explícito del formulario.
   * @param password - Campo de nueva contraseña.
   * @param confirmation - Campo de confirmación.
   */
  protected activate(
    event: Event,
    password: HTMLInputElement,
    confirmation: HTMLInputElement,
  ): void {
    event.preventDefault();
    if (!this.token || !this.hasToken() || this.submitting() || this.activated()) return;
    this.error.set('');
    this.invalidField.set(null);

    const value = password.value;
    if (
      Array.from(value).length < 12 ||
      !value.trim() ||
      new TextEncoder().encode(value).length > 72
    ) {
      this.error.set('Usa al menos 12 caracteres y no superes 72 bytes. Evita usar solo espacios.');
      this.invalidField.set('password');
      password.focus();
      return;
    }
    if (value !== confirmation.value) {
      this.error.set('Las contraseñas no coinciden.');
      this.invalidField.set('confirmation');
      confirmation.focus();
      return;
    }

    this.submitting.set(true);
    this.http
      .post<void>(apiUrl('/api/v1/auth/activate'), { token: this.token, password: value })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.submitting.set(false)),
      )
      .subscribe({
        next: () => {
          password.value = confirmation.value = '';
          this.token = null;
          this.location.replaceState('/auth/activar');
          this.activated.set(true);
        },
        error: (response: unknown) => {
          this.error.set(
            response instanceof HttpErrorResponse && response.status === 400
              ? 'El enlace no es válido, caducó o ya se usó. Si ya activaste tu cuenta, inicia sesión. Si no, solicita otro enlace a Secretaría.'
              : 'No se pudo confirmar la activación. Prueba iniciar sesión o vuelve a intentar.',
          );
        },
      });
  }
}
