import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { CommonService, PropertyGroupDto } from '../../../core/services/common.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  @Input() module: 'CONT' | 'COMP' = 'CONT';
  profileId: any;
  propertiesList: PropertyGroupDto[] = [];
  isLoadingProperties: boolean = true;
  isLoadingContact: boolean = true;

  constructor(
    private router: Router,
    private commonService: CommonService,
    private activatedRoute: ActivatedRoute
  ) {
    if (this.activatedRoute.snapshot.queryParamMap) {
      this.profileId = this.activatedRoute.snapshot.paramMap.get('id');
    }
  }

  ngOnInit(): void {
    // this.commonService.getAllPropertiesByModule('CONT').subscribe((res) => {
    //   this.propertiesList = res;
    //   this.isLoadingProperties = false;
    // });
  }

  goToSetting() {
    const navigationExtras: NavigationExtras = {
      state: {
        data: this.propertiesList,
        // profile: 
      }
    };

    // navigate to setting page
    this.router.navigate(['contact/profile/' + this.profileId + '/setting'], navigationExtras);
  }

  btn() {
    // this.isBlocked = true;
    // this.commonService.getAllPropertiesByModule('CONT').subscribe((res) => {
    //   this.propertiesList = res;
    //   this.isBlocked = false;
    // });
  }
}
