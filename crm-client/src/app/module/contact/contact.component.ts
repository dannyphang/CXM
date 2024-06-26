import { Component } from '@angular/core';
import { CommonService } from '../../core/services/common.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  constructor(
    private commonService: CommonService
  ) {
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
}
