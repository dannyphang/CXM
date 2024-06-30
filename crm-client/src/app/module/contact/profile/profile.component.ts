import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService, ModulePropertiesDto } from '../../../core/services/common.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  profileId: any;
  propertiesList: ModulePropertiesDto[] = [];

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
    this.commonService.getAllPropertiesByModule('CONT').subscribe((res) => {

    });
  }

  goToSetting() {
    // navigate to setting page
    this.router.navigate(['contact/profile/' + this.profileId + '/setting'])
  }

  btn() {
    this.commonService.getAllPropertiesByModule('CONT').subscribe((res) => {
      this.propertiesList = res;
      console.log(this.propertiesList);
    });
  }
}
