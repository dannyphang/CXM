import { Component, Input } from '@angular/core';
import { CommonService, ModulePropertiesDto } from '../../../../core/services/common.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.scss'
})
export class ContactSettingComponent {
  @Input() module: 'CONT' | 'COMP' = 'CONT';

  propertiesList: ModulePropertiesDto[] = [];

  constructor(
    private commonService: CommonService,
  ) {
    this.commonService.getAllPropertiesByModule(this.module).subscribe((res) => {
      this.propertiesList = res;
      console.log(this.propertiesList);
    });
  }

  ngOnInit() {
    // this.commonService.getAllPropertiesByModule(this.module).subscribe((res) => {
    //   this.propertiesList = res;
    // });
  }

  btn() {
    this.commonService.getAllPropertiesByModule(this.module).subscribe((res) => {
      this.propertiesList = res;
      console.log(this.propertiesList);
    });
    console.log(this.propertiesList);
  }
}
