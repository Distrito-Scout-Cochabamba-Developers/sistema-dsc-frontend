
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  templateUrl: './date-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatePickerComponent {
  // Identificador único del control.
  readonly id = input.required<string>();

  // Texto que aparece encima del selector.
  readonly label = input.required<string>();

  // Fecha seleccionada. Formato: YYYY-MM-DD.
  readonly value = input<string>('');

  // Texto de ayuda debajo del selector.
  readonly hint = input<string>('');

  // Restricciones opcionales para las fechas.
  readonly min = input<string>('');
  readonly max = input<string>('');

  // Estados del control.
  readonly required = input<boolean>(false);
  readonly disabled = input<boolean>(false);

  // Evento que comunica la nueva fecha al componente padre.
  readonly dateChange = output<string>();

  onDateChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.dateChange.emit(target.value);
  }
}
