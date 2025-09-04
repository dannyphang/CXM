import { Component, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonService, CompanyDto, ContactDto, PropertyGroupDto, WindowSizeDto } from '../../../services/common.service';
import { ActivatedRoute } from '@angular/router';
import { ActivityDto, ActivityService } from '../../../services/activity.service';
import { Title } from '@angular/platform-browser';
import { BaseCoreAbstract } from '../../base/base-core.abstract';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastService } from '../../../services/toast.service';
import { CoreHttpService, UserPermissionDto } from '../../../services/core-http.service';
import { CoreAuthService } from '../../../services/core-auth.service';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss'
})
export class ProfilePageComponent implements OnChanges {
  @Input() module: 'CONT' | 'COMP' = 'CONT';
  @Input() profileUid: string = '';
  permission: UserPermissionDto[] = [];
  propertiesList: PropertyGroupDto[] = [];

  windowSize: WindowSizeDto = new WindowSizeDto();

  contactProfile: ContactDto = null;
  companyProfile: CompanyDto = null;
  activitiesList: ActivityDto[] = [];
  isRightPanelShow: boolean = false;

  constructor(
    private commonService: CommonService,
    private activityService: ActivityService,
    private route: ActivatedRoute,
    private titleService: Title,
    private authService: AuthService,
    private translateService: TranslateService,
    private toastService: ToastService,
    private coreService: CoreHttpService,
    private coreAuthService: CoreAuthService
  ) {
    this.route.params.subscribe((params) => {
      this.profileUid = params['id'];
    });
    this.windowSize = this.commonService.windowSize;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.commonService.updateWindowSize();
    this.windowSize = this.commonService.windowSize;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['module'] && changes['module'].currentValue) {
      if (this.module === "CONT") {
        this.getContact();
      }
      else {
        this.getCompany();
      }

      this.getProperties();
      this.getActivities();
      this.getPermission();
    }
  }

  getPermission() {
    this.permission = this.coreAuthService.userC?.permission || [];
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
      key: 'property_loading'
    });
    this.commonService.getAllPropertiesByModule(this.module).subscribe((res) => {
      if (res.isSuccess) {
        this.propertiesList = res.data;
        this.toastService.clear('property_loading');
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
      key: 'contact_loading'
    });
    this.commonService.getContactById(this.profileUid).subscribe((res) => {
      if (res.isSuccess) {
        this.contactProfile = res.data;
        this.titleService.setTitle(`${this.contactProfile.contactFirstName} ${this.contactProfile.contactLastName}`);
        this.toastService.clear('contact_loading');
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
      key: 'company_loading'
    });
    this.commonService.getCompanyById(this.profileUid).subscribe((res) => {
      if (res.isSuccess) {
        this.toastService.clear('company_loading');
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
        key: 'activity_loading'
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
        this.toastService.clear('activity_loading');
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

  returnEvent(event: any): 'CONT' | 'COMP' {
    return event;
  }
}
