import { Component, EventEmitter, HostListener, Input, Output, SimpleChanges } from '@angular/core';
import { ContactDto, CompanyDto, ModuleDto, WindowSizeDto, CommonService } from '../../../services/common.service';
import { ActivityService, CreateActivityDto, EmailDto } from '../../../services/activity.service';
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

  windowSize: WindowSizeDto = new WindowSizeDto();

  header: string = '';

  // email
  emailData: EmailDto = new EmailDto();

  constructor(
    private activityService: ActivityService,
    private toastService: ToastService,
    private commonService: CommonService
  ) {
    this.windowSize = this.commonService.windowSize;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.commonService.updateWindowSize();
    this.windowSize = this.commonService.windowSize;
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

  emailValueEmit(event: EmailDto) {
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
        let newActivity: CreateActivityDto = {
          activityModuleCode: this.activityModule.moduleCode,
          activityModuleSubCode: this.activityModule.moduleSubCode,
          activityModuleId: this.activityModule.uid,
          activityContactedIdList: this.emailData.toEmailUid,
          activityDatetime: this.emailData.emailDateTime,
          activityContent: this.emailData.content,
          associationContactUidList: this.emailData.contactAssoList,
          associationCompanyUidList: this.emailData.companyAssoList,
          activityType: {
            email: this.emailData
          }
        }
        this.activityService.sendEmail(this.emailData, newActivity).subscribe(res => {
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
