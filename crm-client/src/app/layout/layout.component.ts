import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as Blobity from 'blobity';
import { AuthService } from '../core/services/auth.service';
import { OptionsModel } from '../core/services/components.service';
import { BaseCoreAbstract } from '../core/shared/base/base-core.abstract';
import { Message, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ToastService } from '../core/services/toast.service';
import { CoreHttpService, TenantDto, UserDto, UserPermissionDto } from '../core/services/core-http.service';
import { CommonService } from '../core/services/common.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {
  user: UserDto;
  tenantList: TenantDto[] = [];
  tenantOptionsList: OptionsModel[] = [];
  permission: UserPermissionDto[] = [];

  constructor(
    private authService: AuthService,
    private translateService: TranslateService,
    private commonService: CommonService,
    private cdRef: ChangeDetectorRef,
    private toastService: ToastService,
    private coreService: CoreHttpService,
    private router: Router
  ) {

  }

  ngOnInit() {
    this.onResize();

    // this.initBlobity(true);
    this.authService.initAuth().then(userC => {
      this.user = userC;
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
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.commonService.updateWindowSize();
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
