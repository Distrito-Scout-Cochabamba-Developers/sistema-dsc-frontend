import { DatePipe } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { Subscription } from 'rxjs';

import { AuthSessionService } from '@core/services/auth-session.service';
import { apiUrl } from '@core/utils/api-url.utils';

/** Campos de la convocatoria que identifican la opción en el selector. */
interface SessionOption {
  readonly id: number;
  readonly moduleName: string;
  readonly startsAt: string;
}

/** Campos de la coincidencia mostrados por el panel de solo lectura. */
interface Participant {
  readonly personId: number;
  readonly isScoutLeader: boolean;
  readonly hasAccount: boolean;
  readonly firstName: string;
  readonly lastName: string;
  readonly ciNumber: string;
  readonly extension: string;
  readonly phone: string;
}

/** Busca una persona sin modificar su perfil ni inscribirla en la convocatoria elegida. */
@Component({
  selector: 'app-secretariat-enrollment-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  templateUrl: './secretariat-enrollment-panel.html',
})
export class SecretariatEnrollmentPanel {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly auth = inject(AuthSessionService);
  protected readonly sessions = signal<readonly SessionOption[] | null>(null);
  protected readonly sessionsFailed = signal(false);
  protected readonly session = signal('');
  protected readonly ci = signal('');
  protected readonly extension = signal('');
  protected readonly needsExtension = signal(false);
  protected readonly busy = signal(false);
  protected readonly confirming = signal(false);
  protected readonly participant = signal<Participant | null>(null);
  protected readonly rover = signal(false);
  protected readonly message = signal('');
  private lookup: Subscription | undefined;
  private confirmation: Subscription | undefined;

  constructor() {
    // El panel nunca usa las convocatorias de demostración del calendario público.
    this.http
      .get<readonly SessionOption[]>(apiUrl('/api/v1/calendar/sessions'))
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (sessions) => this.sessions.set(sessions),
        error: () => this.sessionsFailed.set(true),
      });

    // El shell puede cerrar sesión sin desmontar la página.
    effect(() => {
      if (!this.auth.hasRole('DISTRICT_SECRETARY')) {
        this.session.set('');
        this.confirming.set(false);
        this.editCi('');
      }
    });
  }

  /** Confirma explícitamente la inscripción de la persona y convocatoria seleccionadas. */
  protected confirm(): void {
    const person = this.participant();
    if (!person || (this.rover() && person.hasAccount) || (!person.isScoutLeader && !this.rover()) || this.busy() || !this.session() || !this.auth.hasRole('DISTRICT_SECRETARY')) return;
    this.busy.set(true);
    this.confirming.set(true);
    this.confirmation = this.http.post(apiUrl(`/api/v1/secretariat/participants/${person.personId}/sessions/${this.session()}/enrollments`), this.rover() ? { modality: 'ROVER_WITHOUT_ACCOUNT' } : {})
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => { this.confirming.set(false); this.participant.set(null); this.busy.set(false); this.message.set('Inscripción confirmada.'); },
        error: (error: unknown) => {
          this.confirming.set(false);
          this.busy.set(false);
          if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
            this.editCi('');
            this.message.set(error.status === 401 ? 'La sesión ha caducado. Inicia sesión nuevamente.' : 'No tienes autorización para confirmar inscripciones.');
            return;
          }
          const type = error instanceof HttpErrorResponse ? error.error?.type : '';
          if (type === 'urn:dsc:enrollment:rover-has-account') this.message.set('La persona ya tiene cuenta. No puede inscribirse como Rover sin cuenta.');
          else if (type === 'urn:dsc:enrollment:session-full') this.message.set('Sin cupo en esta convocatoria.');
          else if (type === 'urn:dsc:enrollment:enrollment-closed') this.message.set('La inscripción está cerrada.');
          else if (type === 'urn:dsc:enrollment:already-enrolled') this.message.set('La persona ya está inscrita.');
          else {
            this.participant.set(null);
            this.message.set('El resultado de la confirmación es incierto. Verifica la inscripción antes de reintentar.');
          }
        },
      });
  }

  /** Al cambiar de convocatoria elimina los datos de la consulta previa. */
  protected selectSession(id: string): void {
    if (this.confirming()) return;
    this.session.set(id);
    this.editCi('');
  }

  /** Invalida el resultado y el complemento de la búsqueda anterior. */
  protected editCi(ci: string): void {
    if (this.confirming()) return;
    this.clearResult();
    this.ci.set(ci);
    this.extension.set('');
    this.needsExtension.set(false);
  }

  /** Cancela la búsqueda en curso antes de probar otro complemento. */
  protected editExtension(extension: string): void {
    if (this.confirming()) return;
    this.clearResult();
    this.extension.set(extension);
  }

  /** Valida el contexto y envía el CI solo en el cuerpo de la consulta. */
  protected search(event: Event): void {
    event.preventDefault();
    if (
      !this.auth.hasRole('DISTRICT_SECRETARY') ||
      this.busy() ||
      !this.sessions()?.some(({ id }) => String(id) === this.session())
    )
      return;

    const ci = this.ci().trim();
    const extension = this.extension();
    this.clearResult();
    if (!/^[0-9]{4,10}$/.test(ci) || (this.needsExtension() && !extension)) {
      this.message.set(
        'Ingresa un CI de 4 a 10 dígitos y selecciona el complemento si se solicita.',
      );
      return;
    }

    this.busy.set(true);
    this.lookup = this.http
      .post<Participant>(
        apiUrl('/api/v1/secretariat/participants/lookup'),
        extension ? { ci, extension } : { ci },
        { cache: 'no-store' },
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (participant) => {
          this.participant.set(participant);
          this.busy.set(false);
        },
        error: (error: unknown) => this.showFailure(error, Boolean(extension)),
      });
  }

  /** Distingue resultados de negocio de errores sin mostrar datos del error HTTP. */
  private showFailure(error: unknown, triedExtension: boolean): void {
    this.busy.set(false);
    if (error instanceof HttpErrorResponse) {
      if (error.status === 409) {
        this.needsExtension.set(true);
        this.message.set(
          triedExtension
            ? 'Sigue habiendo varias coincidencias con ese complemento. No se seleccionó a nadie.'
            : 'Hay varias coincidencias. Selecciona el complemento del CI y vuelve a buscar.',
        );
        return;
      }
      if (
        error.status === 404 &&
        error.error?.type === 'urn:dsc:secretariat:participant-not-found'
      ) {
        this.message.set('No se encontró ninguna persona con los datos indicados.');
        return;
      }
      if (error.status === 401 || error.status === 403) {
        this.editCi('');
        this.message.set('La consulta requiere una sesión activa de Secretaría.');
        return;
      }
    }
    this.message.set('No se pudo realizar la consulta. Inténtalo de nuevo.');
  }

  /** Descarta datos personales y evita que una respuesta tardía vuelva a mostrarlos. */
  private clearResult(): void {
    this.lookup?.unsubscribe();
    this.confirmation?.unsubscribe();
    this.lookup = undefined;
    this.participant.set(null);
    this.rover.set(false);
    this.message.set('');
    this.busy.set(false);
  }
}
