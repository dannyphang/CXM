import { Component, HostListener, SimpleChanges } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { BaseCoreAbstract } from '../../core/shared/base/base-core.abstract';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { CoreHttpService, UserDto, UserPermissionDto } from '../../core/services/core-http.service';
import { CommonService, WindowSizeDto } from '../../core/services/common.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.scss'
})
export class SettingComponent extends BaseCoreAbstract {
  permission: UserPermissionDto[] = [];
  module = 'SETTING';
  settingMenuItem: MenuItem[] = [];
  userC: UserDto;

  windowSize: WindowSizeDto = new WindowSizeDto();

  constructor(
    private translateService: TranslateService,
    private authService: AuthService,
    private coreService: CoreHttpService,
    private commonService: CommonService,
    private titleService: Title,
  ) {
    super();
    this.windowSize = this.commonService.windowSize;
  }

  ngOnInit() {
    this.userC = this.coreService.userC;
    console.log(this.userC)
    this.settingMenuItem = [
      {
        label: this.translateService.instant('SETTING.GENERAL'),
        icon: '',
        command: () => {
          const element = document.getElementById('general');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      },
      {
        label: this.translateService.instant('SETTING.TEAM_MANAGEMENT'),
        icon: '',
        command: () => {
          const element = document.getElementById('team');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        },
        visible: this.userC?.roleId === 1,
      },
      {
        label: this.translateService.instant('SETTING.PROPERTY'),
        icon: '',
        command: () => {
          const element = document.getElementById('property');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      },
    ];
    this.permission = JSON.parse(this.userC.permission);
    this.titleService.setTitle(this.translateService.instant('COMMON.SETTING'));
  }

  @HostListener('window:scroll', ['$event']) // for window scroll events
  onScroll(event: any) {
    if (this.windowSize.desktop) {
      if (window.scrollY > 116) {
        document.getElementById("setting_left")!.style.width = "280px";
        document.getElementById("setting_menu_panel")!.style.position = "fixed";
        document.getElementById("setting_menu_panel")!.style.top = "10px";
      }
      else {
        document.getElementById("setting_left")!.style.width = "auto";
        document.getElementById("setting_menu_panel")!.style.position = "relative";
        document.getElementById("setting_menu_panel")!.style.top = "0";
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.commonService.updateWindowSize();
    this.windowSize = this.commonService.windowSize;
  }
}
