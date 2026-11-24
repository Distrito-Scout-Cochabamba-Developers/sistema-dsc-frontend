
import {
  ChangeDetectionStrategy,
  Component
} from '@angular/core';

import { BadgeComponent } from
  '../../../../shared/components/ui-elements/badge/badge.component';

import { AvatarComponent } from
  '../../../../shared/components/ui-elements/avatar/avatar.component';

import { CardComponent } from
  '../../../../shared/components/ui-elements/card/card.component';

import { ButtonComponent } from
  '../../../../shared/components/buttons/button/button.component';

@Component({
  selector: 'app-ui-elements',
  standalone: true,
  imports: [
    BadgeComponent,
    AvatarComponent,
    CardComponent,
    ButtonComponent
  ],
  templateUrl: './ui-elements.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UIElementsComponent {
  readonly members = [
    { initials: 'AV', name: 'Alejandro Vargas', status: 'online' as const },
    { initials: 'CM', name: 'Constanza Miranda', status: 'away' as const },
    { initials: 'JR', name: 'Juan Rodríguez', status: 'busy' as const },
    { initials: 'ML', name: 'María López', status: 'offline' as const }
  ];
}
