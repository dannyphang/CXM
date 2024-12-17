import { Component, Input } from '@angular/core';
import { CommonService, CompanyDto, ContactDto } from '../../../services/common.service';
import { NavigationExtras, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-asso-block',
  templateUrl: './association-block.component.html',
  styleUrl: './association-block.component.scss'
})
export class AssociationBlockComponent {
  @Input() module: 'CONT' | 'COMP' = 'CONT'
  @Input() contactProfile: ContactDto = new ContactDto();
  @Input() companyProfile: CompanyDto = new CompanyDto();

  isHover: boolean = false;

  actionMenu: MenuItem[] = [
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      command: () => {
        // this.commonService.delete

        // this.activityService.updateActivity({
        //   uid: this.activity.uid,
        //   statusId: 2
        // }).subscribe(res => {
        //   if (res.isSuccess) {
        //     this.toastService.addSingle({
        //       message: this.translateService.instant("MESSAGE.DELETED_SUCCESSFULLY", {
        //         module: this.translateService.instant(`ACTIVITY.MODULE.${this.activity.activityModuleCode}`)
        //       })
        //     })
        //     this.activityReload.emit();
        //   }
        //   else {
        //     this.toastService.addSingle({
        //       message: res.responseMessage,
        //       severity: 'error'
        //     });
        //   }
        // })
      }
    }
  ]

  constructor(
    private router: Router,
    private commonService: CommonService,
    private toastService: ToastService
  ) {

  }

  toProfile() {
    const navigationExtras: NavigationExtras = {
      state: {
        module: this.module
      }
    };

    if (this.module === 'CONT') {
      this.router.navigate(['company/profile/' + this.companyProfile.uid], navigationExtras);
    }
    else {
      this.router.navigate(['contact/profile/' + this.contactProfile.uid], navigationExtras);
    }
  }
}
