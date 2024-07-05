import { Component, EventEmitter, Input, input, Output } from '@angular/core';
import { ModulePropertiesDto, PropertiesDto, PropertyLookupDto } from '../../../services/common.service';
import { CONTROL_TYPE_CODE } from '../../../services/components.service';
import { Observable, of } from 'rxjs';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-property',
  templateUrl: './property.component.html',
  styleUrl: './property.component.scss'
})
export class PropertyComponent {
  @Input() property: PropertiesDto = new PropertiesDto();
  @Input() propertyValue: any = null ? '' : '--';
  @Output() propertyValueChange: EventEmitter<any> = new EventEmitter<any>();
  @Input() fieldControl: FormControl = new FormControl('');
  propertyLookUpList: any[] = [];
  constructor(

  ) {

  }

  ngOnInit() {
    if (this.property.propertyLookupList.length > 0) {
      this.property.propertyLookupList.forEach((item: PropertyLookupDto) => {
        this.propertyLookUpList.push({ label: item.propertyLookupLabel, value: item.uid });
      });
    }

    if (this.property.propertyType == 'CBX_S') {
      this.propertyLookUpList.push({ label: 'True', value: 'true' });
      this.propertyLookUpList.push({ label: 'False', value: 'false' });
    }
  }

  getDataSourceAction() {
    return (): Observable<any> => {
      return of(this.propertyLookUpList);
    };
  }

  maxDate() {
    return new Date();
  }
}
