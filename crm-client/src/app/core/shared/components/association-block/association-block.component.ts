import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonService, CompanyDto, ContactDto } from '../../../services/common.service';
import { NavigationExtras, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-asso-block',
  templateUrl: './association-block.component.html',
  styleUrl: './association-block.component.scss'
})
export class AssociationBlockComponent {
  @Input() module: 'CONT' | 'COMP' = 'CONT'
  @Input() contactProfile: ContactDto = new ContactDto(); // asso profile
  @Input() companyProfile: CompanyDto = new CompanyDto(); // asso profile
  @Input() profileUid: string;
  @Output() removeAssoEmit: EventEmitter<any> = new EventEmitter();

  isHover: boolean = false;

  actionMenu: MenuItem[] = [
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      command: () => {
        if (this.authService.returnPermissionObj(this.module, 'remove')) {
          this.toastService.addSingle({
            message: 'MESSAGE.REMOVING_ASSO',
            severity: 'info',
            isLoading: true
          })
          this.commonService.removeAsso(this.module, this.profileUid, this.module === 'COMP' ? this.contactProfile.uid : this.companyProfile.uid).subscribe(res => {
            if (res.isSuccess) {
              this.toastService.clear();
              this.toastService.addSingle({
                message: 'MESSAGE.REMOVING_SUCCESSFUL',
              })
              this.removeAssoEmit.emit();
            }
          });
        }
        else {
          // TODO
        }
      }
    }
  ]

  constructor(
    private router: Router,
    private commonService: CommonService,
    private toastService: ToastService,
    private authService: AuthService
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

  copy() {
    navigator.clipboard.writeText(this.module === 'CONT' ? this.companyProfile.companyEmail : this.contactProfile.contactEmail);
    this.toastService.addSingle({
      message: "MESSAGE.COPY_TEXT_DETAIL"
    });
  }
}
