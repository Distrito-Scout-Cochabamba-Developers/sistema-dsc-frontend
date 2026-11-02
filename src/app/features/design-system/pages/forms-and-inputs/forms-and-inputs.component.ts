
import {
  ChangeDetectionStrategy,
  Component,
  signal
} from '@angular/core';

import {
  TextFieldComponent
} from '../../../../shared/components/form-controls/text-field/text-field.component';

import {
  CheckboxComponent
} from '../../../../shared/components/form-controls/checkbox/checkbox.component';

import {
  RadioGroupComponent,
  RadioOption
} from '../../../../shared/components/form-controls/radio-group/radio-group.component';

import {
  ToggleComponent
} from '../../../../shared/components/form-controls/toggle/toggle.component';

import {
  SelectComponent,
  SelectOption
} from '../../../../shared/components/form-controls/select/select.component';

import {
  TagInputComponent
} from '../../../../shared/components/form-controls/tag-input/tag-input.component';

import {
  TextareaComponent
} from '../../../../shared/components/form-controls/textarea/textarea.component';

import { DatePickerComponent } from
  '../../../../shared/components/form-controls/date-picker/date-picker.component';

/**
 * Página de documentación y demostración de controles de formulario.
 *
 * Presenta los componentes reutilizables del Design System DSC
 * y permite visualizar sus estados e interacciones.
 */
@Component({
  selector: 'app-forms-and-inputs',
  standalone: true,
  imports: [
    CheckboxComponent,
    RadioGroupComponent,
    ToggleComponent,
    SelectComponent,
    TagInputComponent,
    TextareaComponent,
    TextFieldComponent,
    DatePickerComponent
  ],
  templateUrl: './forms-and-inputs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormsAndInputsComponent {

  // ==========================================
  // TEXT FIELD - CAMPOS BÁSICOS
  // ==========================================

  readonly fullName = signal('');
  readonly emailAddress = signal('alejandro.vargas@nexus.internal');
  readonly tenantId = signal('TENANT-AZ-99824-ORG');


  // ==========================================
  // TEXT FIELD - ICONOGRAFÍA ASISTIDA
  // ==========================================

  readonly globalSearch = signal('');
  readonly budgetLimit = signal('24500');
  readonly contactEmail = signal('admin@empresa');
  readonly masterPassword = signal('Nexus2026!Secure');


  // ==========================================
  // TEXT FIELD - VALIDACIÓN
  // ==========================================

  readonly subdomain = signal('cloud-ops-cluster-01');
  readonly storageQuota = signal('880 GB de 1000 GB');
  readonly apiSecret = signal('sk_live_malformed_token_9');

  // ==========================================
  // CHECKBOXES
  // ==========================================

  readonly tlsStrict = signal(true);
  readonly auditLogs = signal(true);
  readonly sandboxMode = signal(false);


  // ==========================================
  // RADIO GROUP
  // ==========================================

  readonly availabilityOptions: RadioOption[] = [
    {
      value: 'enterprise',
      label: 'Empresarial Alta Disponibilidad',
      description: 'Failover redundante multizona automatizado.',
      badge: '99.99% SLA'
    },
    {
      value: 'regional',
      label: 'Estándar Regional',
      description: 'Recuperación ante desastres en menos de 15 minutos.'
    }
  ];

  readonly selectedAvailability = signal('enterprise');


  // ==========================================
  // TOGGLES
  // ==========================================

  readonly dynamicBalance = signal(true);
  readonly maintenanceMode = signal(false);


  // ==========================================
  // SELECT
  // ==========================================

  readonly regions: SelectOption[] = [
    {
      value: 'sa-east-1',
      label: 'sa-east-1 (São Paulo, Brasil)'
    },
    {
      value: 'us-east-1',
      label: 'us-east-1 (Virginia, USA)'
    },
    {
      value: 'eu-west-1',
      label: 'eu-west-1 (Irlanda)'
    },
    {
      value: 'ap-southeast-1',
      label: 'ap-southeast-1 (Singapur)'
    }
  ];

  readonly selectedRegion = signal('sa-east-1');


  // ==========================================
  // TAG INPUT
  // ==========================================

  readonly serviceTags = signal<string[]>([
    'env:production',
    'tier:critical',
    'pci-dss'
  ]);


  // ==========================================
  // TEXTAREA
  // ==========================================

  readonly versionDescription = signal(
    'Despliegue incremental de microservicios con validación de payloads criptográficos y sincronización de eventos.'
  );

  // ==========================================
  // SELECTOR FECHA SIMPLE
  // ==========================================
  readonly selectedDate = signal('');

}
