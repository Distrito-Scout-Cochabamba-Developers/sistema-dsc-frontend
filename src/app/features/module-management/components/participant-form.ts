/**
 * Alta manual de un participante por CI (criterio 2): si el CI ya existe en
 * algún módulo, autocompleta Nombre/Celular; si no, quedan editables para
 * crear el perfil del dirigente.
 */
import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { FormField, form, pattern, readonly, required } from '@angular/forms/signals';

import type { NewParticipantInput } from '@core/models/module-management.models';
import { BOLIVIA_MOBILE_PATTERN, CI_NUMBER_PATTERN, isValidCiNumber } from '@core/utils/ci.utils';

import { ModuleManagementService } from '../services/module-management.service';

@Component({
  selector: 'app-participant-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField],
  templateUrl: './participant-form.html',
})
export class ParticipantForm {
  readonly moduleId = input.required<string>();
  /** Deshabilita el formulario cuando el módulo tiene la inscripción cerrada. */
  readonly disabled = input(false);

  /** Emite el participante recién dado de alta. */
  readonly added = output<void>();

  private readonly moduleManagement = inject(ModuleManagementService);

  protected readonly touchedCi = signal(false);
  protected readonly touchedName = signal(false);
  protected readonly touchedPhone = signal(false);

  protected readonly model = signal<NewParticipantInput>({ ci: '', fullName: '', phone: '' });

  /**
   * `true` cuando el CI actual del modelo ya existe en el directorio local.
   * Derivado del modelo (no de un flag capturado en `blur`), para que no
   * quede desactualizado si el CI cambia sin volver a disparar el blur.
   */
  protected readonly foundExisting = computed(() => {
    const ci = this.model().ci.trim();
    return isValidCiNumber(ci) && !!this.moduleManagement.findByCi(ci);
  });

  protected readonly participantForm = form(this.model, (p) => {
    required(p.ci, { message: 'CI obligatorio' });
    pattern(p.ci, CI_NUMBER_PATTERN, { message: 'CI numérico inválido' });
    required(p.fullName, { message: 'Nombre obligatorio' });
    readonly(p.fullName, { when: () => this.foundExisting() });
    required(p.phone, { message: 'Teléfono obligatorio' });
    pattern(p.phone, BOLIVIA_MOBILE_PATTERN, { message: 'Teléfono inválido' });
    readonly(p.phone, { when: () => this.foundExisting() });
  });

  protected readonly showCiError = computed(
    () => this.touchedCi() && this.participantForm.ci().invalid(),
  );
  protected readonly showNameError = computed(
    () => this.touchedName() && this.participantForm.fullName().invalid(),
  );
  protected readonly showPhoneError = computed(
    () => this.touchedPhone() && this.participantForm.phone().invalid(),
  );

  /** Autocompleta Nombre/Celular si el CI ya existe en el directorio local. */
  protected onCiBlur(): void {
    this.touchedCi.set(true);
    const ci = this.model().ci.trim();
    const existing = isValidCiNumber(ci) ? this.moduleManagement.findByCi(ci) : undefined;
    if (existing) {
      this.model.update((current) => ({ ...current, fullName: existing.fullName, phone: existing.phone }));
    }
  }

  /**
   * Valida y envía el alta del participante. Vuelve a resolver `foundExisting`
   * a partir del CI actual (no de un flag de blur) antes de decidir si se
   * autocompletaron datos válidos.
   *
   * @param event - Evento submit del formulario.
   */
  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.touchedCi.set(true);
    this.touchedName.set(true);
    this.touchedPhone.set(true);

    if (this.formIsInvalid()) {
      return;
    }

    this.moduleManagement.addParticipant(this.moduleId(), this.model());
    this.model.set({ ci: '', fullName: '', phone: '' });
    this.touchedCi.set(false);
    this.touchedName.set(false);
    this.touchedPhone.set(false);
    this.added.emit();
  }

  /** Indica si algún campo del formulario es inválido. */
  private formIsInvalid(): boolean {
    return (
      this.participantForm.ci().invalid() ||
      this.participantForm.fullName().invalid() ||
      this.participantForm.phone().invalid()
    );
  }
}
