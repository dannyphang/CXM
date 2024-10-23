import { DatePipe } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Form, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuItem, MessageService, TreeNode } from 'primeng/api';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { AuthService, TenantDto, UserDto, UserPermissionDto } from '../../core/shared/services/auth.service';
import { User } from 'firebase/auth';
import { DEFAULT_PROFILE_PIC_URL } from '../../core/shared/constants/common.constants';
import { OptionsModel } from '../../core/shared/services/components.service';
import { BaseCoreAbstract } from '../../core/shared/base/base-core.abstract';
import { ThemeService } from '../../core/shared/services/theme.service';
import { TranslateService } from '@ngx-translate/core';

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

  menuItem: MenuItem[] = [];
  searchFormControl: FormControl = new FormControl("");
  userMenuItem: MenuItem[] | undefined;
  isAutoFocus: boolean = false;
  DEFAULT_PROFILE_PIC_URL = DEFAULT_PROFILE_PIC_URL;
  avatarImage: string | null = this.DEFAULT_PROFILE_PIC_URL;
  tenantFormControl: FormControl = new FormControl("");
  isDarkMode: boolean = false;
  darkThemeFile: string = "aura-dark-blue.css";
  lightThemeFile: string = "aura-light-blue.css";

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private authService: AuthService,
    protected override messageService: MessageService,
    private translateService: TranslateService
  ) {
    super(messageService);
    this.tenantFormControl.valueChanges.subscribe(val => {
      let selectedTenant = this.tenantList.find(t => t.uid === val)!;
      this.authService.tenant = selectedTenant;
    })
  }

  ngOnInit() {
    this.initAvatarMenu();

    this.searchFormControl.valueChanges.pipe(debounceTime(2000),
      distinctUntilChanged()).subscribe(value => {
        console.log(value);
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tenantOptionsList'] && changes['tenantOptionsList'].currentValue) {
      if (this.tenantList.find(t => t.uid === this.user?.setting.defaultTenantId)) {
        this.authService.tenant = this.tenantList.find(t => t.uid === this.user.setting.defaultTenantId)!;
        this.tenantFormControl = new FormControl(this.authService.tenant.uid);
        console.log(this.tenantFormControl.value)
      }
    }

    if (changes['permission'] && changes['permission'].currentValue) {
      this.menuItem = [
        {
          label: this.translateService.instant("COMMON.CONTACT"),
          icon: '',
          tooltip: "COMMON.CONTACT",
          command: () => {
            this.router.navigate(["/contact"]);
          },
          visible: this.checkPermission('display', 'CONT', this.permission, this.authService.userC.roleId)
        },
        {
          label: this.translateService.instant('COMMON.COMPANY'),
          icon: '',
          tooltip: "COMMON.COMPANY",
          command: () => {
            this.router.navigate(["/company"]);
          },
          visible: this.checkPermission('display', 'COMP', this.permission, this.authService.userC.roleId)
        },
      ];
    }

    if (changes['user'] && changes['user'].currentValue) {
      this.avatarImage = this.user.profilePhotoUrl;

      // update theme
      this.updateThemeMode(this.user.setting.darkMode ?? false, true);

      this.initAvatarMenu();
    }
  }

  updateThemeMode(isDark: boolean, isInit = false) {
    this.isDarkMode = isDark;
    this.themeService.switchTheme(isDark ? this.darkThemeFile : this.lightThemeFile);
    if (!isInit) {
      this.authService.updateUserFirestore([{
        uid: this.authService.userC.uid,
        setting: {
          ...this.authService.userC.setting,
          darkMode: isDark
        }
      }], this.authService.userC.uid).subscribe(res => {
        if (res.isSuccess) {
          console.log(res.data)
        }
      })
    }
  }

  initAvatarMenu() {
    this.userMenuItem = [
      {
        separator: true
      },
      {
        label: this.translateService.instant('HEADER.PROFILE'),
        items: [
          {
            label: this.translateService.instant('HEADER.SETTING'),
            icon: 'pi pi-cog',
            command: () => {
              this.router.navigate(['/setting']);
            }
          }
        ]
      },
      {
        separator: true
      },
      {
        items: [
          {
            label: this.translateService.instant('BUTTON.LOGOUT'),
            icon: 'pi pi-sign-out',
            command: () => {
              this.authService.signOut();
              window.location.reload();
            },
            visible: this.user ? true : false
          },
          {
            label: this.translateService.instant('BUTTON.LOGIN'),
            icon: "pi pi-sign-in",
            command: () => {
              this.redirectToSignIn();
            },
            visible: this.user ? false : true
          }
        ]
      }
    ];
  }

  redirectToSignIn() {
    this.router.navigate(["/signin"]);
  }

  onTenantChange() {
    this.authService.updateUserFirestore([{
      uid: this.authService.user!.uid,
      setting: {
        ...this.authService.userC.setting,
        defaultTenantId: this.tenantFormControl.value,
      }
    }], this.authService.user?.uid ?? "SYSTEM").subscribe(res => {
      if (res.isSuccess) {
        window.location.reload();
      }
      else {
        this.popMessage(res.responseMessage, "Error", "error");
      }
    })

  }
}
