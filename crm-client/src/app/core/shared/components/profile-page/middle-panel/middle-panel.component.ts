import { Component, Input } from '@angular/core';
import { ModulePropertiesDto } from '../../../../services/common.service';

@Component({
  selector: 'app-middle-panel',
  templateUrl: './middle-panel.component.html',
  styleUrl: './middle-panel.component.scss'
})
export class MiddlePanelComponent {
  @Input() propertiesList: ModulePropertiesDto[] = [];
  @Input() module: 'CONT' | 'COMP' = 'CONT';
}
