/**
 * Formulario de registro de asistencia: campos, validación, autocompletado
 * por CI y envío. Encapsula todo el estado propio del formulario (incluida
 * la insignia de sesión activa, porque "Cambiar Perfil" resetea ese mismo
 * modelo) para mantener `AttendancePage` como puro orquestador.
 */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormField, form, pattern, required, submit } from '@angular/forms/signals';
import { debounceTime, distinctUntilChanged, EMPTY, catchError, filter, firstValueFrom, switchMap, tap } from 'rxjs';

import type {
  DistrictAdult,
  ModuleSession,
  AttendanceRegistrationResult,
} from '@core/models/attendance.models';
import { AdultDirectoryService } from '@core/services/adult-directory.service';
import { AuthSessionService } from '@core/services/auth-session.service';
import {
  BOLIVIA_MOBILE_PATTERN,
  CI_EXTENSIONS,
  CI_NUMBER_PATTERN,
  isValidCiNumber,
  isValidDepartmentCode,
} from '@core/utils/ci.utils';
import { isRetryableHttpError, problemDetailMessage } from '@core/utils/http-error.utils';

import { AttendanceRegistrationService } from '../services/attendance-registration.service';

interface AttendanceFormModel {
  ci: string;
  fullName: string;
  extension: string;
  phone: string;
}

type CiLookupStatus = 'idle' | 'loading' | 'found' | 'not-found' | 'invalid' | 'error';

@Component({
  selector: 'app-attendance-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField],
  templateUrl: './attendance-form.html',
})
export class AttendanceForm {
  /** Sesión del módulo a la que se registra la asistencia. */
  readonly session = input.required<ModuleSession>();

  /** Emite la confirmación cuando el registro se completa con éxito. */
  readonly registered = output<AttendanceRegistrationResult>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly directory = inject(AdultDirectoryService);
  private readonly registrationApi = inject(AttendanceRegistrationService);
  protected readonly auth = inject(AuthSessionService);

  /** Extensiones de CI disponibles. */
  protected readonly extensions = CI_EXTENSIONS;

  protected readonly submitting = signal(false);
  protected readonly submitError = signal('');
  protected readonly submitRetryable = signal(false);
  protected readonly ciStatus = signal<CiLookupStatus>('idle');
  protected readonly lookupError = signal('');
  /** `true` si el CI no estaba en el directorio (registro parcial). */
  private readonly partialFromDirectory = signal(false);

  protected readonly touchedCi = signal(false);
  protected readonly touchedName = signal(false);
  protected readonly touchedExtension = signal(false);
  protected readonly touchedPhone = signal(false);

  protected readonly attendanceModel = signal<AttendanceFormModel>({
    ci: '',
    fullName: '',
    extension: '',
    phone: '',
  });

  protected readonly attendanceForm = form(this.attendanceModel, (p) => {
    required(p.ci, { message: 'CI obligatorio' });
    pattern(p.ci, CI_NUMBER_PATTERN, { message: 'CI numérico inválido' });
    required(p.fullName, { message: 'Nombre obligatorio' });
    required(p.extension, { message: 'Extensión obligatoria' });
    required(p.phone, { message: 'Teléfono obligatorio' });
    pattern(p.phone, BOLIVIA_MOBILE_PATTERN, { message: 'Teléfono inválido' });
  });

  protected readonly showCiError = computed(
    () =>
      this.touchedCi() &&
      (this.attendanceForm.ci().invalid() || this.ciStatus() === 'invalid'),
  );

  protected readonly showNameError = computed(
    () => this.touchedName() && this.attendanceForm.fullName().invalid(),
  );

  protected readonly showExtensionError = computed(
    () => this.touchedExtension() && this.attendanceForm.extension().invalid(),
  );

  protected readonly showPhoneError = computed(
    () => this.touchedPhone() && this.attendanceForm.phone().invalid(),
  );

  constructor() {
    this.watchCiLookup();
  }

