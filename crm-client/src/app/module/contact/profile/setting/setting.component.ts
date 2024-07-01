import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonService, ModulePropertiesDto } from '../../../../core/services/common.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.scss'
})
export class ContactSettingComponent implements OnChanges {
  @Input() module: 'CONT' | 'COMP' = 'CONT';

  propertiesList: ModulePropertiesDto[] = [];

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
    const currentState = this.router.getCurrentNavigation();
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
