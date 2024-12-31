import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ContactDto, CompanyDto, ModuleDto } from '../../../services/common.service';
import { ActivityService, SendEmailDto } from '../../../services/activity.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-activity-create-dialog',
  templateUrl: './activity-create-dialog.component.html',
  styleUrl: './activity-create-dialog.component.scss'
})
export class ActivityCreateDialogComponent {
  @Input() contactProfile: ContactDto = new ContactDto();
  @Input() companyProfile: CompanyDto = new CompanyDto();
  @Input() module: "CONT" | "COMP" = "CONT";
  @Input() activityModule: ModuleDto = new ModuleDto();
  @Input() visible: boolean = false;
  @Output() close: EventEmitter<any> = new EventEmitter();
  header: string = '';

  // email
  emailData: SendEmailDto = new SendEmailDto();

  constructor(
    private activityService: ActivityService,
    private toastService: ToastService
  ) {

  }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['activityModule'] && changes['activityModule'].currentValue) {
      this.header = this.activityModule.moduleName;
    }
  }

  closeDialog() {
    this.visible = false;
    this.close.emit();
  }

  emailValueEmit(event: SendEmailDto) {
    this.emailData = event;
  }

  send() {
    switch (this.activityModule.moduleSubCode) {
      case 'EMAIL':
        this.toastService.addSingle({
          message: 'MESSAGE.SENDING_EMAIL',
          isLoading: true,
          severity: 'info'
        })
        this.activityService.sendEmail(this.emailData, this.activityModule).subscribe(res => {
          this.toastService.clear();
          if (res.isSuccess) {
            this.closeDialog()
          }
          this.toastService.addSingle({
            message: res.responseMessage,
            severity: res.isSuccess ? 'success' : 'error'
          });
        })
        break;
    }
  }
}
