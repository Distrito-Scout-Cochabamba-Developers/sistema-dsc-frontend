
import {
  ChangeDetectionStrategy,
  Component,
  signal
} from '@angular/core';

import { CardComponent } from
  '../../../../shared/components/ui-elements/card/card.component';

import { ProgressRadialComponent } from
  '../../../../shared/components/indicators/progress-radial/progress-radial.component';

import { ProgressBarComponent } from
  '../../../../shared/components/indicators/progress-bar/progress-bar.component';

import { StepperComponent, StepperStep } from
  '../../../../shared/components/indicators/stepper/stepper.component';

import { ButtonComponent } from
  '../../../../shared/components/buttons/button/button.component';

@Component({
  selector: 'app-indicators',
  standalone: true,
  imports: [
    CardComponent,
    ProgressRadialComponent,
    ProgressBarComponent,
    StepperComponent,
    ButtonComponent
  ],
  templateUrl: './indicators.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IndicatorsComponent {
  readonly radialValue = signal(65);
  readonly linearValue = signal(45);
  readonly activeStep = signal(1);

  readonly steps: StepperStep[] = [
    {
      title: 'Información',
      description: 'Datos personales'
    },
    {
      title: 'Configuración',
      description: 'Preferencias y ajustes'
    },
    {
      title: 'Confirmación',
      description: 'Revisión de información'
    }
  ];

  increaseProgress(): void {
    this.radialValue.update(value => Math.min(100, value + 10));
    this.linearValue.update(value => Math.min(100, value + 10));
  }

  decreaseProgress(): void {
    this.radialValue.update(value => Math.max(0, value - 10));
    this.linearValue.update(value => Math.max(0, value - 10));
  }

  nextStep(): void {
    this.activeStep.update(value =>
      Math.min(this.steps.length - 1, value + 1)
    );
  }

  previousStep(): void {
    this.activeStep.update(value =>
      Math.max(0, value - 1)
    );
  }

  resetDemo(): void {
    this.radialValue.set(0);
    this.linearValue.set(0);
    this.activeStep.set(0);
  }
}
