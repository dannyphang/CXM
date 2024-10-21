import { Component, Input } from '@angular/core';
import { CompanyDto, ContactDto } from '../../services/common.service';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-asso-block',
  templateUrl: './association-block.component.html',
  styleUrl: './association-block.component.scss'
})
export class AssociationBlockComponent {
  @Input() module: 'CONT' | 'COMP' = 'CONT'
  @Input() contactProfile: ContactDto = new ContactDto();
  @Input() companyProfile: CompanyDto = new CompanyDto();

  constructor(
    private router: Router,
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
