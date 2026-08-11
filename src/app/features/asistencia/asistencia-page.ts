 import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';

import type { ModuloSesion, RegistroAsistenciaResult } from '@core/models/asistencia.models';
import { AdultosDirectoryService } from '@core/services/adultos-directory.service';
import { StateCard } from '@shared/components/state-card';

import { AsistenciaForm } from './asistencia-form';
import { AsistenciaSuccess } from './asistencia-success';

@Component({
  selector: 'app-asistencia-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StateCard, AsistenciaSuccess, AsistenciaForm],
  templateUrl: './asistencia-page.html',
})
export class AsistenciaPage {
  /**
   * Identificador de sesión del módulo (ruta `/asistencia/:sessionId`).
   * Proviene del deep link o QR.
   */
  readonly sessionId = input.required<string>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly directory = inject(AdultosDirectoryService);

  protected readonly sesion = signal<ModuloSesion | null>(null);
  protected readonly loadError = signal(false);
  protected readonly success = signal<RegistroAsistenciaResult | null>(null);

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
  }
}
