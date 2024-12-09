import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonService, CompanyDto, ContactDto, PropertyGroupDto } from '../../../services/common.service';
import { ActivatedRoute } from '@angular/router';
import { ActivityDto, ActivityService } from '../../../services/activity.service';
import { Title } from '@angular/platform-browser';
import { BaseCoreAbstract } from '../../base/base-core.abstract';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss'
})
export class ProfilePageComponent extends BaseCoreAbstract implements OnChanges {
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
    private titleService: Title,
    protected override messageService: MessageService,
    private authService: AuthService
  ) {
    super(messageService);

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

      // this.getProperties();

      // this.getActivities();
    }
  }

  getProperties() {
    this.commonService.getAllPropertiesByModule(this.module, this.authService.tenant?.uid).subscribe((res) => {
      if (res.isSuccess) {
        this.propertiesList = res.data;
      }
      else {
        this.popMessage(res.responseMessage, "Error", "error");
      }
    });
  }

  getContact() {
    this.commonService.getContactById(this.profileId).subscribe((res) => {
      if (res.isSuccess) {
        this.contactProfile = res.data;
        this.titleService.setTitle(`${this.contactProfile.contactFirstName} ${this.contactProfile.contactLastName}`);
      }
      else {
        this.popMessage(res.responseMessage, "Error", "error");
      }
    });
  }

  getCompany() {
    this.commonService.getCompanyById(this.profileId).subscribe((res) => {
      if (res.isSuccess) {
        this.companyProfile = res.data;
        this.titleService.setTitle(`${this.companyProfile.companyName}`);
      }
      else {
        this.popMessage(res.responseMessage, "Error", "error");
      }
    });
  }

  getActivities() {
    let profile = {
      contactId: this.module === 'CONT' ? this.contactProfile.uid : '',
      companyId: this.module === 'COMP' ? this.contactProfile.uid : '',
    }
    this.activityService.getAllActivities().subscribe(res => {
      if (res.isSuccess) {
        this.activitiesList = res.data;
      }
      else {
        this.popMessage(res.responseMessage, "Error", "error");
      }
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
