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
import { DatePickerComponent } from '@shared/components/form-controls/date-picker/date-picker.component';
import {
  SelectComponent,
  type SelectOption,
} from '@shared/components/form-controls/select/select.component';
import { TextFieldComponent } from '@shared/components/form-controls/text-field/text-field.component';
import { ButtonComponent } from '@shared/components/buttons/button/button.component';
import { BadgeComponent } from '@shared/components/ui-elements/badge/badge.component';
import { CardComponent } from '@shared/components/ui-elements/card/card.component';
import {
  EXTENSION_REQUIRED_MESSAGE,
  EXTENSION_REQUIRED_TYPE,
  FORBIDDEN_MESSAGE,
  SESSION_EXPIRED_MESSAGE,
  UNCERTAIN_RESULT_MESSAGE,
  enrollmentConflictMessage,
  problemType,
} from './secretariat-enrollment-messages';
import { SecretariatNewRoverForm, type NewRoverOutcome } from './secretariat-new-rover-form';

/** Campos de la programación que identifican la opción en el selector. */
interface SessionOption {
  readonly id: number;
  readonly moduleName: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly location: string | null;
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
  readonly condition: 'ROVER' | 'LEADER' | null;
  readonly isEnrolled: boolean;
}

/** Respuestas del reintento que cierran la invitación pendiente en lugar de mantenerla. */
const RETRY_RESOLUTIONS: ReadonlyMap<string, string> = new Map([
  ['urn:dsc:invitation:already-sent', 'El correo de activación fue enviado.'],
  ['urn:dsc:invitation:not-eligible', 'La cuenta ya no admite una invitación.'],
]);

/** Busca una persona sin modificar su perfil ni inscribirla en la programación elegida. */
@Component({
  selector: 'app-secretariat-enrollment-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    DatePickerComponent,
    SelectComponent,
    SecretariatNewRoverForm,
    TextFieldComponent,
    ButtonComponent,
    BadgeComponent,
    CardComponent,
  ],
  templateUrl: './secretariat-enrollment-panel.html',
})
export class SecretariatEnrollmentPanel {
  /** Opciones departamentales para el complemento del Carnet de Identidad. */
  protected readonly extensionOptions: SelectOption[] = [
    { value: 'BE', label: 'BE' },
    { value: 'CB', label: 'CB' },
    { value: 'CH', label: 'CH' },
    { value: 'LP', label: 'LP' },
    { value: 'OR', label: 'OR' },
    { value: 'PD', label: 'PD' },
    { value: 'PT', label: 'PT' },
    { value: 'SC', label: 'SC' },
    { value: 'TJ', label: 'TJ' },
  ];
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly auth = inject(AuthSessionService);
  protected readonly sessions = signal<readonly SessionOption[] | null>(null);
  protected readonly sessionsFailed = signal(false);
  protected readonly session = signal('');
  protected readonly selectedSession = signal<SessionOption | null>(null);
  protected readonly ci = signal('');
  protected readonly extension = signal('');
  protected readonly needsExtension = signal(false);
  protected readonly busy = signal(false);
  protected readonly confirming = signal(false);
  protected readonly participant = signal<Participant | null>(null);
  protected readonly canCreate = signal(false);
  protected readonly creationType = signal<'rover' | 'leader' | null>(null);
  protected readonly sessionSearch = signal('');
  protected readonly from = signal('');
  protected readonly to = signal('');
  /** La última búsqueda confirmó que no existe nadie con ese Carnet de Identidad: habilita el alta de Rover nuevo. */
  protected readonly noMatch = signal(false);
  protected readonly message = signal('');
  /**
   * Inscripciones cuyo correo de activación sigue pendiente (cargadas al iniciar o creadas en esta sesión).
   * Solo identificadores, sin datos personales; la búsqueda no los descarta.
   */
  protected readonly pendingInvitations = signal<readonly number[]>([]);
  private lookup: Subscription | undefined;
  private confirmation: Subscription | undefined;
  private sessionRequest: Subscription | undefined;

