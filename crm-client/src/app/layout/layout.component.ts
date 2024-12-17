import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as Blobity from 'blobity';
import { AuthService, TenantDto, UserDto } from '../core/services/auth.service';
import { OptionsModel } from '../core/services/components.service';
import { BaseCoreAbstract } from '../core/shared/base/base-core.abstract';
import { Message, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {
  user: UserDto;
  tenantList: TenantDto[] = [];
  tenantOptionsList: OptionsModel[] = [];

  constructor(
    private authService: AuthService,
    private translateService: TranslateService,
    private cdRef: ChangeDetectorRef,
    private toastService: ToastService
  ) {

  }

  ngOnInit() {
    // this.initBlobity(true);
    this.authService.initAuth();
    this.authService.getCurrentUser().then(res => {
      if (res) {
        this.authService.getUser(res.uid).subscribe(res2 => {
          if (res2.isSuccess) {
            this.user = res2.data;
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

            this.authService.getTenantsByUserId(this.user.uid).subscribe(res3 => {
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
          }
        })
      }
    })

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
