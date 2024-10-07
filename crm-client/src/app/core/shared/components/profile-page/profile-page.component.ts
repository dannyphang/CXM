import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonService, CompanyDto, ContactDto, PropertyGroupDto } from '../../../services/common.service';
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
  companyProfile: CompanyDto = new CompanyDto();
  activitiesList: ActivityDto[] = [];
  isRightPanelShow: boolean = false;

  constructor(
    private commonService: CommonService,
    private activityService: ActivityService,
    private route: ActivatedRoute,
    private titleService: Title
  ) {
    this.route.params.subscribe((params) => {
      this.profileId = params['id'];
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['propertiesList'] && changes['propertiesList'].currentValue) {
      this.propertiesList = changes['propertiesList'].currentValue;
    }

    if (changes['module'] && changes['module'].currentValue) {
      if (this.module === "CONT") {
        this.getContact();
      }
      else {
        this.getCompany();
      }

      this.getProperties();

      this.getActivities();
    }
  }

  getProperties() {
    this.commonService.getAllPropertiesByModule(this.module).subscribe((res) => {
      this.propertiesList = res.data;
    });
  }

  getContact() {
    this.commonService.getContactById(this.profileId).subscribe((res) => {
      this.contactProfile = res.data;
      this.titleService.setTitle(`${this.contactProfile.contactFirstName} ${this.contactProfile.contactLastName}`)
    });
  }

  getCompany() {
    this.commonService.getCompanyById(this.profileId).subscribe((res) => {
      this.companyProfile = res.data;
      this.titleService.setTitle(`${this.companyProfile.companyName}`)
    });
  }

  getActivities() {
    let profile = {
      contactId: this.module === 'CONT' ? this.contactProfile.uid : '',
      companyId: this.module === 'COMP' ? this.contactProfile.uid : '',
    }
    this.activityService.getAllActivities().subscribe(res => {
      this.activitiesList = res.data;
    })
  }

  profileUpdate(event: any) {
    if (this.module === 'CONT') {
      this.getContact();
    }
    else {
      this.getCompany();
    }
  }

  updateRightPanelShow() {
    this.isRightPanelShow = !this.isRightPanelShow;
  }
}
