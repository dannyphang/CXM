import { Component, EventEmitter, HostListener, Input, NgZone, Output, SimpleChanges } from '@angular/core';
import { ContactDto, CompanyDto, ModuleDto, WindowSizeDto, CommonService, AttachmentDto } from '../../../services/common.service';
import { ActivityService, CreateActivityDto, EmailDto } from '../../../services/activity.service';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../../../services/auth.service';
import { CoreAuthService } from '../../../services/core-auth.service';

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

  // note
  noteData: CreateActivityDto = new CreateActivityDto();
  attachmentList: File[] = [];

  //meet
  meetData: CreateActivityDto = new CreateActivityDto();

  contentLength: number = 0;

  constructor(
    private activityService: ActivityService,
    private toastService: ToastService,
    private commonService: CommonService,
    private authService: AuthService,
    private coreAuthService: CoreAuthService,
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

  noteValueEmit(event: CreateActivityDto) {
    this.noteData = event;
  }

  meetValueEmit(event: CreateActivityDto) {
    this.meetData = event;
  }

  attachmentEmit(event: File[]) {
    this.attachmentList = event;
  }

  send() {
    switch (this.activityModule.moduleSubCode) {
      case 'EMAIL':
        if (this.authService.returnPermissionObj(this.module, 'create')) {
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
            activityContentLength: this.contentLength,
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
          });
        }
        else {
          // TODO
        }
        break;
      case 'NOTE':
        if (this.authService.returnPermissionObj(this.module, 'create')) {
          this.toastService.addSingle({
            key: 'activity',
            message: 'MESSAGE.CREATING_ACTIVITY',
            isLoading: true,
            severity: 'info'
          });
          this.activityService.createActivity([this.noteData]).subscribe(res => {
            if (res.isSuccess) {
              if (this.attachmentList.length > 0) {
                this.attachmentList.forEach(file => {
                  this.commonService.uploadFile(file, "Activity").subscribe(res2 => {
                    if (res2.isSuccess) {
                      let uploadAttach: AttachmentDto = {
                        activityUid: res.data[0].uid!,
                        folderName: "Activity",
                        fileName: res2.data.metadata.name,
                        fullPath: res2.data.metadata.fullPath,
                        fileSize: res2.data.metadata.size,
                        contactUid: this.noteData.associationContactUidList ?? [],
                        companyUid: this.noteData.associationCompanyUidList ?? [],
                        url: res2.data.downloadUrl,
                        fileType: res2.data.metadata.contentType,
                      }

                      this.activityService.uploadAttachment([uploadAttach]).subscribe(res3 => {
                        if (res3.isSuccess) {
                          this.activityService.updateActivity([{
                            uid: res3.data[0].activityUid,
                            attachmentUid: this.returnAttactmentList(res.data[0].attachmentUid, res3.data[0].uid),
                          }]).subscribe(
                            {
                              next: res4 => {
                                if (res4.isSuccess) {
                                  this.toastService.clear('activity');
                                  this.closeDialog();
                                }
                                else {
                                  this.toastService.addSingle({
                                    message: res4.responseMessage,
                                    severity: 'error'
                                  });
                                }
                              },
                              error: err => {
                                this.toastService.addSingle({
                                  message: err,
                                  severity: 'error'
                                });
                              }
                            }
                          )
                        }
                        else {
                          this.toastService.addSingle({
                            message: res.responseMessage,
                            severity: 'error'
                          });
                        }
                      });
                    }
                    else {
                      this.toastService.addSingle({
                        key: 'error',
                        message: res.responseMessage,
                        severity: 'error'
                      });
                    }
                  });
                });
              }
              else {
                this.toastService.clear('activity');
                this.closeDialog();
              }
            }
            else {
              this.toastService.addSingle({
                message: res.responseMessage,
                severity: 'error'
              });
            }
          });
        }
        else {
          // TODO
        }
        break;
      case 'MEET':
        console.log(this.meetData);
        if (this.authService.returnPermissionObj(this.module, 'create')) {
          this.toastService.addSingle({
            message: 'MESSAGE.CREATING_MEETING',
            isLoading: true,
            severity: 'info',
            key: 'creating_meeting',
          })
          let newActivity: CreateActivityDto = {
            activityModuleCode: this.activityModule.moduleCode,
            activityModuleSubCode: this.activityModule.moduleSubCode,
            activityModuleId: this.activityModule.uid,
            activityContactedIdList: this.meetData.activityContactedIdList,
            // activityDatetime: this.emailData.emailDateTime,
            activityContent: '',
            activityContentLength: 0,
            associationContactUidList: this.meetData.associationContactUidList,
            associationCompanyUidList: this.meetData.associationCompanyUidList,
            activityType: {
              meeting: this.meetData.activityType.meeting
            }
          }
          this.activityService.createMeeting(newActivity, this.coreAuthService.userC.setting.calendarEmail).subscribe(res => {
            this.toastService.clear('creating_meeting');
            if (res.isSuccess) {
              this.closeDialog()
            }
            this.toastService.addSingle({
              message: res.responseMessage,
              severity: res.isSuccess ? 'success' : 'error'
            });
          });
        }
        else {
          // TODO
        }
        break;
    }
  }

  returnAttactmentList(attactmentList: string[], attachmentUid: string | undefined): string[] {
    if (!attachmentUid) {
      this.toastService.addSingle({
        message: 'ERROR.ATTACHMENT_UPDATE_ERROR',
        severity: 'error'
      });
    }
    else {
      if (!attactmentList.find(s => s === attachmentUid)) {
        attactmentList.push(attachmentUid);
        return attactmentList;
      }
    }
    return [];
  }
}
