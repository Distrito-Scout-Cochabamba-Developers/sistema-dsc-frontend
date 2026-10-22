/**
 * Confirmación modal para eliminar un módulo del catálogo.
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
  viewChild,
} from '@angular/core';

import type { TrainingModuleApiDto } from '@core/models/attendance-api.models';

@Component({
  selector: 'app-training-catalog-delete-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './training-catalog-delete-dialog.html',
  styles: `
    :host {
      display: contents;
    }
  `,
})
export class TrainingCatalogDeleteDialog {
  private readonly destroyRef = inject(DestroyRef);

  /** Controla visibilidad del `<dialog>`. */
  readonly open = input(false);

  /** Módulo a eliminar. */
  readonly module = input<TrainingModuleApiDto | null>(null);

  /** Error RFC 7807 de un intento de borrar. */
  readonly deleteError = input('');

  /** True mientras DELETE está en curso. */
  readonly submitting = input(false);

  /** Cierre (cancelar, backdrop o Escape). */
  readonly closed = output<void>();

  /** El usuario confirmó el borrado. */
  readonly confirmed = output<void>();

  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    this.destroyRef.onDestroy(() => {
      document.body.style.removeProperty('overflow');
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
}
