import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { TrainingCatalogPage } from './training-catalog-page';

describe('TrainingCatalogPage', () => {
  let http: HttpTestingController;

  const sample = {
    id: 1,
    code: 'mod-liderazgo-20241024',
    name: 'Módulo de Liderazgo y Servicio',
    description: 'Taller de liderazgo',
    moduleTypeCode: 'AE',
    moduleTypeName: 'Adultos en el Escultismo',
  };

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

    http.expectOne('/api/v1/admin/modules').flush([sample]);
    http.expectOne('/api/v1/admin/module-types').flush([
      { id: 1, code: 'AE', name: 'Adultos en el Escultismo', description: null },
    ]);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Catálogo de módulos');
    expect(text).toContain('Módulo de Liderazgo y Servicio');
    expect(text).toContain('mod-liderazgo-20241024');
    expect(text).not.toContain('Carnet de Identidad');
  });

  it('muestra el detail de Problem Details si el GET falla', () => {
    const fixture = TestBed.createComponent(TrainingCatalogPage);
    fixture.detectChanges();

    const modulesReq = http.expectOne('/api/v1/admin/modules');
    const typesReq = http.expectOne('/api/v1/admin/module-types');
    typesReq.flush([]);
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
    http.expectOne('/api/v1/admin/modules').flush([sample]);
    http.expectOne('/api/v1/admin/module-types').flush([
      { id: 1, code: 'AE', name: 'Adultos en el Escultismo', description: null },
    ]);
    fixture.detectChanges();

    const buttons = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ] as HTMLButtonElement[];
    buttons.find((button) => button.textContent?.includes('Editar'))?.click();
    fixture.detectChanges();

    const dialog = (fixture.nativeElement as HTMLElement).querySelector('dialog');
    expect(dialog?.textContent).toContain('Editar módulo');
    expect(dialog?.className).toContain('fixed');
    expect(dialog?.className).toContain('inset-0');
    expect(dialog?.className).toContain('m-auto');
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    const name = dialog?.querySelector('#catalog-name') as HTMLInputElement | null;
    expect(name?.value).toBe('Módulo de Liderazgo y Servicio');
  });

  it('elimina un módulo tras confirmar', () => {
    const fixture = TestBed.createComponent(TrainingCatalogPage);
    fixture.detectChanges();
    http.expectOne('/api/v1/admin/modules').flush([sample]);
    http.expectOne('/api/v1/admin/module-types').flush([
      { id: 1, code: 'AE', name: 'Adultos en el Escultismo', description: null },
    ]);
    fixture.detectChanges();

    const buttons = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ] as HTMLButtonElement[];
    buttons.find((button) => button.textContent?.includes('Eliminar'))?.click();
    fixture.detectChanges();

    const dialogs = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll('dialog'),
    ] as HTMLDialogElement[];
    const confirm = dialogs.find((dialog) => dialog.textContent?.includes('Eliminar módulo'));
    expect(confirm?.textContent).toContain('mod-liderazgo-20241024');
    const confirmBtn = [
      ...(confirm?.querySelectorAll('button') ?? []),
    ].find((button) => button.textContent?.trim() === 'Eliminar');
    confirmBtn?.click();
    fixture.detectChanges();

    http
      .expectOne({
        method: 'DELETE',
        url: '/api/v1/admin/modules/mod-liderazgo-20241024',
      })
      .flush(null, { status: 204, statusText: 'No Content' });
    http.expectOne('/api/v1/admin/modules').flush([]);
    http.expectOne('/api/v1/admin/module-types').flush([]);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Todavía no hay módulos en la base de datos.',
    );
  });
});
