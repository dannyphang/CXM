import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as Blobity from 'blobity';
import { AuthService, TenantDto, UserDto, UserPermissionDto } from '../core/shared/services/auth.service';
import { OptionsModel } from '../core/shared/services/components.service';
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
    private router: Router
  ) {

  }

  ngOnInit() {
    this.initBlobity(false);
    this.authService.getCurrentUser().then(res => {
      if (res) {
        // this.authService.getUser(res.uid).subscribe(res2 => {
        //   if (res2.isSuccess) {
        //     this.user = res2.data;
        //     this.authService.getTenantsByUserId(this.user.uid).subscribe(res3 => {
        //       if (res3.isSuccess) {
        //         this.tenantList = res3.data;
        //         this.tenantOptionsList = this.tenantList.map(t => {
        //           return {
        //             label: t.tenantName,
        //             value: t.uid
        //           }
        //         });
        //       }
        //     });
        //     this.permission = this.authService.returnPermission(this.user.permission);
        //   }
        // })

        this.user = this.authService.userC;
        this.authService.getTenantsByUserId(this.user.uid).subscribe(res3 => {
          if (res3.isSuccess) {
            this.tenantList = res3.data;
            this.tenantOptionsList = this.tenantList.map(t => {
              return {
                label: t.tenantName,
                value: t.uid
              }
            });
          }
        });
        this.permission = this.authService.returnPermission(this.user.permission);
      }
      else {
        // this.router.navigate(['/signin'])
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

    }
  }

  blobityFunc(isOn: boolean) {
    this.initBlobity(isOn);
  }
}
