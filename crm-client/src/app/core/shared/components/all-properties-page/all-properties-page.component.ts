import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ModulePropertiesDto } from '../../../services/common.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-all-properties-page',
  templateUrl: './all-properties-page.component.html',
  styleUrl: './all-properties-page.component.scss'
})
export class AllPropertiesPageComponent implements OnChanges {
  @Input() module: 'CONT' | 'COMP' = 'CONT';
  @Input() propertyList: ModulePropertiesDto[] = [];
  searchControl: FormControl = new FormControl('');
  hideEmptySearchCheckbox = [{ label: 'Hide blank properties', value: 'hideEmpty' }];

  constructor(

  ) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['propertyList'] && changes['propertyList'].currentValue) {
      this.propertyList = changes['propertyList'].currentValue;
    }
  }

  ngOnInit() {
    this.searchControl.valueChanges.subscribe((value) => {
      console.log(value);
      for (let i = 0; i < this.propertyList.length; i++) {
        if (this.propertyList[i].propertiesList.length > 0) {
          this.propertyList[i].isHide = true;
          this.propertyList[i].propertiesList.forEach((property) => {
            property.isHide = true;
            if (property.propertyName.toLowerCase().includes(value.toLowerCase())) {
              property.isHide = false;
              this.propertyList[i].isHide = false;
            }
          })
        }

      }
    });
  }
}
