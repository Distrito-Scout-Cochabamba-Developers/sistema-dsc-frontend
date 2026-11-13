import { ComponentFixture, TestBed } from '@angular/core/testing';

import type { ModuleRequirementsDto } from '../curriculum-config.models';
import { CurriculumRequirementsViewer } from './curriculum-requirements-viewer';

describe('CurriculumRequirementsViewer', () => {
  let fixture: ComponentFixture<CurriculumRequirementsViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurriculumRequirementsViewer],
    }).compileComponents();

    fixture = TestBed.createComponent(CurriculumRequirementsViewer);
  });

  it('debe calcular los módulos voluntarios y formatear el resumen de requisitos', () => {
    const mockRequirements: ModuleRequirementsDto = {
      totalModulesCount: 12,
      minMandatoryModulesCount: 2,
      mandatoryModules: [
        { id: 1, name: 'Primeros auxilios', description: 'Atención inicial' },
        { id: 4, name: 'Ciclo de programa', description: null },
      ],
    };

    fixture.componentRef.setInput('levelName', 'Insignia de Madera I-II');
    fixture.componentRef.setInput('trainingLineCode', 'PJ');
    fixture.componentRef.setInput('requirements', mockRequirements);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Configurado');
    expect(compiled.textContent).toContain('12 módulos');
    expect(compiled.textContent).toContain('2 de la lista');
    expect(compiled.textContent).toContain('10 módulos (a elección del dirigente)');
    expect(compiled.textContent).toContain('Primeros auxilios');
    expect(compiled.textContent).toContain('Ciclo de programa');
    const badges = compiled.querySelectorAll('span.bg-dsc-soft');
    expect(badges.length).toBeGreaterThanOrEqual(2);
    for (const badge of badges) {
      expect(badge.classList.contains('rounded-md')).toBe(true);
      expect(badge.classList.contains('text-dsc-dark')).toBe(true);
    }
  });

  it('debe distinguir carga y ausencia de requisitos', () => {
    fixture.componentRef.setInput('levelName', 'Insignia de Madera I-II');
    fixture.componentRef.setInput('trainingLineCode', 'PJ');
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="status"]')).not.toBeNull();
    expect(root.textContent).not.toContain('Sin requisitos');
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
    expect(root.textContent).toContain('Sin requisitos');
    expect(root.textContent).toContain('Sin configuración establecida');
  });
});
