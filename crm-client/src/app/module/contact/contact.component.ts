import { Component } from '@angular/core';
import { ContactService } from '../../core/services/contact.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  constructor(
    private contactService: ContactService
  ) {
  }

  getContactBtn() {
    this.contactService.getAllContact().subscribe((res) => {
      console.log(res);
    });
  }

  getContactByIdBtn() {
    this.contactService.getContactById("6H5x7Fo1qfk7dgin2zLW").subscribe((res) => {
      console.log(res);
    });
  }
}
