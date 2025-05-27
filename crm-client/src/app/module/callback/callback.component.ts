import { Component } from '@angular/core';
import { CommonService } from '../../core/services/common.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { CoreAuthService } from '../../core/services/core-auth.service';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrl: './callback.component.scss'
})
export class CallbackComponent {
  constructor(
    private commonService: CommonService,
    private toastService: ToastService,
    private authService: AuthService,
    private coreAuthService: CoreAuthService
  ) { }

  ngOnInit() {
    this.commonService.getParamsUrl().then((params) => {
      if (params.module === 'calendar') {
        window.location.href = `${window.location.origin}?calendarEmail=${params.calendarEmail}`;
      }
      else if (params.token) {
        console.log(window.location.origin)
        window.location.href = `${window.location.origin}`;
      }
    }).catch((error) => {
      console.error('Error getting URL parameters:', error);
      this.toastService.addSingle({
        severity: 'error',
        message: error || 'Error occurred while processing the callback.'
      })
    });
  }
}
