import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonService, PropertyGroupDto } from '../../../../core/services/common.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-properties',
  templateUrl: './all-properties.component.html',
  styleUrl: './all-properties.component.scss'
})
export class ContactAllPropertiesComponent implements OnChanges {
  @Input() module: 'CONT' | 'COMP' = 'CONT';

  propertiesList: PropertyGroupDto[] = [];

  constructor(
    private commonService: CommonService,
    private router: Router,
  ) {
    // this.commonService.getAllPropertiesByModule(this.module).subscribe((res) => {
    //   this.propertiesList = res;
    //   console.log(this.propertiesList);
    // });
  }

  ngOnInit() {
    console.log(window.history.state)
    if (window.history.state.data) {
      this.propertiesList = window.history.state.data;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['propertiesList'] && changes['propertiesList'].currentValue) {
      this.propertiesList = changes['propertiesList'].currentValue;
    }
  }

  btn() {
    // this.commonService.getAllPropertiesByModule(this.module).subscribe((res) => {
    //   this.propertiesList = res;
    //   console.log(this.propertiesList);
    // });
    console.log(this.propertiesList);
  }
}
