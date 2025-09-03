import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as Blobity from 'blobity';
import { AuthService } from '../core/services/auth.service';
import { OptionsModel } from '../core/services/components.service';
import { ToastService } from '../core/services/toast.service';
import { CoreHttpService, TenantDto, UserPermissionDto } from '../core/services/core-http.service';
import { CommonService } from '../core/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreAuthService, UserDto } from '../core/services/core-auth.service';
import { CalendarEventDto, CalendarService } from '../core/services/calendar.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  user: UserDto;
  tenantList: TenantDto[] = [];
  tenantOptionsList: OptionsModel[] = [];
  permission: UserPermissionDto[] = [];
  langLoaded = false;

  constructor(
    private authService: AuthService,
    private translateService: TranslateService,
    private commonService: CommonService,
    private cdRef: ChangeDetectorRef,
    private toastService: ToastService,
    private coreService: CoreHttpService,
    private router: Router,
    private coreAuthService: CoreAuthService,
    private route: ActivatedRoute,
    private calendarService: CalendarService
  ) {
  }

  async ngOnInit() {

    // this.initBlobity(true);
    this.user = this.coreAuthService.userC;
    if (!this.user) {
      this.router.navigate(["/signin"]);
    }

    // get permission
    this.permission = this.coreAuthService.permission;
    this.user.permission = this.coreAuthService.permission;

    // get language
    this.commonService.getLanguageOptions().subscribe(res => {
      let lang = res.data.find(l => l.id === this.user.setting?.defaultLanguage).code || 'en';
      this.translateService.setDefaultLang(lang);
      this.translateService.use(lang);
    });

    this.commonService.getParamsUrl().then(params => {
      // update calendar email and calendarId if they are provided in the URL
      if (params.calendarEmail) {
        if (this.user.setting.calendarEmail !== params.calendarEmail) {
          this.user.setting.calendarId = params.calendarEmail;
        }
        this.user.setting.calendarEmail = params.calendarEmail;
        this.authService.updateUserFirestore([this.user]).subscribe({});
      }
    })

    // loading tenant toast
    this.toastService.addSingle({
      key: 'tenant',
      message: this.translateService.instant('COMMON.LOADING',
        {
          module: this.translateService.instant('COMMON.TENANT')
        }
      ),
      severity: 'info',
      isLoading: true
    });
    // fetch tenant list
    this.coreService.getTenantsByUserId(this.user.uid).subscribe(res3 => {
      if (res3.isSuccess) {
        this.tenantList = res3.data;
        this.tenantOptionsList = this.tenantList.map(t => {
          return {
            label: t.tenantName,
            value: t.uid
          }
        });
        this.toastService.clear('tenant');
      }
    });

    this.langLoaded = true;
    await this.calendarService.getCalendarEvent(this.coreAuthService.userC.setting?.calendarEmail, this.coreAuthService.userC.setting?.calendarId);
  }

  @HostListener('window:beforeunload')
  ngOnDestroy() {
    if (this.user) {
      this.coreService.getUser(this.user.uid).subscribe(res => {
        if (res.isSuccess) {
          this.user = res.data;
          this.coreService.updateUserLastActiveTime(this.user).subscribe();
        }
      });
    }
  }

  initBlobity(isOn: boolean) {
    if (isOn) {
      const options = {
        color: "rgb(180, 180, 180)",
        zIndex: 1,
        dotColor: "rgb(50, 200, 200)",
        opacity: 0.2,
        size: 20,
        kineticMorphing: false
      };
      new Blobity.default(options);
    }
    else {
      new Blobity.default().destroy();

      // new Blobity.default({ size: 0, dotSize: 0, radius: 0, zIndex: -2 });
    }
  }

  blobityFunc(isOn: boolean) {
    this.initBlobity(isOn);
  }
}
