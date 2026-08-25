/**
 * Lista de participantes de un módulo, con edición inline para corregir
 * errores de dedo en registros ya guardados (criterio 3).
 */
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';

import type { ParticipantRecord } from '@core/models/module-management.models';
import { BOLIVIA_MOBILE_PATTERN, CI_NUMBER_PATTERN } from '@core/utils/ci.utils';

import { ModuleManagementService } from '../services/module-management.service';

@Component({
  selector: 'app-participant-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './participant-table.html',
})
export class ParticipantTable {
  readonly moduleId = input.required<string>();
  readonly participants = input.required<ParticipantRecord[]>();
  /** Deshabilita alta/edición cuando el módulo tiene la inscripción cerrada. */
  readonly disabled = input(false);

  private readonly moduleManagement = inject(ModuleManagementService);

  /** `enrollmentId` de la fila actualmente en edición, o `null`. */
  protected readonly editingId = signal<string | null>(null);
  protected readonly draft = signal<{ ci: string; fullName: string; phone: string }>({
    ci: '',
    fullName: '',
    phone: '',
  });
  protected readonly draftError = signal('');

  /** Entra en modo edición inline para una fila. */
  protected startEdit(record: ParticipantRecord): void {
    this.editingId.set(record.enrollmentId);
    this.draft.set({ ci: record.ci, fullName: record.fullName, phone: record.phone });
    this.draftError.set('');
  }

  /** Sale del modo edición sin guardar cambios. */
  protected cancelEdit(): void {
    this.editingId.set(null);
    this.draftError.set('');
  }

  /**
   * Valida y persiste la corrección de una fila (criterio 3). Usa las mismas
   * reglas que el alta manual (`participant-form`), para que la edición no
   * pueda introducir datos que el formulario de alta habría rechazado.
   *
   * @param enrollmentId - Registro que se está corrigiendo.
   */
  protected saveEdit(enrollmentId: string): void {
    const ci = this.draft().ci.trim();
    const fullName = this.draft().fullName.trim();
    const phone = this.draft().phone.trim();

    if (!fullName) {
      this.draftError.set('El nombre es obligatorio.');
      return;
    }
    if (!CI_NUMBER_PATTERN.test(ci)) {
      this.draftError.set('Ingresa un CI numérico válido.');
      return;
    }
    if (!BOLIVIA_MOBILE_PATTERN.test(phone)) {
      this.draftError.set('Ingresa un móvil de 8 dígitos.');
      return;
    }

    this.moduleManagement.updateParticipant(this.moduleId(), enrollmentId, { ci, fullName, phone });
    this.editingId.set(null);
    this.draftError.set('');
  }

  /** Alterna si el participante asistió, sin entrar en modo edición completo. */
  protected toggleAttended(record: ParticipantRecord): void {
    this.moduleManagement.updateParticipant(this.moduleId(), record.enrollmentId, {
      attended: !record.attended,
    });
  }
}
