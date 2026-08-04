/**
 * Página de registro de asistencia a un módulo (deep link / QR).
 * Frontend-only: servicios mock en `core` y feature; sin API real.
 */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  FormField,
  form,
  pattern,
  required,
  submit,
} from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  switchMap,
  tap,
} from 'rxjs';

import type {
  ModuloSesion,
  RegistroAsistenciaResult,
} from '@core/models/asistencia.models';
import { AdultosDirectoryService } from '@core/services/adultos-directory.service';
import { AuthSessionService } from '@core/services/auth-session.service';
import { CI_EXTENSIONS, isValidCiNumber } from '@core/utils/ci.utils';

import { AsistenciaRegistroService } from './services/asistencia-registro.service';

interface RegistroFormModel {
  ci: string;
  fullName: string;
  extension: string;
  phone: string;
}

type CiLookupStatus = 'idle' | 'loading' | 'found' | 'not-found' | 'invalid';

@Component({
  selector: 'app-asistencia-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, RouterLink],
  template: `
    <div class="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      @if (loadError()) {
        <section class="rounded-2xl border border-danger/30 bg-danger-soft p-6 text-danger">
          <h1 class="text-xl font-bold">Sesión no válida</h1>
          <p class="mt-2 text-sm">
            El enlace o código QR no corresponde a una sesión activa. Solicita un
            nuevo enlace al facilitador del módulo.
          </p>
          <a routerLink="/" class="mt-4 inline-block text-sm font-semibold text-dsc no-underline">
            Volver al inicio
          </a>
        </section>
      } @else if (success()) {
        <section
          class="mx-auto max-w-xl rounded-2xl border border-border bg-white p-8 shadow-md"
          role="status"
        >
          <p
            class="mb-4 inline-flex items-center gap-2 rounded-full bg-dsc-soft px-3 py-1 text-xs font-bold tracking-wide text-dsc-dark"
          >
            ✓ ASISTENCIA CONFIRMADA
          </p>
          <h1 class="text-2xl font-bold text-ink md:text-3xl">Registro exitoso</h1>
          <p class="mt-3 text-muted">
            {{ success()!.participantName }}, tu asistencia quedó registrada.
          </p>
          <dl class="mt-6 space-y-3 rounded-xl bg-surface p-4 text-sm">
            <div class="flex justify-between gap-4">
              <dt class="text-muted">Módulo</dt>
              <dd class="font-semibold text-ink">{{ success()!.moduleSummary }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-muted">Fecha</dt>
              <dd class="font-semibold text-ink">{{ success()!.sessionDate }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-muted">Hora</dt>
              <dd class="font-semibold text-ink">{{ success()!.sessionTime }}</dd>
            </div>
            @if (success()!.partialRegistration) {
              <div class="rounded-lg bg-warning-bg px-3 py-2 text-warning-ink">
                Registro parcial: tus datos se guardaron para completar el perfil
                más adelante en el sistema.
              </div>
            }
          </dl>
          <a
            routerLink="/"
            class="mt-6 inline-flex rounded-lg bg-dsc px-5 py-3 text-sm font-bold text-white no-underline hover:bg-dsc-dark"
          >
            Ir al inicio
          </a>
        </section>
      } @else if (sesion(); as modulo) {
        <section class="mb-6 max-w-3xl">
          <p
            class="mb-3 inline-flex items-center gap-2 rounded-full bg-dsc-soft px-3 py-1 text-xs font-bold tracking-wide text-dsc-dark"
          >
            <span aria-hidden="true">🛡</span>
            ASISTENCIA OFICIAL
          </p>
          <h1 class="text-3xl font-bold tracking-tight text-ink md:text-4xl">
            {{ modulo.moduleTitle }}
          </h1>
          <h2 class="mt-2 text-xl font-bold text-dsc md:text-2xl">
            {{ modulo.moduleName }}
          </h2>
          <p class="mt-3 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            {{ modulo.description }}
          </p>
        </section>

        @if (auth.session(); as profile) {
          <aside
            class="mb-6 flex flex-col gap-3 rounded-2xl bg-warning-bg px-4 py-3 text-warning-ink sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="flex items-start gap-3">
              <span
                class="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-warning-btn/20 text-sm font-bold"
                aria-hidden="true"
              >
                👤
              </span>
              <div class="text-sm">
                <p>
                  Has iniciado sesión como:
                  <strong>{{ profile.displayName }}</strong>
                </p>
                <p class="mt-0.5 text-warning-ink/80">
                  Confirma tu asistencia para acreditar esta formación. Puedes
                  editar el teléfono si es necesario.
                </p>
              </div>
            </div>
            <button
              type="button"
              class="shrink-0 rounded-lg bg-warning-btn px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              (click)="onChangeProfile()"
            >
              Cambiar Perfil
            </button>
          </aside>
        }

        <div class="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
          <form
            class="rounded-2xl border border-border bg-white p-5 shadow-md md:p-7"
            (submit)="onSubmit($event)"
            novalidate
          >
            <div class="space-y-5">
              <div>
                <label class="mb-1.5 block text-sm font-semibold text-ink" for="ci">
                  Carnet de Identidad (CI)
                </label>
                <div class="relative">
                  <input
                    id="ci"
                    type="text"
                    inputmode="numeric"
                    autocomplete="off"
                    placeholder="Solo números"
                    class="w-full rounded-xl border border-border bg-white px-4 py-3 pr-12 text-ink outline-none ring-dsc/30 placeholder:text-muted/60 focus:ring-2"
                    [class.border-danger]="showCiError()"
                    [formField]="registroForm.ci"
                    (blur)="touchedCi.set(true)"
                  />
                  @if (ciStatus() === 'loading') {
                    <span
                      class="absolute top-1/2 right-3 size-5 -translate-y-1/2 animate-spin rounded-full border-2 border-dsc border-t-transparent"
                      aria-label="Buscando perfil"
                    ></span>
                  }
                </div>
                @if (showCiError()) {
                  <p class="mt-1.5 text-sm text-danger">
                    Ingresa un CI numérico válido (7 a 10 dígitos).
                  </p>
                } @else if (ciStatus() === 'found') {
                  <p class="mt-1.5 text-sm font-medium text-dsc">
                    ✓ Perfil encontrado. Datos autocompletados
                  </p>
                } @else if (ciStatus() === 'not-found') {
                  <p class="mt-1.5 text-sm text-muted">
                    CI no encontrado en el distrito. Completa tus datos para un
                    registro parcial.
                  </p>
                }
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-semibold text-ink" for="fullName">
                  Nombre Completo
                </label>
                <input
                  id="fullName"
                  type="text"
                  autocomplete="name"
                  class="w-full rounded-xl border border-border bg-white px-4 py-3 text-ink outline-none ring-dsc/30 focus:ring-2"
                  [class.border-danger]="showNameError()"
                  [formField]="registroForm.fullName"
                  (blur)="touchedName.set(true)"
                />
                @if (showNameError()) {
                  <p class="mt-1.5 text-sm text-danger">Este campo es obligatorio</p>
                }
              </div>

              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label class="mb-1.5 block text-sm font-semibold text-ink" for="extension">
                    Extensión (Departamento)
                  </label>
                  <select
                    id="extension"
                    class="w-full rounded-xl border border-border bg-white px-4 py-3 text-ink outline-none ring-dsc/30 focus:ring-2"
                    [class.border-danger]="showExtensionError()"
                    [formField]="registroForm.extension"
                    (blur)="touchedExtension.set(true)"
                  >
                    <option value="">Selecciona…</option>
                    @for (ext of extensions; track ext.code) {
                      <option [value]="ext.code">{{ ext.label }}</option>
                    }
                  </select>
                  @if (showExtensionError()) {
                    <p class="mt-1.5 text-sm text-danger">Este campo es obligatorio</p>
                  }
                </div>

                <div>
                  <label class="mb-1.5 block text-sm font-semibold text-ink" for="phone">
                    Teléfono de contacto (Móvil)
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    inputmode="numeric"
                    autocomplete="tel"
                    placeholder="Ej. 70000000"
                    class="w-full rounded-xl border border-border bg-white px-4 py-3 text-ink outline-none ring-dsc/30 placeholder:text-muted/60 focus:ring-2"
                    [class.border-danger]="showPhoneError()"
                    [formField]="registroForm.phone"
                    (blur)="touchedPhone.set(true)"
                  />
                  @if (showPhoneError()) {
                    <p class="mt-1.5 text-sm text-danger">
                      Ingresa un móvil de 8 dígitos.
                    </p>
                  }
                </div>
              </div>

              @if (submitError()) {
                <p class="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">
                  {{ submitError() }}
                </p>
              }

              <button
                type="submit"
                class="flex w-full items-center justify-center gap-2 rounded-xl bg-dsc px-4 py-3.5 text-sm font-bold text-white transition hover:bg-dsc-dark disabled:cursor-not-allowed disabled:opacity-60"
                [disabled]="submitting()"
              >
                <span aria-hidden="true">👤✓</span>
                {{ submitting() ? 'Registrando…' : 'Registrar Asistencia' }}
              </button>
            </div>
          </form>

          <aside class="space-y-4">
            <div class="rounded-2xl border border-border bg-slate-50 p-4">
              <p class="mb-2 text-xs font-bold tracking-wide text-muted uppercase">
                Ejemplo de validación
              </p>
              <div
                class="rounded-xl border border-danger bg-danger-soft px-3 py-3 text-sm text-danger"
              >
                Este campo no puede estar vacío
              </div>
              <p class="mt-2 text-xs text-danger">Este campo es obligatorio</p>
            </div>

            <article class="overflow-hidden rounded-2xl border border-border bg-white shadow-md">
              <div class="relative aspect-[4/3] bg-dsc-navy">
                <img
                  class="size-full object-cover opacity-90"
                  [src]="modulo.imageUrl"
                  [alt]="modulo.imageAlt"
                />
                <div
                  class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white"
                >
                  <h3 class="text-lg font-bold">Liderazgo Scout</h3>
                  <p class="mt-1 text-xs leading-relaxed text-white/85">
                    Formando el futuro de la juventud boliviana con valores y servicio.
                  </p>
                </div>
              </div>
            </article>

            <div class="flex flex-wrap gap-2">
              <span
                class="inline-flex items-center gap-2 rounded-xl bg-dsc-soft px-3 py-2 text-xs font-semibold text-dsc-dark"
              >
                📅 {{ modulo.dateLabel }}
              </span>
              <span
                class="inline-flex items-center gap-2 rounded-xl bg-warning-bg px-3 py-2 text-xs font-semibold text-warning-ink"
              >
                🕒 {{ modulo.timeLabel }}
              </span>
            </div>
          </aside>
        </div>
      } @else {
        <p class="text-muted">Cargando sesión del módulo…</p>
      }
    </div>
  `,
})
export class AsistenciaPage {
  /**
   * Identificador de sesión del módulo (ruta `/asistencia/:sessionId`).
   * Proviene del deep link o QR.
   */
  readonly sessionId = input.required<string>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly directory = inject(AdultosDirectoryService);
  private readonly registroApi = inject(AsistenciaRegistroService);
  protected readonly auth = inject(AuthSessionService);

