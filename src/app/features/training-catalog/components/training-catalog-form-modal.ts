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
import { form, required, submit } from '@angular/forms/signals';

import type { TrainingModuleApiDto } from '@core/models/attendance-api.models';
import {
  SelectComponent,
  type SelectOption,
} from '@shared/components/form-controls/select/select.component';
import { TextareaComponent } from '@shared/components/form-controls/textarea/textarea.component';
import { TextFieldComponent } from '@shared/components/form-controls/text-field/text-field.component';

import type { ModuleTypeApiDto, WriteTrainingModuleDto } from '../training-catalog.models';

@Component({
  selector: 'app-training-catalog-form-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SelectComponent, TextareaComponent, TextFieldComponent],
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

  /** Tipos de `GET /api/v1/admin/module-types`. */
  readonly moduleTypes = input<readonly ModuleTypeApiDto[]>([]);

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
    code: '',
    name: '',
    description: '',
    moduleTypeCode: '',
  });

  protected readonly catalogForm = form(this.formModel, (p) => {
    required(p.code, { message: 'El código es obligatorio' });
    required(p.name, { message: 'El nombre es obligatorio' });
    required(p.moduleTypeCode, { message: 'El tipo es obligatorio' });
  });

  protected readonly isEdit = computed(() => this.module() !== null);

  protected readonly title = computed(() =>
    this.isEdit() ? 'Editar módulo' : 'Nuevo módulo',
  );

  protected readonly attemptedSave = signal(false);

  protected readonly typeOptions = computed<SelectOption[]>(() =>
    this.moduleTypes().map((type) => ({
      value: type.code,
      label: `${type.name} (${type.code})`,
    })),
  );

  protected readonly codeHint = computed(() => {
    if (!this.attemptedSave() || !this.catalogForm.code().invalid()) {
      return '';
    }
    return this.catalogForm.code().errors()[0]?.message ?? '';
  });

  protected readonly nameHint = computed(() => {
    if (!this.attemptedSave() || !this.catalogForm.name().invalid()) {
      return '';
    }
    return this.catalogForm.name().errors()[0]?.message ?? '';
  });

  protected readonly typeHint = computed(() => {
    if (!this.attemptedSave() || !this.catalogForm.moduleTypeCode().invalid()) {
      return '';
    }
    return this.catalogForm.moduleTypeCode().errors()[0]?.message ?? '';
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      document.body.style.removeProperty('overflow');
    });

    effect(() => {
      const current = this.module();
      this.attemptedSave.set(false);
      this.formModel.set({
        code: current?.code ?? '',
        name: current?.name ?? '',
        description: current?.description ?? '',
        moduleTypeCode: current?.moduleTypeCode ?? '',
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

  /** El usuario cerró el diálogo nativo. */
  protected onNativeClose(): void {
    if (this.open()) {
      this.closed.emit();
    }
  }

  /**
   * Actualiza un campo del draft desde los controles shared.
   *
   * @param partial - Campos a fusionar.
   */
  protected patchForm(partial: Partial<WriteTrainingModuleDto>): void {
    this.formModel.update((model) => ({ ...model, ...partial }));
  }

  /**
   * Valida el formulario y emite el draft.
   *
   * @param event - Submit del formulario.
   */
  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.attemptedSave.set(true);
    void submit(this.catalogForm, async () => {
      const draft = this.formModel();
      this.saved.emit({
        code: draft.code.trim(),
        name: draft.name.trim(),
        description: draft.description.trim(),
        moduleTypeCode: draft.moduleTypeCode.trim(),
      });
    });
  }
}
