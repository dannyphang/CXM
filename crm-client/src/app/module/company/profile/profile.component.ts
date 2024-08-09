import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PropertyGroupDto, CommonService } from '../../../core/services/common.service';

@Component({
  selector: 'app-company-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class CompanyProfileComponent {
  module: 'CONT' | 'COMP' = 'COMP';
  profileId: any;
  propertiesList: PropertyGroupDto[] = [];
  isLoadingProperties: boolean = true;
  isLoadingContact: boolean = true;

  constructor(
    private router: Router,
    private commonService: CommonService,
    private activatedRoute: ActivatedRoute
  ) {
    console.log(this.module)
    if (this.activatedRoute.snapshot.queryParamMap) {
      this.profileId = this.activatedRoute.snapshot.paramMap.get('id');
    }
  }
}