  /** Extensiones de CI disponibles. */
  protected readonly extensions = CI_EXTENSIONS;

  protected readonly sesion = signal<ModuloSesion | null>(null);
  protected readonly loadError = signal(false);
  protected readonly success = signal<RegistroAsistenciaResult | null>(null);
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
    pattern(p.ci, /^\d{7,10}$/, { message: 'CI numérico inválido' });
    required(p.fullName, { message: 'Nombre obligatorio' });
    required(p.extension, { message: 'Extensión obligatoria' });
    required(p.phone, { message: 'Teléfono obligatorio' });
    pattern(p.phone, /^\d{8}$/, { message: 'Teléfono inválido' });
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
    toObservable(this.sessionId)
      .pipe(
        switchMap((id) => this.directory.getModuloSesion(id)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((sesion) => {
        if (!sesion) {
          this.loadError.set(true);
          this.sesion.set(null);
          return;
        }
        this.loadError.set(false);
        this.sesion.set(sesion);
      });

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
      if (!sesion) {
        this.submitError.set('Sesión no disponible.');
        return;
      }

      this.submitting.set(true);
      try {
        const result = await new Promise<RegistroAsistenciaResult>((resolve, reject) => {
          this.registroApi
            .register({
              sessionId: sesion.sessionId,
              ci: model.ci.trim(),
              fullName: model.fullName.trim(),
              extension: model.extension,
              phone: model.phone.trim(),
              partialRegistration: this.partialFromDirectory(),
            })
            .subscribe({ next: resolve, error: reject });
        });
        this.success.set(result);
      } catch {
        this.submitError.set('No se pudo registrar la asistencia. Intenta de nuevo.');
      } finally {
        this.submitting.set(false);
      }
    });
  }
}