  /** Busca en el directorio distrital cada vez que el CI ingresado es válido. */
  private watchCiLookup(): void {
    toObservable(computed(() => this.attendanceModel().ci))
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap((ci) => {
          if (!ci.trim()) {
            this.ciStatus.set('idle');
            this.lookupError.set('');
            return;
          }
          if (!isValidCiNumber(ci)) {
            this.ciStatus.set('invalid');
          }
        }),
        filter((ci) => isValidCiNumber(ci)),
        tap(() => {
          this.ciStatus.set('loading');
          this.lookupError.set('');
        }),
        switchMap((ci) =>
          this.directory.lookupByCi(ci, this.attendanceModel().extension).pipe(
            catchError((error: unknown) => {
              this.onLookupFailure(error);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((adult) => this.applyLookup(adult));
  }

  /**
   * Limpia el formulario para registrar a otra persona sin cerrar la sesión.
   */
  protected onChangeProfile(): void {
    this.attendanceModel.set({
      ci: '',
      fullName: '',
      extension: '',
      phone: '',
    });
    this.ciStatus.set('idle');
    this.partialFromDirectory.set(true);
    this.lookupError.set('');
    this.touchedCi.set(false);
    this.touchedName.set(false);
    this.touchedExtension.set(false);
    this.touchedPhone.set(false);
  }

  /**
   * Repite el lookup de CI tras un error de red.
   */
  protected retryLookup(): void {
    const ci = this.attendanceModel().ci.trim();
    if (!isValidCiNumber(ci)) {
      return;
    }
    this.ciStatus.set('loading');
    this.lookupError.set('');
    this.directory
      .lookupByCi(ci, this.attendanceModel().extension)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (adult) => this.applyLookup(adult),
        error: (error: unknown) => this.onLookupFailure(error),
      });
  }

  /**
   * Reenvía el formulario si el último POST falló de forma transitoria.
   */
  protected retrySubmit(): void {
    this.onSubmit(new Event('submit', { cancelable: true, bubbles: true }));
  }

  /**
   * Envía el registro de asistencia a la API tras validar el formulario.
   *
   * @param event - Evento submit del formulario.
   */
  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.touchedCi.set(true);
    this.touchedName.set(true);
    this.touchedExtension.set(true);
    this.touchedPhone.set(true);
    this.submitError.set('');
    this.submitRetryable.set(false);

    if (this.formIsInvalid()) {
      this.focusFirstInvalid();
    }

    void submit(this.attendanceForm, async () => {
      const model = this.attendanceModel();
      const session = this.session();

      if (!isValidDepartmentCode(model.extension)) {
        this.submitError.set('Selecciona una extensión (departamento) válida.');
        return;
      }
      const extension = model.extension;

      this.submitting.set(true);
      try {
        const result = await firstValueFrom(
          this.registrationApi.register({
            sessionId: session.sessionId,
            ci: model.ci.trim(),
            fullName: model.fullName.trim(),
            extension,
            phone: model.phone.trim(),
          }),
        );
        this.registered.emit(result);
      } catch (error) {
        this.submitError.set(
          problemDetailMessage(error, 'No se pudo registrar la asistencia. Intenta de nuevo.'),
        );
        this.submitRetryable.set(isRetryableHttpError(error));
      } finally {
        this.submitting.set(false);
      }
    });
  }

  /**
   * Aplica el resultado de lookup al formulario.
   *
   * @param adult - Perfil encontrado o `null`.
   */
  private applyLookup(adult: DistrictAdult | null): void {
    if (!adult) {
      this.ciStatus.set('not-found');
      this.partialFromDirectory.set(true);
      return;
    }
    this.ciStatus.set('found');
    this.partialFromDirectory.set(false);
    this.lookupError.set('');
    this.attendanceModel.update((current) => ({
      ...current,
      fullName: adult.fullName,
      extension: adult.extension,
      phone: current.phone || adult.phone,
    }));
  }

  /**
   * Marca el lookup como error recuperable.
   *
   * @param error - Fallo HTTP o de red.
   */
  private onLookupFailure(error: unknown): void {
    this.ciStatus.set('error');
    this.lookupError.set(
      problemDetailMessage(error, 'No se pudo consultar el CI. Intenta de nuevo.'),
    );
  }

  /**
   * Indica si algún campo del formulario es inválido.
   */
  private formIsInvalid(): boolean {
    return (
      this.attendanceForm.ci().invalid() ||
      this.attendanceForm.fullName().invalid() ||
      this.attendanceForm.extension().invalid() ||
      this.attendanceForm.phone().invalid()
    );
  }

  /**
   * Mueve el foco al primer campo inválido.
   */
  private focusFirstInvalid(): void {
    const fields: ReadonlyArray<{ id: string; invalid: boolean }> = [
      { id: 'ci', invalid: this.attendanceForm.ci().invalid() },
      { id: 'fullName', invalid: this.attendanceForm.fullName().invalid() },
      { id: 'extension', invalid: this.attendanceForm.extension().invalid() },
      { id: 'phone', invalid: this.attendanceForm.phone().invalid() },
    ];
    const first = fields.find((field) => field.invalid);
    if (!first) {
      return;
    }
    globalThis.document.getElementById(first.id)?.focus();
  }
}
