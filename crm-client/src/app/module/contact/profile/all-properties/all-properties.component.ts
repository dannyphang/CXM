import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonService, ContactDto, PropertyGroupDto } from '../../../../core/shared/services/common.service';
import { Router } from '@angular/router';
import { UserPermissionDto } from '../../../../core/shared/services/auth.service';

@Component({
  selector: 'app-contact-all-properties',
  templateUrl: './all-properties.component.html',
  styleUrl: './all-properties.component.scss'
})
export class ContactAllPropertiesComponent implements OnChanges {
  @Input() module: 'CONT' | 'COMP' = 'CONT';

  propertiesList: PropertyGroupDto[] = [];
  contactProfile: ContactDto = new ContactDto();
  permission: UserPermissionDto[] = [];

  constructor(
    private commonService: CommonService,
    private router: Router,
  ) {

  }

  ngOnInit() {
    if (window.history.state.data) {
      this.propertiesList = window.history.state.data;
    }
    if (window.history.state.profile) {
      this.contactProfile = window.history.state.profile;
    }
    if (window.history.state.permission) {
      this.permission = window.history.state.permission;
    }

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['propertiesList'] && changes['propertiesList'].currentValue) {
      this.propertiesList = changes['propertiesList'].currentValue;
    }
  }
}
