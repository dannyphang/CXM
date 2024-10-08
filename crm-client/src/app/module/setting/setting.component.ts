import { Component } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { BaseCoreAbstract } from '../../core/shared/base/base-core.abstract';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.scss'
})
export class SettingComponent extends BaseCoreAbstract {
  settingMenuItem: MenuItem[] = [];

  constructor(
    protected override messageService: MessageService,
    private translateService: TranslateService,
    private router: Router
  ) {
    super(messageService);
  }

  ngOnInit() {
    this.settingMenuItem = [
      {
        label: this.translateService.instant('SETTING.GENERAL'),
        icon: '',
        route: '/setting#property',
      },
      {
        label: this.translateService.instant('SETTING.PROPERTY'),
        icon: '',
        command: () => {
          this.router.navigate(['#property']);
        }
      },
    ]
  }
}
