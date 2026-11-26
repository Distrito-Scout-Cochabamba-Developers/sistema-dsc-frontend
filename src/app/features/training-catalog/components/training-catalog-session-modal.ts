/**
 * Modal para programar módulo: fecha y horas sobre un módulo del catálogo de módulos.
 */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormField, form, required, submit } from '@angular/forms/signals';

import type { TrainingModuleApiDto } from '@core/models/attendance-api.models';
import { ButtonComponent } from '@shared/components/buttons/button/button.component';
import { CheckboxComponent } from '@shared/components/form-controls/checkbox/checkbox.component';
import { DatePickerComponent } from '@shared/components/form-controls/date-picker/date-picker.component';

import type { ConvocatoriaDraft } from '../training-catalog.models';

interface ScheduleDraft {
  sessionDate: string;
  startTime: string;
  endTime: string;
}

function defaultDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

@Component({
  selector: 'app-training-catalog-session-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, ButtonComponent, CheckboxComponent, DatePickerComponent],
  templateUrl: './training-catalog-session-modal.html',
  styles: `
    :host {
      display: contents;
    }
  `,
})
export class TrainingCatalogSessionModal {
  private readonly destroyRef = inject(DestroyRef);

  /** Controla visibilidad del `<dialog>`. */
  readonly open = input(false);

  /** Módulo del catálogo de módulos sobre el que se abre la programación. */
  readonly module = input<TrainingModuleApiDto | null>(null);

  /** Error RFC 7807 de un intento de crear. */
  readonly saveError = input('');

  /** True mientras el POST está en curso. */
  readonly submitting = input(false);

  /** Cierre (cancelar, backdrop o Escape). */
  readonly closed = output<void>();

  /** Draft válido para `POST .../sessions`. */
  readonly saved = output<ConvocatoriaDraft>();

  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');

  protected readonly formModel = signal<ScheduleDraft>({
    sessionDate: defaultDate(),
    startTime: '08:30',
    endTime: '12:30',
  });

  protected readonly extraBlocks = signal<ScheduleDraft[]>([]);
  protected readonly isRegistrationOpen = signal(true);
  protected readonly timeError = signal('');

  protected readonly scheduleForm = form(this.formModel, (p) => {
    required(p.sessionDate, { message: 'La fecha es obligatoria' });
    required(p.startTime, { message: 'La hora de inicio es obligatoria' });
    required(p.endTime, { message: 'La hora de fin es obligatoria' });
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      document.body.style.removeProperty('overflow');
    });

    effect(() => {
      if (!this.open()) {
        return;
      }
      this.timeError.set('');
      this.isRegistrationOpen.set(true);
      this.extraBlocks.set([]);
      this.formModel.set({
        sessionDate: defaultDate(),
        startTime: '08:30',
        endTime: '12:30',
      });
    });

    effect(() => {
      const el = this.dialog()?.nativeElement;
      if (!el) {
        return;
      }
      if (this.open()) {
        document.body.style.overflow = 'hidden';
        if (!el.open && typeof el.showModal === 'function') {
          el.showModal();
        }
      } else {
        document.body.style.removeProperty('overflow');
        if (el.open && typeof el.close === 'function') {
          el.close();
        }
      }
    });
  }

  /** Añade un segundo (o siguiente) bloque de horario. */
  protected addBlock(): void {
    const first = this.formModel();
    this.extraBlocks.update((blocks) => [
      ...blocks,
      { sessionDate: first.sessionDate, startTime: '14:00', endTime: '18:00' },
    ]);
  }

  /**
   * Quita un bloque extra.
   *
   * @param index - Posición en `extraBlocks`.
   */
  protected removeBlock(index: number): void {
    this.extraBlocks.update((blocks) => blocks.filter((_, i) => i !== index));
  }

  /**
   * Actualiza un campo de un bloque extra.
   *
   * @param index - Posición.
   * @param field - Campo.
   * @param value - Valor del input.
   */
  protected patchExtra(index: number, field: keyof ScheduleDraft, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.extraBlocks.update((blocks) =>
      blocks.map((block, i) => (i === index ? { ...block, [field]: value } : block)),
    );
  }

  /**
   * Cambia si la programación admite inscripción.
   *
   * @param event - Change del checkbox.
   */
  protected onRegistrationToggle(event: Event): void {
    this.isRegistrationOpen.set((event.target as HTMLInputElement).checked);
  }

  /** El usuario cerró el diálogo nativo. */
  protected onNativeClose(): void {
    if (this.open()) {
      this.closed.emit();
    }
  }

  /**
   * Valida horas y emite el draft.
   *
   * @param event - Submit.
   */
  protected onSubmit(event: Event): void {
    event.preventDefault();
    void submit(this.scheduleForm, async () => {
      const schedules = [this.formModel(), ...this.extraBlocks()];
      const invalid = schedules.some((block) => block.endTime <= block.startTime);
      if (invalid) {
        this.timeError.set('La hora de fin debe ser posterior a la de inicio.');
        return;
      }
      this.timeError.set('');
      this.saved.emit({
        isRegistrationOpen: this.isRegistrationOpen(),
        schedules,
      });
    });
  }
}
