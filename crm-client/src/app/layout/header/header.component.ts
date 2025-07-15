import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { User } from 'firebase/auth';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../core/services/common.service';
import { OptionsModel } from '../../core/services/components.service';
import { TenantDto, UserPermissionDto, CoreHttpService } from '../../core/services/core-http.service';
import { ThemeService } from '../../core/services/theme.service';
import { ToastService } from '../../core/services/toast.service';
import { BaseCoreAbstract } from '../../core/shared/base/base-core.abstract';
import { DEFAULT_PROFILE_PIC_URL } from '../../core/shared/constants/common.constants';
import { CoreAuthService, UserDto } from '../../core/services/core-auth.service';
import { EventService } from '../../core/services/event.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent extends BaseCoreAbstract implements OnChanges {
  @Input() user: UserDto;
  @Input() tenantList: TenantDto[] = [];
  @Input() tenantOptionsList: OptionsModel[] = [];
  @Input() permission: UserPermissionDto[] = [];

  isDarkMode: boolean = false;
  darkThemeFile: string = "aura-dark-blue.css";
  lightThemeFile: string = "aura-light-blue.css";

  menuItem: MenuItem[] = [];
  searchFormControl: FormControl = new FormControl("");
  userMenuItem: MenuItem[] | undefined;
  languageMenuItem: MenuItem[] | undefined;
  currentUser: UserDto;
  isAutoFocus: boolean = false;
  DEFAULT_PROFILE_PIC_URL = DEFAULT_PROFILE_PIC_URL;
  avatarImage: string | null = this.DEFAULT_PROFILE_PIC_URL;
  tenantFormControl: FormControl = new FormControl("");

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService,
    private coreService: CoreHttpService,
    private themeService: ThemeService,
    private translateService: TranslateService,
    private commonService: CommonService,
    private coreAuthService: CoreAuthService,
    private eventService: EventService,
  ) {
    super(coreAuthService);
    this.tenantFormControl.valueChanges.subscribe(val => {
      let selectedTenant = this.tenantList.find(t => t.uid === val)!;
      this.coreService.tenant = selectedTenant;
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tenantOptionsList'] && changes['tenantOptionsList'].currentValue) {
      if (this.tenantList.find(t => t.uid === this.user?.setting.defaultTenantId)) {
        this.coreService.tenant = this.tenantList.find(t => t.uid === this.user.setting.defaultTenantId)!;
        this.tenantFormControl = new FormControl(this.coreService.tenant.uid);
      }
    }

    if (changes['user'] && changes['user'].currentValue) {
      this.avatarImage = this.user.profilePhotoUrl;

      this.initAvatarMenu();// update theme
      this.updateThemeMode(this.user.setting.darkMode ?? false, true);
    }

    if (changes['permission'] && changes['permission'].currentValue) {
      console.log("Permission changed", this.permission);
      this.menuItem = [
        {
          label: "COMMON.CONTACT",
          icon: '',
          tooltip: "COMMON.CONTACT",
          command: () => {
            this.router.navigate(["/contact"]);
          },
          visible: this.checkPermission('display', 'CONT', this.permission)
        },
        {
          label: "COMMON.COMPANY",
          icon: '',
          tooltip: "COMMON.COMPANY",
          command: () => {
            this.router.navigate(["/company"]);
          },
          visible: this.checkPermission('display', 'COMP', this.permission)
        },
      ];
    }
  }

  initAvatarMenu() {
    this.userMenuItem = [
      {
        label: '',
      },
      {
        label: 'HEADER.SETTING',
        icon: 'pi pi-cog',
        command: () => {
          this.router.navigate(['/setting']);
        }
      },
      {
        label: 'COMMON.LANGUAGE',
        icon: 'pi pi-language',
        items: [
          {
            label: "HEADER.LANGUAGE.EN",
            command: () => {
              this.translateService.use('en');
              this.commonService.setLanguage('en');
            }
          },
          {
            label: 'HEADER.LANGUAGE.CN',
            command: () => {
              this.translateService.use('zh');
              this.commonService.setLanguage('zh');
            }
          },
        ]

      },
      {
        separator: true
      },
      {
        label: 'BUTTON.LOGOUT',
        icon: 'pi pi-sign-out',
        command: () => {
          this.authService.signOutUserAuth().subscribe(res => {
            this.eventService.createEventLog("auth", "Log out", `${this.coreAuthService.userC.displayName} logged out.`);
            window.location.reload();
          });
          // this.router.navigate(["/signin"]);
        },
        visible: this.currentUser ? true : false
      },
      {
        label: 'BUTTON.LOGIN',
        icon: "pi pi-sign-in",
        command: () => {
          this.redirectToSignIn();
        },
        visible: this.currentUser ? false : true
      }
    ];
  }

  updateThemeMode(isDark: boolean, isInit = false) {
    this.isDarkMode = isDark;
    this.themeService.switchTheme(isDark ? this.darkThemeFile : this.lightThemeFile);
    if (!isInit) {
      if (this.authService.returnPermissionObj('SETTING', 'update')) {
        this.authService.updateUserFirestore([{
          uid: this.coreAuthService.userC.uid,
          setting: {
            ...this.coreAuthService.userC.setting,
            darkMode: isDark
          }
        }]).subscribe(res => {
          if (res.isSuccess) {

          }
        });
      }
    }
    this.coreAuthService.getCurrentAuthUser().then(res => {
      this.currentUser = res;
      this.initAvatarMenu();
    });
  }

  ngOnInit() {
    this.menuItem = [
      {
        label: "COMMON.CONTACT",
        icon: '',
        tooltip: "COMMON.CONTACT",
        command: () => {
          this.router.navigate(["/contact"]);
        },
        visible: this.checkPermission('display', 'CONT', this.permission)
      },
      {
        label: "COMMON.COMPANY",
        icon: '',
        tooltip: "COMMON.COMPANY",
        command: () => {
          this.router.navigate(["/company"]);
        },
        visible: this.checkPermission('display', 'COMP', this.permission)
      },
    ];

    this.searchFormControl.valueChanges.pipe(debounceTime(2000),
      distinctUntilChanged()).subscribe(value => {
        console.log(value);
      });

    this.userMenuItem = [
      {
        label: 'BUTTON.LOGIN',
        icon: "pi pi-sign-in",
        command: () => {
          this.redirectToSignIn();
        }
      }
    ];
  }

  redirectToSignIn() {
    this.router.navigate(["/signin"]);
  }

  onTenantChange() {
    this.authService.updateUserFirestore([{
      uid: this.coreAuthService.userC!.uid,
      setting: {
        ...this.coreAuthService.userC.setting,
        defaultTenantId: this.tenantFormControl.value,
      }
    }]).subscribe(res => {
      if (res.isSuccess) {
        window.location.reload();
      }
      else {
        this.toastService.addSingle({
          message: res.responseMessage,
          severity: 'error'
        });
      }
    })

  }
}
