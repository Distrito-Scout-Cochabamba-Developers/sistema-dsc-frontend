import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { apiUrl } from '@core/utils/api-url.utils';
import {
  EXTENSION_REQUIRED_TYPE,
  enrollmentConflictMessage,
  problemType,
} from './secretariat-enrollment-messages';

/** Resultado que el panel anfitrión debe reflejar; nunca incluye datos personales. */
export type NewRoverOutcome =
  | 'enrolled'
  | 'person-exists'
  | 'extension-required'
  | 'unauthorized'
  | 'forbidden'
  | 'uncertain';

/**
 * Alta mínima de un Rover sin cuenta (#160). Perfil e inscripción los guarda el servidor
 * juntos o ninguno; no solicita ni crea credenciales, afiliación, rama ni rol.
 */
@Component({
  selector: 'app-secretariat-new-rover-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './secretariat-new-rover-form.html',
})
export class SecretariatNewRoverForm {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  /** Convocatoria elegida en el panel. */
  readonly sessionId = input.required<string>();
  /** CI ya buscado sin coincidencias. */
  readonly ci = input.required<string>();
  /** Complemento usado en la búsqueda, si lo hubo. */
  readonly extension = input<string>('');
  readonly finished = output<NewRoverOutcome>();
  protected readonly firstName = signal('');
  protected readonly lastName = signal('');
  protected readonly phone = signal('');
  protected readonly busy = signal(false);
  protected readonly message = signal('');

  /** Envía una sola solicitud; un conflicto de negocio permite corregir y reintentar. */
  protected submit(event: Event): void {
    event.preventDefault();
    if (this.busy()) return;
    const firstName = this.firstName().trim();
    const lastName = this.lastName().trim();
    const phone = this.phone().trim();
    if (!firstName || !lastName) {
      this.message.set('Ingresa nombres y apellidos para registrar al Rover.');
      return;
    }
    this.busy.set(true);
    this.message.set('');
    const extension = this.extension();
    this.http
      .post(apiUrl(`/api/v1/secretariat/sessions/${this.sessionId()}/rover-enrollments`), {
        ci: this.ci(),
        ...(extension ? { extension } : {}),
        firstName,
        lastName,
        ...(phone ? { phone } : {}),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.finished.emit('enrolled'),
        error: (error: unknown) => this.fail(error),
      });
  }

  private fail(error: unknown): void {
    this.busy.set(false);
    if (!(error instanceof HttpErrorResponse)) return this.finished.emit('uncertain');
    if (error.status === 401) return this.finished.emit('unauthorized');
    if (error.status === 403) return this.finished.emit('forbidden');
    if (error.status === 400) {
      this.message.set('Revisa el CI, los nombres, los apellidos y el celular.');
      return;
    }
    if (error.status === 409) {
      const type = problemType(error);
      if (type === 'urn:dsc:enrollment:person-exists') return this.finished.emit('person-exists');
      if (type === EXTENSION_REQUIRED_TYPE) return this.finished.emit('extension-required');
      const message = enrollmentConflictMessage(type);
      if (message) this.message.set(message);
      else this.finished.emit('uncertain');
      return;
    }
    this.finished.emit('uncertain');
  }
}
