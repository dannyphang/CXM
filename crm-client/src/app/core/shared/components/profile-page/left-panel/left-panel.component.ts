import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ModulePropertiesDto } from '../../../../services/common.service';

@Component({
  selector: 'app-left-panel',
  templateUrl: './left-panel.component.html',
  styleUrl: './left-panel.component.scss'
})
export class LeftPanelComponent implements OnChanges {
  @Input() propertiesList: ModulePropertiesDto[] = [];
  @Input() module: 'CONT' | 'COMP' = 'CONT';

  constructor() {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['propertiesList'] && changes['propertiesList'].currentValue) {
      this.propertiesList = changes['propertiesList'].currentValue;
    }
  }
}
