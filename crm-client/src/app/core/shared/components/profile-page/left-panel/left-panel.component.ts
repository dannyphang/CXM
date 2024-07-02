import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ModulePropertiesDto } from '../../../../services/common.service';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-left-panel',
  templateUrl: './left-panel.component.html',
  styleUrl: './left-panel.component.scss'
})
export class LeftPanelComponent implements OnChanges {
  @Input() propertiesList: ModulePropertiesDto[] = [];
  @Input() module: 'CONT' | 'COMP' = 'CONT';
  @Input() profileId: any;
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
        this.router.navigate(['contact/profile/' + this.profileId + '/allProperties'], navigationExtras);
      }
    }
  ];

  constructor(
    private router: Router,
  ) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['propertiesList'] && changes['propertiesList'].currentValue) {
      this.propertiesList = changes['propertiesList'].currentValue;
    }
  }
}
