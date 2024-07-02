import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonService, ModulePropertiesDto } from '../../../services/common.service';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss'
})
export class ProfilePageComponent implements OnChanges {
  @Input() module: 'CONT' | 'COMP' = 'CONT';
  @Input() propertiesList: ModulePropertiesDto[] = [];
  @Input() profileId: string = '';

  constructor(
    private commonService: CommonService,
  ) {
    // this.commonService.getAllPropertiesByModule(this.module).subscribe((res) => {
    //   this.propertiesList = res;
    //   console.log(this.propertiesList);
    // });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['propertiesList'] && changes['propertiesList'].currentValue) {
      this.propertiesList = changes['propertiesList'].currentValue;
      console.log(this.propertiesList)
    }
  }
}
