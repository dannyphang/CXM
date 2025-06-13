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
    this.onResize();

    // this.initBlobity(true);

    this.coreAuthService.getCurrentAuthUser().then(async userC => {
      if (userC) {
        this.user = userC;
        this.commonService.getLanguageOptions().subscribe(res => {
          let lang = res.data.find(l => l.id === this.user.setting?.defaultLanguage).code || 'en';
          this.translateService.setDefaultLang(lang);
          this.translateService.use(lang);
        });

        this.commonService.getParamsUrl().then(params => {
          if (params.calendarEmail) {
            this.user.setting.calendarEmail = params.calendarEmail;
            this.authService.updateUserFirestore([this.user]).subscribe({});
          }
        })
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
        this.permission = this.authService.returnPermission(this.user.permission);
        this.langLoaded = true;
        await this.fetchCalendar();
      }
      else {
        // this.router.navigate(["/signin"]);
      }
    }).catch(error => {
      this.router.navigate(["/signin"]);
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.commonService.updateWindowSize();
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

  fetchCalendar(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        this.calendarService.fetchCalendar(this.coreAuthService.userC.setting?.calendarEmail).subscribe({
          next: calendar => {
            let events: CalendarEventDto[] = calendar.data.map(event => ({
              id: event.id,
              subject: event.summary,
              isAllDay: event.start.dateTime ? false : true,
              startTime: new Date(event.start.dateTime || event.start.date),
              endTime: new Date(event.end.dateTime || event.end.date),
              location: event.location || '',
              description: event.description || '',
              recurrenceRule: event.recurrence ? event.recurrence.rule : '',
              recurrenceID: event.recurrence ? event.recurrence.id : null,
              iCalUid: event.iCalUid || '',
            }));
            this.calendarService.calendarSettingEvents = events
          },
          error: error => {
            console.error('Error fetching Calendar:', error);
          }
        });
      }
      catch (error) {
        console.error('Error in fetchCalendar:', error);
        reject(error);
      }
    });
  }
}
