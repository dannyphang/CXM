import { Component } from '@angular/core';
import { CommonService, ContactDto } from '../../core/services/common.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  profileId: string = "6H5x7Fo1qfk7dgin2zLW";
  module: 'CONT' | 'COMP' = 'CONT';
  contactList: ContactDto[] = []

  constructor(
    private commonService: CommonService,
    private router: Router,
  ) {
  }

  ngOnInit() {
    this.commonService.getAllContact().subscribe((res) => {
      this.contactList = res;
    })
  }

  getContactBtn() {
    this.commonService.getAllContact().subscribe((res) => {
      console.log(res);
    });
  }

  getContactByIdBtn() {
    this.commonService.getContactById("6H5x7Fo1qfk7dgin2zLW").subscribe((res) => {
      console.log(res);
    });
  }

  getAllPropertiesBtn() {
    this.commonService.getAllPropertiesByModule("CONT").subscribe((res) => {
      console.log(res);
    });
  }

  toProfile() {
    this.router.navigate(['contact/profile/' + this.profileId])
  }
}
