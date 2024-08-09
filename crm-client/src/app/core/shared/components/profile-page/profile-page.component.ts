import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonService, ContactDto, PropertyGroupDto } from '../../../services/common.service';
import { ActivatedRoute } from '@angular/router';
import { ActivityDto, ActivityService } from '../../../services/activity.service';
import { Title } from '@angular/platform-browser';

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
  activitiesList: ActivityDto[] = [];

  constructor(
    private commonService: CommonService,
    private activityService: ActivityService,
    private route: ActivatedRoute,
    private titleService: Title
  ) {
    this.route.params.subscribe((params) => {
      this.profileId = params['id'];
    });

    // this.getProperties();
    this.getContact();
    // this.getActivities();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['propertiesList'] && changes['propertiesList'].currentValue) {
      this.propertiesList = changes['propertiesList'].currentValue;
    }
  }

  getProperties() {
    this.commonService.getAllPropertiesByModule(this.module).subscribe((res) => {
      this.propertiesList = res;
    });
  }

  getContact() {
    this.commonService.getContactById(this.profileId).subscribe((res) => {
      this.contactProfile = res;
      this.titleService.setTitle(`${this.contactProfile.contactFirstName} ${this.contactProfile.contactLastName}`)
    });
  }

  getActivities() {
    let profile = {
      contactId: this.module === 'CONT' ? this.contactProfile.uid : '',
      companyId: this.module === 'COMP' ? this.contactProfile.uid : '',
    }
    this.activityService.getAllActivities().subscribe(res => {
      this.activitiesList = res;
    })
  }

  contactProfileUpdate(event: any) {
    this.getContact();
  }
}
