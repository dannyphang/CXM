import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-contact-company-page',
  templateUrl: './contact-company-page.component.html',
  styleUrl: './contact-company-page.component.scss'
})
export class ContactCompanyPageComponent {
  @Input() module: 'CONT' | 'COMP' = 'CONT';
}
