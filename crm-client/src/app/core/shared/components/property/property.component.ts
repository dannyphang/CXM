import { Component, Input, input } from '@angular/core';
import { ModulePropertiesDto } from '../../../services/common.service';

@Component({
  selector: 'app-property',
  templateUrl: './property.component.html',
  styleUrl: './property.component.scss'
})
export class PropertyComponent {
  @Input() module: 'COMP' | 'CONT' = 'CONT';
  @Input() propertiesList: ModulePropertiesDto[] = [];
}
