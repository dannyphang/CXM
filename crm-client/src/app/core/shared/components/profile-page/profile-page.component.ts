import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonService, CompanyDto, ContactDto, PropertyGroupDto } from '../../../services/common.service';
import { ActivatedRoute } from '@angular/router';
import { ActivityDto, ActivityService } from '../../../services/activity.service';
import { Title } from '@angular/platform-browser';
import { BaseCoreAbstract } from '../../base/base-core.abstract';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../services/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss'
})
export class ProfilePageComponent extends BaseCoreAbstract implements OnChanges {
  @Input() module: 'CONT' | 'COMP' = 'CONT';
  @Input() propertiesList: PropertyGroupDto[] = [];
  @Input() profileUid: string = '';
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
    private authService: AuthService,
    private translateService: TranslateService
  ) {
    super(messageService);

    this.route.params.subscribe((params) => {
      this.profileUid = params['id'];
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
      this.getActivities();
    }
  }

  getProperties() {
    this.commonService.getAllPropertiesByModule(this.module, this.authService.tenant?.uid).subscribe((res) => {
      if (res.isSuccess) {
        this.propertiesList = res.data;
      }
      else {
        this.popMessage({
          message: res.responseMessage,
          severity: 'error'
        });
      }
    });
  }

  getContact() {
    this.commonService.getContactById(this.profileUid).subscribe((res) => {
      if (res.isSuccess) {
        this.contactProfile = res.data;
        this.titleService.setTitle(`${this.contactProfile.contactFirstName} ${this.contactProfile.contactLastName}`);
      }
      else {
        this.popMessage({
          message: res.responseMessage,
          severity: 'error'
        });
      }
    });
  }

  getCompany() {
    this.commonService.getCompanyById(this.profileUid).subscribe((res) => {
      if (res.isSuccess) {
        this.companyProfile = res.data;
        this.titleService.setTitle(`${this.companyProfile.companyName}`);
      }
      else {
        this.popMessage({
          message: res.responseMessage,
          severity: 'error'
        });
      }
    });
  }

  getActivities() {
    if (this.profileUid) {
      this.popMessage({
        message: this.translateService.instant('COMMON.LOADING',
          {
            module: this.translateService.instant('COMMON.ACTIVITY')
          }
        ),
        severity: 'info',
        isLoading: true
      });
      this.activityService.getAllActivitiesByProfileId(this.profileUid).subscribe(res => {
        if (res.isSuccess) {
          this.activitiesList = res.data;
          this.clearMessage();
        }
        else {
          this.popMessage({
            message: res.responseMessage,
            severity: 'error'
          });
        }
      })
    }
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
