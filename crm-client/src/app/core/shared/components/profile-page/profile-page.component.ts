import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonService, CompanyDto, ContactDto, PropertyGroupDto } from '../../../services/common.service';
import { ActivatedRoute } from '@angular/router';
import { ActivityDto, ActivityService } from '../../../services/activity.service';
import { Title } from '@angular/platform-browser';
import { BaseCoreAbstract } from '../../base/base-core.abstract';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss'
})
export class ProfilePageComponent implements OnChanges {
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
    private authService: AuthService,
    private translateService: TranslateService,
    private toastService: ToastService
  ) {


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

      this.getProperties();
      this.getActivities();
    }
  }

  getProperties() {
    this.toastService.addSingle({
      message: this.translateService.instant('COMMON.LOADING',
        {
          module: this.translateService.instant('COMMON.PROPERTY')
        }
      ),
      severity: 'info',
      isLoading: true,
      key: 'property'
    });
    this.commonService.getAllPropertiesByModule(this.module, this.authService.tenant?.uid).subscribe((res) => {
      if (res.isSuccess) {
        this.propertiesList = res.data;
      }
      else {
        this.toastService.addSingle({
          message: res.responseMessage,
          severity: 'error'
        });
      }
    });
  }

  getContact() {
    this.toastService.addSingle({
      message: this.translateService.instant('COMMON.LOADING',
        {
          module: this.translateService.instant('COMMON.CONTACT')
        }
      ),
      severity: 'info',
      isLoading: true,
      key: 'contact'
    });
    this.commonService.getContactById(this.profileUid).subscribe((res) => {
      if (res.isSuccess) {
        this.contactProfile = res.data;
        this.titleService.setTitle(`${this.contactProfile.contactFirstName} ${this.contactProfile.contactLastName}`);
      }
      else {
        this.toastService.addSingle({
          message: res.responseMessage,
          severity: 'error'
        });
      }
    });
  }

  getCompany() {
    this.toastService.addSingle({
      message: this.translateService.instant('COMMON.LOADING',
        {
          module: this.translateService.instant('COMMON.COMPANY')
        }
      ),
      severity: 'info',
      isLoading: true,
      key: 'company'
    });
    this.commonService.getCompanyById(this.profileUid).subscribe((res) => {
      if (res.isSuccess) {
        this.companyProfile = res.data;
        this.titleService.setTitle(`${this.companyProfile.companyName}`);
      }
      else {
        this.toastService.addSingle({
          message: res.responseMessage,
          severity: 'error'
        });
      }
    });
  }

  getActivities() {
    if (this.profileUid) {
      this.toastService.addSingle({
        message: this.translateService.instant('COMMON.LOADING',
          {
            module: this.translateService.instant('COMMON.ACTIVITY')
          }
        ),
        severity: 'info',
        isLoading: true,
        key: 'activity'
      });
      this.activityService.getAllActivitiesByProfileId(this.profileUid).subscribe(res => {
        if (res.isSuccess) {
          this.activitiesList = res.data;
        }
        else {
          this.toastService.addSingle({
            message: res.responseMessage,
            severity: 'error'
          });
        }
        this.toastService.clear('activity');
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
