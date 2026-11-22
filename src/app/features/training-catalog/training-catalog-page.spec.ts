import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { TrainingCatalogPage } from './training-catalog-page';

describe('TrainingCatalogPage', () => {
  let http: HttpTestingController;

  const sample = {
    id: 1,
    name: 'Módulo de Liderazgo y Servicio',
    description: 'Taller de liderazgo',
    trainingLines: [
      { id: 1, code: 'AE', name: 'Adultos en el Escultismo', description: null },
    ],
  };

  const lines = [{ id: 1, code: 'AE', name: 'Adultos en el Escultismo', description: null }];

  function flushCatalog(): void {
    http.expectOne('/api/v1/admin/modules').flush([sample]);
    http.expectOne('/api/v1/admin/training-lines').flush(lines);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingCatalogPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('lista módulos de la API y no muestra el formulario de asistencia', () => {
    const fixture = TestBed.createComponent(TrainingCatalogPage);
    fixture.detectChanges();
    flushCatalog();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Catálogo de módulos');
    expect(text).toContain('Módulo de Liderazgo y Servicio');
    expect(text).toContain('Abrir convocatoria');
    expect(text).not.toContain('Carnet de Identidad');
  });

  it('muestra el detail de Problem Details si el GET falla', () => {
    const fixture = TestBed.createComponent(TrainingCatalogPage);
    fixture.detectChanges();

    const modulesReq = http.expectOne('/api/v1/admin/modules');
    const linesReq = http.expectOne('/api/v1/admin/training-lines');
    linesReq.flush([]);
    modulesReq.flush(
      {
        title: 'Error',
        status: 500,
        detail: 'El catálogo no está disponible.',
      },
      { status: 500, statusText: 'Server Error' },
    );
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('El catálogo no está disponible.');
  });

  it('abre el modal de edición con el módulo elegido', () => {
    const fixture = TestBed.createComponent(TrainingCatalogPage);
    fixture.detectChanges();
    flushCatalog();
    fixture.detectChanges();

    const buttons = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ] as HTMLButtonElement[];
    buttons.find((button) => button.getAttribute('aria-label') === 'Editar')?.click();
    fixture.detectChanges();

    const dialog = (fixture.nativeElement as HTMLElement).querySelector('dialog');
    expect(dialog?.textContent).toContain('Editar módulo');
    const name = dialog?.querySelector('#catalog-name') as HTMLInputElement | null;
    expect(name?.value).toBe('Módulo de Liderazgo y Servicio');
  });

  it('abre el modal de convocatoria y publica fecha y horas', () => {
    const fixture = TestBed.createComponent(TrainingCatalogPage);
    fixture.detectChanges();
    flushCatalog();
    fixture.detectChanges();

    const buttons = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ] as HTMLButtonElement[];
    buttons.find((button) => button.textContent?.includes('Abrir convocatoria'))?.click();
    fixture.detectChanges();

    const dialogs = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll('dialog'),
    ] as HTMLDialogElement[];
    const sessionDialog = dialogs.find((dialog) =>
      dialog.textContent?.includes('Abrir convocatoria'),
    );
    expect(sessionDialog).toBeTruthy();

    const date = sessionDialog?.querySelector('#session-date') as HTMLInputElement;
    const start = sessionDialog?.querySelector('#session-start') as HTMLInputElement;
    const end = sessionDialog?.querySelector('#session-end') as HTMLInputElement;
    date.value = '2026-12-01';
    date.dispatchEvent(new Event('input'));
    start.value = '08:30';
    start.dispatchEvent(new Event('input'));
    end.value = '12:30';
    end.dispatchEvent(new Event('input'));

    const publish = [...(sessionDialog?.querySelectorAll('button') ?? [])].find((button) =>
      button.textContent?.includes('Publicar en el calendario'),
    );
    publish?.click();
    fixture.detectChanges();

    const req = http.expectOne('/api/v1/admin/modules/1/sessions');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.statusCode).toBe('OPEN');
    expect(req.request.body.schedules[0]).toEqual({
      sessionDate: '2026-12-01',
      startTime: '08:30:00',
      endTime: '12:30:00',
      partNumber: 1,
    });
    req.flush({ id: 99 });
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Convocatoria de «Módulo de Liderazgo y Servicio» publicada',
    );
  });

  it('elimina un módulo tras confirmar', () => {
    const fixture = TestBed.createComponent(TrainingCatalogPage);
    fixture.detectChanges();
    flushCatalog();
    fixture.detectChanges();

    const buttons = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ] as HTMLButtonElement[];
    buttons.find((button) => button.getAttribute('aria-label') === 'Eliminar')?.click();
    fixture.detectChanges();

    const dialogs = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll('dialog'),
    ] as HTMLDialogElement[];
    const confirm = dialogs.find((dialog) => dialog.textContent?.includes('Eliminar módulo'));
    expect(confirm?.textContent).toContain('Módulo de Liderazgo y Servicio');
    const confirmBtn = [...(confirm?.querySelectorAll('button') ?? [])].find(
      (button) => button.textContent?.trim() === 'Eliminar',
    );
    confirmBtn?.click();
    fixture.detectChanges();

    http
      .expectOne({
        method: 'DELETE',
        url: '/api/v1/admin/modules/1',
      })
      .flush(null, { status: 204, statusText: 'No Content' });
    http.expectOne('/api/v1/admin/modules').flush([]);
    http.expectOne('/api/v1/admin/training-lines').flush([]);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Todavía no hay módulos en la base de datos.',
    );
  });
});
