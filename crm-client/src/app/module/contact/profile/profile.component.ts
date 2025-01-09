import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { CommonService, PropertyGroupDto } from '../../../core/services/common.service';

@Component({
  selector: 'app-contact-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ContactProfileComponent implements OnInit {
  module: 'CONT' | 'COMP' = 'CONT';
  profileUid: any;
  propertiesList: PropertyGroupDto[] = [];
  isLoadingProperties: boolean = true;
  isLoadingContact: boolean = true;

  constructor(
    private router: Router,
    private commonService: CommonService,
    private activatedRoute: ActivatedRoute
  ) {
    if (this.activatedRoute.snapshot.queryParamMap) {
      this.profileUid = this.activatedRoute.snapshot.paramMap.get('id');
    }
  }

  ngOnInit(): void {

  }
}
