import { Component, HostListener } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { BaseCoreAbstract } from '../../core/shared/base/base-core.abstract';
import { TranslateService } from '@ngx-translate/core';
import { AuthService, UserDto } from '../../core/services/auth.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.scss'
})
export class SettingComponent extends BaseCoreAbstract {
  settingMenuItem: MenuItem[] = [];
  userC: UserDto;

  constructor(
    protected override messageService: MessageService,
    private translateService: TranslateService,
    private authService: AuthService
  ) {
    super(messageService);
  }

  ngOnInit() {
    this.userC = this.authService.userC;
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
        visible: this.userC.roleId === 1,
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
  }

  @HostListener('window:scroll', ['$event']) // for window scroll events
  onScroll(event: any) {
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
