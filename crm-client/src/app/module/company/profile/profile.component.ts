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
  profileUid: any;

  constructor(
    private activatedRoute: ActivatedRoute
  ) {
    if (this.activatedRoute.snapshot.queryParamMap) {
      this.profileUid = this.activatedRoute.snapshot.paramMap.get('id');
    }
  }
}
