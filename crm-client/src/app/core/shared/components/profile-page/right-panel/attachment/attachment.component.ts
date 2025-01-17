import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ContactDto, CompanyDto, CommonService, AttachmentDto } from '../../../../../services/common.service';
import { ActivityDto, ActivityService } from '../../../../../services/activity.service';
import { AuthService } from '../../../../../services/auth.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-attachment',
  templateUrl: './attachment.component.html',
  styleUrl: './attachment.component.scss'
})
export class AttachmentComponent {
  @Input() module: 'CONT' | 'COMP' = 'CONT';
  @Input() contactProfile: ContactDto = new ContactDto();
  @Input() companyProfile: CompanyDto = new CompanyDto();
  @Input() activitiesList: ActivityDto[] = [];
  @Output() updateAttachmentEmit: EventEmitter<any> = new EventEmitter();

  attachPanelExpand: boolean = false;
  attachmentList: AttachmentDto[] = [];

  constructor(
    private commonService: CommonService,
    private activityService: ActivityService,
    private authService: AuthService,
    private toastService: ToastService
  ) {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['contactProfile'] && changes['contactProfile'].currentValue) {
      this.getAttachments();
    }
    if (changes['companyProfile'] && changes['companyProfile'].currentValue) {
      this.getAttachments();
    }
    if (changes['activitiesList'] && changes['activitiesList'].currentValue) {
      this.getAttachments();
    }

  }

  openSidebar() {

  }

  getAttachments() {
    if (this.contactProfile || this.companyProfile) {
      this.activityService.getAttachments(this.module, this.module === 'CONT' ? this.contactProfile.uid : this.companyProfile.uid).subscribe(res => {
        if (res.isSuccess) {
          this.attachmentList = res.data;

          if (res.data?.length > 0) {
            this.attachPanelExpand = true;
          }
        }
      });
    }
  }

  returnFileSize(bytes: number = 0, decimals: number = 2) {
    return this.commonService.returnFileSize(bytes, decimals);
  }

  removeFile(file: AttachmentDto) {
    if (this.authService.returnPermissionObj(this.module, 'remove')) {
      this.activityService.removeAttachments([file]).subscribe(res => {
        if (res.isSuccess) {
          this.updateAttachmentEmit.emit();
        }
      })
    }
    else {
      // TODO
    }
  }
}