  constructor() {
    // El panel nunca usa las programaciones de demostración del calendario público.
    this.loadSessions();

    // Permite reintentar tras recargar la página: solo se conservan identificadores de inscripción.
    this.http
      .get<readonly { readonly enrollmentId: number }[]>(apiUrl('/api/v1/secretariat/invitations/pending'))
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (pending) => this.pendingInvitations.set(pending.map(({ enrollmentId }) => enrollmentId)),
        error: () => undefined,
      });

    // El shell puede cerrar sesión sin desmontar la página.
    effect(() => {
      if (!this.auth.hasRole('DISTRICT_SECRETARY')) {
        this.session.set('');
        this.selectedSession.set(null);
        this.confirming.set(false);
        this.editCi('');
      }
    });
  }

  /** Confirma explícitamente la inscripción de la persona y programación seleccionadas. */
  protected confirm(): void {
    const person = this.participant();
    if (!person || !person.condition || person.isEnrolled || this.busy() || !this.session() || !this.auth.hasRole('DISTRICT_SECRETARY')) return;
    this.busy.set(true);
    this.confirming.set(true);
    this.confirmation = this.http.post(apiUrl(`/api/v1/secretariat/participants/${person.personId}/sessions/${this.session()}/enrollments`), { ci: this.ci().trim(), extension: this.extension() || null })
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => { this.confirming.set(false); this.participant.set(null); this.busy.set(false); this.message.set('Inscripción confirmada.'); },
        error: (error: unknown) => {
          this.confirming.set(false);
          this.busy.set(false);
          if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
            this.editCi('');
            this.message.set(error.status === 401 ? SESSION_EXPIRED_MESSAGE : FORBIDDEN_MESSAGE);
            return;
          }
          const type = problemType(error);
          const conflict = enrollmentConflictMessage(type);
          if (conflict) {
            if (type === 'urn:dsc:enrollment:already-enrolled') this.participant.update((current) => current ? { ...current, isEnrolled: true } : null);
            this.message.set(conflict);
          }
          else if (type === EXTENSION_REQUIRED_TYPE) this.askForComplement();
          else if (type === 'urn:dsc:enrollment:rover-has-account') this.message.set('La persona ya tiene cuenta. No puede inscribirse como Rover sin cuenta.');
          else if (type === 'urn:dsc:secretariat:identity-changed') {
            this.participant.set(null);
            this.message.set('La identidad cambió. Vuelve a buscar antes de confirmar.');
          } else {
            this.participant.set(null);
            this.message.set(UNCERTAIN_RESULT_MESSAGE);
          }
        },
      });
  }

  /** Crea el perfil mínimo junto con la inscripción, nunca por separado. */
  protected create(event: Event): void {
    event.preventDefault();
    if (!this.canCreate() || this.busy() || !this.auth.hasRole('DISTRICT_SECRETARY')) return;
    const form = event.currentTarget as HTMLFormElement;
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const field = (name: string) => String(values.get(name) ?? '').trim();
    if (['firstName', 'lastName', 'phone', 'email'].some((name) => !field(name))) {
      this.message.set('Completa nombres, apellidos, celular y correo.');
      return;
    }
    this.busy.set(true);
    this.confirming.set(true);
    this.confirmation = this.http.post(apiUrl(`/api/v1/secretariat/participants/sessions/${this.session()}/enrollments`), {
      ci: this.ci().trim(), extension: this.extension() || null,
      firstName: field('firstName'), lastName: field('lastName'), phone: field('phone'), email: field('email'),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (result) => {
        this.confirming.set(false); this.busy.set(false); this.canCreate.set(false); this.noMatch.set(false);
        const { enrollmentId, invitation } = result as { enrollmentId?: number; invitation?: string };
        if (invitation === 'SENT') this.message.set('Inscripción confirmada. El correo de activación fue enviado.');
        else {
          if (typeof enrollmentId === 'number') this.addPending(enrollmentId);
          this.message.set('Inscripción confirmada. El correo de activación quedó pendiente; puedes reintentar el envío.');
        }
      },
      error: (error: unknown) => {
        this.confirming.set(false); this.busy.set(false);
        const type = problemType(error);
        const status = error instanceof HttpErrorResponse ? error.status : 0;
        const conflict = enrollmentConflictMessage(type);
        if (type === 'urn:dsc:secretariat:identity-changed') { this.closeCreation(); this.message.set('El Carnet de Identidad ya tiene coincidencias. Vuelve a buscar.'); }
        else if (type === EXTENSION_REQUIRED_TYPE) this.askForComplement();
        else if (type === 'urn:dsc:secretariat:email-in-use') this.message.set('El correo ya pertenece a otra cuenta. Usa otro correo; no se creó nada.');
        else if (conflict) this.message.set(conflict);
        else if (status === 400) this.message.set('Revisa los datos obligatorios.');
        else if (status === 401 || status === 403) { this.closeCreation(); this.message.set('La inscripción requiere una sesión activa de Secretaría.'); }
        else { this.closeCreation(); this.message.set(UNCERTAIN_RESULT_MESSAGE); }
      },
    });
  }

  /** Reintento manual del correo; nunca vuelve a inscribir. */
  protected retryInvitation(id: number): void {
    if (this.busy() || !this.auth.hasRole('DISTRICT_SECRETARY')) return;
    this.busy.set(true);
    this.http.post(apiUrl(`/api/v1/secretariat/invitations/${id}/retry`), null)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => this.invitationResolved(id, 'El correo de activación fue enviado.'),
        error: (error: unknown) => {
          const status = error instanceof HttpErrorResponse ? error.status : 0;
          const resolved = RETRY_RESOLUTIONS.get(problemType(error));
          if (resolved) this.invitationResolved(id, resolved);
          else if (status === 401 || status === 403) this.invitationResolved(id, 'El reintento requiere una sesión activa de Secretaría.');
          else {
            this.busy.set(false);
            this.message.set('No se pudo entregar el correo. Sigue pendiente; puedes reintentar.');
          }
        },
      });
  }

  private addPending(id: number): void {
    this.pendingInvitations.update((ids) => (ids.includes(id) ? ids : [...ids, id]));
  }

  private invitationResolved(id: number, message: string): void {
    this.busy.set(false);
    this.pendingInvitations.update((ids) => ids.filter((x) => x !== id));
    this.message.set(message);
  }

  /** Ante un Carnet de Identidad ambiguo o existente bajo otros complementos, vuelve a la búsqueda pidiendo el complemento. */
  private askForComplement(): void {
    this.participant.set(null);
    this.closeCreation();
    this.needsExtension.set(true);
    this.message.set(EXTENSION_REQUIRED_MESSAGE);
  }

  private closeCreation(): void {
    this.canCreate.set(false);
    this.noMatch.set(false);
    this.creationType.set(null);
  }

  /** Refleja el resultado del alta de Rover nuevo sin conservar datos personales. */
  protected newRoverFinished(outcome: NewRoverOutcome): void {
    this.noMatch.set(false);
    if (outcome === 'enrolled') this.message.set('Rover inscrito.');
    else if (outcome === 'extension-required') this.askForComplement();
    else if (outcome === 'person-exists')
      this.message.set('Ya existe una persona con ese Carnet de Identidad. Vuelve a buscar para inscribirla.');
    else if (outcome === 'unauthorized' || outcome === 'forbidden') {
      this.editCi('');
      this.message.set(outcome === 'unauthorized' ? SESSION_EXPIRED_MESSAGE : FORBIDDEN_MESSAGE);
    } else this.message.set(UNCERTAIN_RESULT_MESSAGE);
  }

  /** Al cambiar de programación elimina los datos de la consulta previa. */
  protected selectSession(id: string): void {
    if (this.confirming()) return;
    this.session.set(id);
    this.selectedSession.set(this.sessions()?.find((option) => String(option.id) === id) ?? null);
    this.editCi('');
  }

  /** Consulta el catálogo con filtros inclusivos validados por el servidor. */
  protected loadSessions(event?: Event): void {
    event?.preventDefault();
    if (this.from() && this.to() && this.from() > this.to()) {
      this.message.set('La fecha Desde no puede ser posterior a Hasta.');
      return;
    }
    this.message.set('');
    this.sessionsFailed.set(false);
    const params: Record<string, string> = {};
    if (this.from() || this.to()) {
      params['from'] = this.from() || this.to();
      params['to'] = this.to() || this.from();
    }
    if (this.sessionSearch().trim()) params['name'] = this.sessionSearch().trim();
    this.sessionRequest?.unsubscribe();
    this.sessionRequest = this.http.get<readonly SessionOption[]>(apiUrl('/api/v1/calendar/sessions'), { params })
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (sessions) => this.sessions.set([...sessions].sort((a, b) => a.startsAt.localeCompare(b.startsAt))),
        error: () => this.sessionsFailed.set(true),
      });
  }

  /** Restablece los filtros sin alterar la programación seleccionada. */
  protected clearFilters(): void {
    this.from.set(''); this.to.set(''); this.sessionSearch.set(''); this.loadSessions();
  }

  /** Filtra por el día actual en Cochabamba. */
  protected today(): void {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/La_Paz', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    this.from.set(today); this.to.set(today); this.loadSessions();
  }

  /** Filtra desde hoy hasta el último día del mes en Cochabamba. */
  protected thisMonth(): void {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/La_Paz', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    const year = Number(today.slice(0, 4));
    const month = Number(today.slice(5, 7));
    const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
    this.from.set(today); this.to.set(`${today.slice(0, 7)}-${String(last).padStart(2, '0')}`); this.loadSessions();
  }

  /** Limpia solo la identidad y devuelve el foco al carnet. */
  protected nextPerson(): void {
    this.editCi('');
    document.getElementById('secretariat-ci')?.focus();
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

  /** Valida el contexto y envía el Carnet de Identidad solo en el cuerpo de la consulta. */
  protected search(event: Event): void {
    event.preventDefault();
    if (
      !this.auth.hasRole('DISTRICT_SECRETARY') ||
      this.busy() ||
      !this.session()
    )
      return;

    const ci = this.ci().trim();
    const extension = this.extension();
    this.clearResult();
    if (!/^[0-9]{4,10}$/.test(ci) || (this.needsExtension() && !extension)) {
      this.message.set(
        'Ingresa un Carnet de Identidad de 4 a 10 dígitos y selecciona el complemento si se solicita.',
      );
      return;
    }

    this.busy.set(true);
    this.lookup = this.http
      .post<Participant>(
        apiUrl('/api/v1/secretariat/participants/lookup'),
        { ci, extension: extension || null, sessionId: Number(this.session()) },
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
            : 'Hay varias coincidencias. Selecciona el complemento del Carnet de Identidad y vuelve a buscar.',
        );
        return;
      }
      if (
        error.status === 404 &&
        error.error?.type === 'urn:dsc:secretariat:participant-not-found'
      ) {
        if (triedExtension) { this.message.set('No hay coincidencia con ese complemento. Verifica el Carnet de Identidad antes de crear un perfil.'); return; }
        this.canCreate.set(true);
        this.message.set('No se encontró ninguna persona con los datos indicados.');
        this.noMatch.set(true);
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
    this.canCreate.set(false);
    this.creationType.set(null);
    this.noMatch.set(false);
    this.message.set('');
    this.busy.set(false);
  }
}
