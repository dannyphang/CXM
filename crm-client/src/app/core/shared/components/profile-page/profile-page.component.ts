import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonService, ContactDto, PropertyGroupDto } from '../../../services/common.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss'
})
export class ProfilePageComponent implements OnChanges {
  @Input() module: 'CONT' | 'COMP' = 'CONT';
  @Input() propertiesList: PropertyGroupDto[] = [];
  @Input() profileId: string = '';
  contactProfile: ContactDto = new ContactDto();

  constructor(
    private commonService: CommonService,
    private route: ActivatedRoute
  ) {
    this.commonService.getAllPropertiesByModule(this.module).subscribe((res) => {
      this.propertiesList = res;
      console.log(this.propertiesList);
    });

    this.route.params.subscribe((params) => {
      this.profileId = params['id'];
    });

    this.commonService.getContactById(this.profileId).subscribe((res) => {
      this.contactProfile = res;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['propertiesList'] && changes['propertiesList'].currentValue) {
      this.propertiesList = changes['propertiesList'].currentValue;
      console.log(this.propertiesList)
    }
  }
}
