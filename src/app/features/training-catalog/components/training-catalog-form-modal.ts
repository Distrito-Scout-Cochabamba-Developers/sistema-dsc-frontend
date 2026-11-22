/**
 * Modal de creación/edición del catálogo. Emite el draft; la página persiste vía API.
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
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

import type { CatalogTrainingLineDto, WriteTrainingModuleDto } from '../training-catalog.models';

@Component({
  selector: 'app-training-catalog-form-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField],
  templateUrl: './training-catalog-form-modal.html',
  styles: `
    :host {
      display: contents;
    }
  `,
})
export class TrainingCatalogFormModal {
  private readonly destroyRef = inject(DestroyRef);
  /** Controla visibilidad del `<dialog>`. */
  readonly open = input(false);

  /** Módulo a editar; `null` es alta. */
  readonly module = input<TrainingModuleApiDto | null>(null);

  /** Líneas de `GET /api/v1/admin/training-lines`. */
  readonly trainingLines = input<readonly CatalogTrainingLineDto[]>([]);

  /** Error RFC 7807 de un intento de guardar. */
  readonly saveError = input('');

  /** True mientras POST/PUT está en curso. */
  readonly submitting = input(false);

  /** Cierre (cancelar, backdrop o Escape). */
  readonly closed = output<void>();

  /** Draft válido para persistir. */
  readonly saved = output<WriteTrainingModuleDto>();

  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');

  protected readonly formModel = signal<WriteTrainingModuleDto>({
    name: '',
    description: '',
    trainingLineCodes: [],
  });

  protected readonly catalogForm = form(this.formModel, (p) => {
    required(p.name, { message: 'El nombre es obligatorio' });
  });

  protected readonly lineError = signal('');

  protected readonly isEdit = computed(() => this.module() !== null);

  protected readonly title = computed(() =>
    this.isEdit() ? 'Editar módulo' : 'Nuevo módulo',
  );

  constructor() {
    this.destroyRef.onDestroy(() => {
      document.body.style.removeProperty('overflow');
    });

    effect(() => {
      const current = this.module();
      this.lineError.set('');
      this.formModel.set({
        name: current?.name ?? '',
        description: current?.description ?? '',
        trainingLineCodes: current?.trainingLines.map((line) => line.code) ?? [],
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

  /**
   * Marca o desmarca una línea de formación.
   *
   * @param code - Código PJ / GI / AE.
   * @param checked - Estado del checkbox.
   */
  /**
   * Marca o desmarca una línea de formación.
   *
   * @param code - Código PJ / GI / AE.
   * @param event - Change del checkbox.
   */
  protected onLineToggle(code: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.formModel.update((draft) => {
      const next = new Set(draft.trainingLineCodes);
      if (checked) {
        next.add(code);
      } else {
        next.delete(code);
      }
      return { ...draft, trainingLineCodes: [...next] };
    });
    this.lineError.set('');
  }

  /**
   * Indica si una línea está seleccionada.
   *
   * @param code - Código de línea.
   */
  protected isLineSelected(code: string): boolean {
    return this.formModel().trainingLineCodes.includes(code);
  }

  /** El usuario cerró el diálogo nativo. */
  protected onNativeClose(): void {
    if (this.open()) {
      this.closed.emit();
    }
  }

  /**
   * Valida el formulario y emite el draft.
   *
   * @param event - Submit del formulario.
   */
  protected onSubmit(event: Event): void {
    event.preventDefault();
    void submit(this.catalogForm, async () => {
      const draft = this.formModel();
      if (draft.trainingLineCodes.length === 0) {
        this.lineError.set('Elige al menos una línea de formación.');
        return;
      }
      this.saved.emit({
        name: draft.name.trim(),
        description: draft.description.trim(),
        trainingLineCodes: draft.trainingLineCodes,
      });
    });
  }
}
