/**
 * Formulario de registro de asistencia: campos, validación, autocompletado
 * por CI y envío. Encapsula todo el estado propio del formulario (incluida
 * la insignia de sesión activa, porque "Cambiar Perfil" resetea ese mismo
 * modelo) para mantener `AsistenciaPage` como puro orquestador.
 */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormField, form, pattern, required, submit } from '@angular/forms/signals';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs';

import type { ModuloSesion, RegistroAsistenciaResult } from '@core/models/asistencia.models';
import { AdultosDirectoryService } from '@core/services/adultos-directory.service';
import { AuthSessionService } from '@core/services/auth-session.service';
import {
  BOLIVIA_MOBILE_PATTERN,
  CI_EXTENSIONS,
  CI_NUMBER_PATTERN,
  isValidCiNumber,
  isValidDepartamentoCode,
} from '@core/utils/ci.utils';

import { AsistenciaRegistroService } from './services/asistencia-registro.service';

interface RegistroFormModel {
  ci: string;
  fullName: string;
  extension: string;
  phone: string;
}

type CiLookupStatus = 'idle' | 'loading' | 'found' | 'not-found' | 'invalid';

@Component({
  selector: 'app-asistencia-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField],
  templateUrl: './asistencia-form.html',
})
export class AsistenciaForm {
  /** Sesión del módulo a la que se registra la asistencia. */
  readonly sesion = input.required<ModuloSesion>();

  /** Emite la confirmación cuando el registro se completa con éxito. */
  readonly registered = output<RegistroAsistenciaResult>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly directory = inject(AdultosDirectoryService);
  private readonly registroApi = inject(AsistenciaRegistroService);
  protected readonly auth = inject(AuthSessionService);

  /** Extensiones de CI disponibles. */
  protected readonly extensions = CI_EXTENSIONS;

  protected readonly submitting = signal(false);
  protected readonly submitError = signal('');
  protected readonly ciStatus = signal<CiLookupStatus>('idle');
  /** `true` si el CI no estaba en el directorio (registro parcial). */
  private readonly partialFromDirectory = signal(false);

  protected readonly touchedCi = signal(false);
  protected readonly touchedName = signal(false);
  protected readonly touchedExtension = signal(false);
  protected readonly touchedPhone = signal(false);

  protected readonly registroModel = signal<RegistroFormModel>({
    ci: '',
    fullName: '',
    extension: '',
    phone: '',
  });

  protected readonly registroForm = form(this.registroModel, (p) => {
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
      (this.registroForm.ci().invalid() || this.ciStatus() === 'invalid'),
  );

  protected readonly showNameError = computed(
    () => this.touchedName() && this.registroForm.fullName().invalid(),
  );

  protected readonly showExtensionError = computed(
    () => this.touchedExtension() && this.registroForm.extension().invalid(),
  );

  protected readonly showPhoneError = computed(
    () => this.touchedPhone() && this.registroForm.phone().invalid(),
  );

  constructor() {
    this.watchAuthSession();
    this.watchCiLookup();
  }

  /** Prellena el formulario con el perfil del dirigente si hay sesión activa. */
  private watchAuthSession(): void {
    effect(() => {
      const profile = this.auth.session();
      if (!profile) {
        return;
      }
      this.registroModel.set({
        ci: profile.ci,
        fullName: profile.fullName,
        extension: profile.extension,
        phone: profile.phone,
      });
      this.ciStatus.set('found');
      this.partialFromDirectory.set(false);
    });
  }

  /** Busca en el directorio distrital cada vez que el CI ingresado es válido. */
  private watchCiLookup(): void {
    toObservable(computed(() => this.registroModel().ci))
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap((ci) => {
          if (!ci.trim()) {
            this.ciStatus.set('idle');
            return;
          }
          if (!isValidCiNumber(ci)) {
            this.ciStatus.set('invalid');
          }
        }),
        filter((ci) => isValidCiNumber(ci)),
        tap(() => this.ciStatus.set('loading')),
        switchMap((ci) => this.directory.lookupByCi(ci)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((adulto) => {
        if (!adulto) {
          this.ciStatus.set('not-found');
          this.partialFromDirectory.set(true);
          return;
        }
        this.ciStatus.set('found');
        this.partialFromDirectory.set(false);
        this.registroModel.update((current) => ({
          ...current,
          fullName: adulto.fullName,
          extension: adulto.extension,
          phone: current.phone || adulto.phone,
        }));
      });
  }

  /**
   * Cierra sesión demo y limpia el formulario para registro manual.
   */
  protected onChangeProfile(): void {
    this.auth.clearSession();
    this.registroModel.set({
      ci: '',
      fullName: '',
      extension: '',
      phone: '',
    });
    this.ciStatus.set('idle');
    this.partialFromDirectory.set(true);
    this.touchedCi.set(false);
    this.touchedName.set(false);
    this.touchedExtension.set(false);
    this.touchedPhone.set(false);
  }

  /**
   * Envía el registro mock tras validar el formulario.
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

    void submit(this.registroForm, async () => {
      const model = this.registroModel();
      const sesion = this.sesion();

      if (!isValidDepartamentoCode(model.extension)) {
        this.submitError.set('Selecciona una extensión (departamento) válida.');
        return;
      }
      const extension = model.extension;

      this.submitting.set(true);
      try {
        const result = await new Promise<RegistroAsistenciaResult>((resolve, reject) => {
          this.registroApi
            .register({
              sessionId: sesion.sessionId,
              ci: model.ci.trim(),
              fullName: model.fullName.trim(),
              extension,
              phone: model.phone.trim(),
              estado: this.partialFromDirectory() ? 'parcial' : 'completo',
            })
            .subscribe({ next: resolve, error: reject });
        });
        this.registered.emit(result);
      } catch {
        this.submitError.set('No se pudo registrar la asistencia. Intenta de nuevo.');
      } finally {
        this.submitting.set(false);
      }
    });
  }
}
