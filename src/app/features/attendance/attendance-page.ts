import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';

import type { ModuleSession, AttendanceRegistrationResult } from '@core/models/attendance.models';
import { AdultDirectoryService } from '@core/services/adult-directory.service';
import { attendanceQrImageUrl } from '@core/utils/session-presentation.utils';
import { StateCard } from '@shared/components/state-card';

import { AttendanceForm } from './components/attendance-form';
import { AttendanceSuccess } from './components/attendance-success';

@Component({
  selector: 'app-attendance-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StateCard, AttendanceSuccess, AttendanceForm],
  templateUrl: './attendance-page.html',
})
export class AttendancePage {
  /**
   * Identificador de sesión del módulo (ruta `/asistencia/:sessionId`).
   * Proviene del deep link o QR.
   */
  readonly sessionId = input.required<string>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly directory = inject(AdultDirectoryService);

  protected readonly session = signal<ModuleSession | null>(null);
  protected readonly loadError = signal(false);
  protected readonly success = signal<AttendanceRegistrationResult | null>(null);

  /** QR del deep link actual (consumo local). */
  protected readonly qrImageUrl = computed(() => {
    const id = this.session()?.sessionId;
    if (!id || typeof globalThis.location === 'undefined') {
      return '';
    }
    const absolute = `${globalThis.location.origin}/asistencia/${encodeURIComponent(id)}`;
    return attendanceQrImageUrl(absolute);
  });

  constructor() {
    toObservable(this.sessionId)
      .pipe(
        switchMap((id) => this.directory.getModuleSession(id)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((session) => {
        if (!session) {
          this.loadError.set(true);
          this.session.set(null);
          return;
        }
        this.loadError.set(false);
        this.session.set(session);
      });
  }
}
