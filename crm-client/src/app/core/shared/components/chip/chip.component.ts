import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { AttachmentDto } from '../../../services/common.service';
import { CoreAuthService } from '../../../services/core-auth.service';
import { StorageService } from '../../../services/storage.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-chip',
  templateUrl: './chip.component.html',
  styleUrl: './chip.component.scss'
})
export class ChipComponent {
  @Input() label: string = '';
  @Input() removable: boolean = true;
  @Input() file: File;
  @Input() attachment: AttachmentDto;
  @Input() isFile: boolean = false;
  @Input() downloadable: boolean = true;
  @Output() remove = new EventEmitter();

  isShowDIalog: boolean = false;
  safeGoogleDocsUrl: any;

  constructor(
    private coreAuthService: CoreAuthService,
    private storageService: StorageService,
    public sanitizer: DomSanitizer,
    private toastService: ToastService
  ) {
  }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['attachment'] && changes['attachment'].currentValue) {

    }
  }

  onRemove() {
    if (this.isFile) {
      this.remove.emit(this.file);
    }
    else {
      this.remove.emit(this.attachment);
    }
  }

  previewFileClick() {
    if (this.downloadable && this.attachment?.url) {
      const link = document.createElement('a');
      if (this.attachment) {
        link.href = this.attachment.url;
        link.download = this.attachment.fileName || 'download'; // optional: custom filename
        link.target = '_blank'; // optional: opens in new tab
        link.click();
      }
    } else {
      this.toastService.addSingle({
        message: 'MESSAGE.FILE_NOT_READABLE_OR_PREVIEW',
        severity: 'error',
        key: 'filePreviewError'
      })
    }
  }
}
