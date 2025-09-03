import { ChangeDetectorRef, Component, HostListener, ViewChild, viewChild, ViewContainerRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { CommonService } from './core/services/common.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'component-portal';

  constructor(
    private translateService: TranslateService,
    private commonService: CommonService,
  ) {
    this.translateService.use('en');
  }

  ngOnInit() {
    this.onResize();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.commonService.updateWindowSize();
  }
}
