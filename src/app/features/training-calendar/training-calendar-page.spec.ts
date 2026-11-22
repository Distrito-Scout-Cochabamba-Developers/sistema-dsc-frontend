import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthSessionService } from '@core/services/auth-session.service';

import { TRAINING_CALENDAR_API_ENABLED } from './services/training-calendar';
import { TrainingCalendarPage } from './training-calendar-page';
import type { CalendarSessionApiDto } from './training-calendar.models';

describe('TrainingCalendarPage', () => {
  function textOf(fixture: { nativeElement: HTMLElement }): string {
    return fixture.nativeElement.textContent ?? '';
  }

  describe('fixtures (API aún no publicada)', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TrainingCalendarPage],
        providers: [
          provideRouter([]),
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: TRAINING_CALENDAR_API_ENABLED, useValue: false },
        ],
      }).compileComponents();
    });

    it('muestra el mes, la lista de próximos y el aviso de demostración', () => {
      const fixture = TestBed.createComponent(TrainingCalendarPage);
      fixture.detectChanges();

      const text = textOf(fixture);
      expect(text).toContain('Calendario de módulos');
      expect(text).toContain('Módulos próximos');
      expect(text).toContain('demostración');
      expect(text).toContain('Módulo de Liderazgo y Servicio');
      expect(text).toContain('Mes');
      expect(text).toContain('Lista');
    });

    it('abre el modal al pulsar Inscribirme y pide login si no hay sesión', () => {
      const fixture = TestBed.createComponent(TrainingCalendarPage);
      fixture.detectChanges();

      const buttons = [
        ...(fixture.nativeElement as HTMLElement).querySelectorAll('button'),
      ] as HTMLButtonElement[];
      buttons.find((button) => button.textContent?.includes('Inscribirme'))?.click();
      fixture.detectChanges();

      const dialog = (fixture.nativeElement as HTMLElement).querySelector('dialog');
      expect(dialog?.textContent).toContain('Confirmar inscripción');
      expect(dialog?.textContent).toContain('Iniciar sesión');
    });

    it('marca la tarjeta como Inscrito tras confirmar con sesión activa', () => {
      TestBed.inject(AuthSessionService).applyAuthenticatedProfile({
        id: 2,
        personId: 2,
        username: 'pablo.rocha',
        email: 'pablo.rocha@example.test',
        roles: ['ADMIN'],
        displayName: 'pablo.rocha',
      });

      const fixture = TestBed.createComponent(TrainingCalendarPage);
      fixture.detectChanges();

      const buttons = [
        ...(fixture.nativeElement as HTMLElement).querySelectorAll('button'),
      ] as HTMLButtonElement[];
      buttons.find((button) => button.textContent?.includes('Inscribirme'))?.click();
      fixture.detectChanges();

      const confirm = [
        ...(fixture.nativeElement as HTMLElement).querySelectorAll('button'),
      ].find((button) => button.textContent?.includes('Confirmar inscripción')) as
        | HTMLButtonElement
        | undefined;
      confirm?.click();
      fixture.detectChanges();

      expect(textOf(fixture)).toContain('Inscrito');
      expect(textOf(fixture)).toContain('Ya estás inscrito');
    });
  });

  describe('contrato HTTP', () => {
    let http: HttpTestingController;

    const openSession: CalendarSessionApiDto = {
      id: 42,
      moduleCode: 'AE-LID',
      moduleName: 'Sesión HTTP',
      moduleTypeCode: 'AE',
      moduleTypeName: 'Adultos en el Escultismo',
      startsAt: new Date(Date.now() + 86_400_000).toISOString(),
      endsAt: new Date(Date.now() + 100_000_000).toISOString(),
      location: 'Casa Scout',
      status: 'OPEN',
      capacity: 10,
      enrolledCount: 9,
      remainingSeats: 1,
      isEnrolled: false,
    };

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TrainingCalendarPage],
        providers: [
          provideRouter([]),
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: TRAINING_CALENDAR_API_ENABLED, useValue: true },
        ],
      }).compileComponents();
      http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
      http.verify();
    });

    it('pinta el GET y actualiza la tarjeta tras POST 201', () => {
      TestBed.inject(AuthSessionService).applyAuthenticatedProfile({
        id: 2,
        personId: 2,
        username: 'pablo.rocha',
        email: 'pablo.rocha@example.test',
        roles: ['ADMIN'],
        displayName: 'pablo.rocha',
      });

      const fixture = TestBed.createComponent(TrainingCalendarPage);
      fixture.detectChanges();
      http.expectOne('/api/v1/calendar/sessions').flush([openSession]);
      fixture.detectChanges();

      expect(textOf(fixture)).toContain('Sesión HTTP');
      expect(textOf(fixture)).toContain('Abrir convocatoria');

      const enroll = [
        ...(fixture.nativeElement as HTMLElement).querySelectorAll('button'),
      ].find((button) => button.textContent?.includes('Inscribirme')) as HTMLButtonElement;
      enroll.click();
      fixture.detectChanges();

      const confirm = [
        ...(fixture.nativeElement as HTMLElement).querySelectorAll('button'),
      ].find((button) => button.textContent?.includes('Confirmar inscripción')) as HTMLButtonElement;
      confirm.click();

      const req = http.expectOne('/api/v1/calendar/sessions/42/enrollments');
      expect(req.request.method).toBe('POST');
      req.flush({
        enrollmentId: 1,
        session: {
          ...openSession,
          isEnrolled: true,
          enrolledCount: 10,
          remainingSeats: 0,
          status: 'FULL',
        },
      });
      fixture.detectChanges();

      expect(textOf(fixture)).toContain('Inscrito');
    });

    it('ante 409 marca cupo lleno y muestra el detalle', () => {
      TestBed.inject(AuthSessionService).applyAuthenticatedProfile({
        id: 2,
        personId: 2,
        username: 'pablo.rocha',
        email: 'pablo.rocha@example.test',
        roles: ['ADMIN'],
        displayName: 'pablo.rocha',
      });

      const fixture = TestBed.createComponent(TrainingCalendarPage);
      fixture.detectChanges();
      http.expectOne('/api/v1/calendar/sessions').flush([openSession]);
      fixture.detectChanges();

      const enroll = [
        ...(fixture.nativeElement as HTMLElement).querySelectorAll('button'),
      ].find((button) => button.textContent?.includes('Inscribirme')) as HTMLButtonElement;
      enroll.click();
      fixture.detectChanges();

      const confirm = [
        ...(fixture.nativeElement as HTMLElement).querySelectorAll('button'),
      ].find((button) => button.textContent?.includes('Confirmar inscripción')) as HTMLButtonElement;
      confirm.click();

      http.expectOne('/api/v1/calendar/sessions/42/enrollments').flush(
        { title: 'Conflict', status: 409, detail: 'El cupo de esta sesión se agotó.' },
        { status: 409, statusText: 'Conflict' },
      );
      fixture.detectChanges();

      const dialog = (fixture.nativeElement as HTMLElement).querySelector('dialog');
      expect(dialog?.textContent).toContain('El cupo de esta sesión se agotó.');
      expect(textOf(fixture)).toContain('Cupo lleno');
    });
  });
});
