import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import type {
  EligibleModuleDto,
  TrainingLevelItemDto,
  TrainingLevelRequirementsDto,
} from './curriculum-config.models';
import { CurriculumConfigPage } from './curriculum-config-page';

describe('CurriculumConfigPage', () => {
  let fixture: ComponentFixture<CurriculumConfigPage>;
  let component: CurriculumConfigPage;
  let http: HttpTestingController;

  const mockLevels: TrainingLevelItemDto[] = [
    { code: 'IM-I-II', name: 'Insignia de Madera I-II', trainingLineCode: 'PJ', isActive: true },
    { code: 'IM-III', name: 'Insignia de Madera III', trainingLineCode: 'PJ', isActive: true },
  ];

  const mockModules: EligibleModuleDto[] = [
    { id: 1, name: 'Primeros auxilios', description: 'Básico', trainingLines: [] },
    { id: 2, name: 'Ciclo de programa', description: 'Metodología', trainingLines: [] },
    { id: 3, name: 'Liderazgo', description: 'Habilidades', trainingLines: [] },
  ];

  const mockRequirements: TrainingLevelRequirementsDto = {
    trainingLevelCode: 'IM-I-II',
    modules: {
      totalModulesCount: 12,
      minMandatoryModulesCount: 2,
      mandatoryModules: [
        { id: 1, name: 'Primeros auxilios', description: 'Básico' },
        { id: 2, name: 'Ciclo de programa', description: 'Metodología' },
      ],
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurriculumConfigPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CurriculumConfigPage);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  async function flushInitialLoad(): Promise<void> {
    fixture.detectChanges();
    http.expectOne('/api/v1/training-levels').flush(mockLevels);
    http.expectOne('/api/attendance/modules').flush(mockModules);
    http.expectOne('/api/v1/training-levels/IM-I-II/requirements').flush(mockRequirements);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('debe mostrar el nombre y vincular etiquetas, ayudas y controles sin IDs duplicados', async () => {
    await flushInitialLoad();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('h1')?.textContent?.trim()).toBe('Requisitos de formación');
    expect(root.querySelector('[aria-current="page"]')?.textContent).toBe(
      'Requisitos de formación',
    );

    const ids = Array.from(root.querySelectorAll('[id]'), (element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const control of root.querySelectorAll('input, select')) {
      const label = root.querySelector<HTMLLabelElement>(`label[for="${control.id}"]`);
      expect(label?.control).toBe(control);
      for (const id of control.getAttribute('aria-describedby')?.split(' ') ?? []) {
        expect(root.querySelector(`#${id}`)).not.toBeNull();
      }
    }
  });

  it('debe enlazar el estado vacío a la nueva ruta de requisitos de formación', () => {
    fixture.detectChanges();
    http.expectOne('/api/v1/training-levels').flush([]);
    http.expectOne('/api/attendance/modules').flush([]);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('app-state-card a')?.getAttribute('href')).toBe(
      '/admin/requisitos-formacion',
    );
  });

  it('debe filtrar sin perder la selección y permitir alternar mediante el control nativo', async () => {
    await flushInitialLoad();
    const root: HTMLElement = fixture.nativeElement;
    const search = root.querySelector<HTMLInputElement>('#module-search-input')!;
    search.value = 'Liderazgo';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(root.querySelectorAll('input[type="checkbox"]')).toHaveLength(1);
    root.querySelector<HTMLInputElement>('#module-checkbox-3')!.click();
    fixture.detectChanges();
    expect([...component['selectedModuleIds']()]).toEqual([1, 2, 3]);
  });

  it('debe describir el error del mínimo obligatorio y bloquear el guardado', async () => {
    await flushInitialLoad();
    component['minMandatoryModulesCount'].set(13);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const input = root.querySelector<HTMLInputElement>('#min-mandatory-input')!;
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toContain('requirements-validation-error');
    expect(root.querySelector('#requirements-validation-error')?.textContent).toContain(
      'no puede ser superior',
    );
    expect(root.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled).toBe(true);
  });

  it('debe deshabilitar los controles y las acciones mientras guarda', async () => {
    await flushInitialLoad();
    component['onSubmit']();
    fixture.detectChanges();
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    for (const control of root.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
      'input[type="number"], input[type="checkbox"], select',
    )) {
      expect(control.disabled).toBe(true);
    }
    expect(root.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled).toBe(true);
    http.expectOne('/api/v1/admin/training-levels/IM-I-II/requirements').flush(mockRequirements);
  });

  it('debe permitir alternar módulos y validar que el mínimo no supere los seleccionados', async () => {
    await flushInitialLoad();

    // Desmarcar módulo 1 y 2
    component['toggleModule'](1);
    component['toggleModule'](2);
    fixture.detectChanges();

    // Ahora hay 0 seleccionados pero el mínimo es 2
    expect(component['selectedCount']()).toBe(0);
    expect(component['validationError']()).toContain(
      'no puede superar la cantidad de módulos obligatorios seleccionados',
    );

    const submitBtn = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);
  });

  it('debe guardar exitosamente y mostrar mensaje de confirmación', async () => {
    await flushInitialLoad();

    const submitBtn = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(false);

    submitBtn.click();
    fixture.detectChanges();

    const saveReq = http.expectOne('/api/v1/admin/training-levels/IM-I-II/requirements');
    expect(saveReq.request.method).toBe('PUT');
    expect(saveReq.request.body).toEqual({
      totalModulesCount: 12,
      minMandatoryModulesCount: 2,
      mandatoryModuleIds: [1, 2],
    });

    saveReq.flush({
      trainingLevelCode: 'IM-I-II',
      modules: {
        totalModulesCount: 12,
        minMandatoryModulesCount: 2,
        mandatoryModules: [
          { id: 1, name: 'Primeros auxilios', description: 'Básico' },
          { id: 2, name: 'Ciclo de programa', description: 'Metodología' },
        ],
      },
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(
      'Requisitos para el nivel IM-I-II guardados correctamente',
    );
  });

  it('debe manejar errores del servidor al guardar y conservar los valores del formulario', async () => {
    await flushInitialLoad();

    const submitBtn = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    submitBtn.click();
    fixture.detectChanges();

    const saveReq = http.expectOne('/api/v1/admin/training-levels/IM-I-II/requirements');
    saveReq.flush(
      { detail: 'Conflicto de persistencia al actualizar requisitos.' },
      { status: 409, statusText: 'Conflict' },
    );
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Conflicto de persistencia al actualizar requisitos.');
    // Los valores se conservan
    expect(component['totalModulesCount']()).toBe(12);
    expect(component['minMandatoryModulesCount']()).toBe(2);
  });

  it('debe cargar los requisitos al cambiar de nivel en el selector', async () => {
    await flushInitialLoad();

    component['onSelectLevel']('IM-III');
    fixture.detectChanges();

    const req = http.expectOne('/api/v1/training-levels/IM-III/requirements');
    expect(req.request.method).toBe('GET');
    req.flush({
      trainingLevelCode: 'IM-III',
      modules: {
        totalModulesCount: 8,
        minMandatoryModulesCount: 1,
        mandatoryModules: [{ id: 3, name: 'Liderazgo', description: null }],
      },
    });
    fixture.detectChanges();

    expect(component['selectedLevelCode']()).toBe('IM-III');
    expect(component['totalModulesCount']()).toBe(8);
    expect(component['minMandatoryModulesCount']()).toBe(1);
    expect(component['selectedModuleIds']().has(3)).toBe(true);
  });

  it('no debe guardar los valores del nivel anterior si falla la carga del nuevo', async () => {
    await flushInitialLoad();
    component['onSelectLevel']('IM-III');
    component['onSubmit']();
    http.expectNone('/api/v1/admin/training-levels/IM-III/requirements');
    http.expectOne('/api/v1/training-levels/IM-III/requirements').flush(
      { detail: 'No se pudieron cargar los requisitos.' },
      { status: 403, statusText: 'Forbidden' },
    );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component['totalModulesCount']()).toBeNull();
    expect(component['selectedCount']()).toBe(0);
    expect(component['currentRequirements']()).toBeNull();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled).toBe(true);
    component['onSubmit']();
    http.expectNone('/api/v1/admin/training-levels/IM-III/requirements');
  });
});
