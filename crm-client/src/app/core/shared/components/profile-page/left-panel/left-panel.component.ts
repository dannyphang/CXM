import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ContactDto, PropertyGroupDto } from '../../../../services/common.service';
import { NavigationExtras, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-left-panel',
  templateUrl: './left-panel.component.html',
  styleUrl: './left-panel.component.scss'
})
export class LeftPanelComponent implements OnChanges {
  @Input() propertiesList: PropertyGroupDto[] = [];
  @Input() module: 'CONT' | 'COMP' = 'CONT';
  @Input() contactProfile: ContactDto = new ContactDto();
  actionMenu: any[] = [
    {
      label: 'View all properties',
      icon: '',
      command: () => {
        const navigationExtras: NavigationExtras = {
          state: {
            data: this.propertiesList
          }
        };

        // navigate to setting page
        this.router.navigate(['contact/profile/' + this.contactProfile.uid + '/allProperties'], navigationExtras);
      }
    }
  ];

  constructor(
    private router: Router,
    private messageService: MessageService
  ) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['propertiesList'] && changes['propertiesList'].currentValue) {
      this.propertiesList = changes['propertiesList'].currentValue;
    }
  }

  copyEmailToClipboard(copiedText: string) {
    navigator.clipboard.writeText(copiedText);
    this.messageService.add({ severity: 'success', summary: 'Copy text', detail: 'Successful copied text' });
  }


}
