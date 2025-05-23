import { Component } from '@angular/core';
import { CommonService } from '../../core/services/common.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrl: './callback.component.scss'
})
export class CallbackComponent {
  constructor(
    private commonService: CommonService,
    private toastService: ToastService,
  ) { }

  ngOnInit() {
    this.commonService.getParamsUrl().then((params) => {
      if (params.token) {
        console.log(window.location.origin)
        window.location.href = `${window.location.origin}`;
      }
    }).catch((error) => {
      this.toastService.addSingle({
        severity: 'error',
        message: error || 'Error occurred while processing the callback.'
      })
    });
  }
}
