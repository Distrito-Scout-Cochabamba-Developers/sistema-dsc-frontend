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
  protected readonly participant = signal<Participant | null>(null);
  protected readonly message = signal('');
  private lookup: Subscription | undefined;

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
      if (!this.auth.hasRole('DISTRICT_SECRETARY')) this.selectSession('');
    });
  }

  /** Al cambiar de convocatoria elimina los datos de la consulta previa. */
  protected selectSession(id: string): void {
    this.session.set(id);
    this.editCi('');
  }

  /** Invalida el resultado y el complemento de la búsqueda anterior. */
  protected editCi(ci: string): void {
    this.clearResult();
    this.ci.set(ci);
    this.extension.set('');
    this.needsExtension.set(false);
  }

  /** Cancela la búsqueda en curso antes de probar otro complemento. */
  protected editExtension(extension: string): void {
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
    this.lookup = undefined;
    this.participant.set(null);
    this.message.set('');
    this.busy.set(false);
  }
}
