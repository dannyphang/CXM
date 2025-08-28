import { ChangeDetectorRef, Component, ViewChild, viewChild, ViewContainerRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'component-portal';

  constructor(
    private translateService: TranslateService,
  ) {
    this.translateService.use('en');
  }
}
