import { Component, Input, SimpleChanges } from '@angular/core';
import { AttachmentDto } from '../../../services/common.service';
import { PreviewFile } from '@eternalheart/ngx-file-preview';
import { CoreAuthService } from '../../../services/core-auth.service';
import { StorageService } from '../../../services/storage.service';

@Component({
  selector: 'app-attachment-chip',
  templateUrl: './attachment-chip.component.html',
  styleUrl: './attachment-chip.component.scss'
})
export class AttachmentChipComponent {
  @Input() attachmentList: AttachmentDto[] = [];

  previewFileList: PreviewFile[] = [];

  constructor(
    private coreAuthService: CoreAuthService,
    private storageService: StorageService
  ) {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['attachmentList'] && changes['attachmentList'].currentValue) {
      this.previewFileList = this.attachmentList.map((attachment) => {
        return {
          name: attachment.fileName,
          size: attachment.fileSize,
          type: this.storageService.mapMimeTypeToPreviewType(attachment.fileType),
          url: attachment.url
        };
      });
    }
  }

  returnFileName(file: any) {
    console.log(file);
    if (file && file.name) {
      return file.name;
    }
    return '';
  }

  onFileSelect(event: any) {
    console.log(event)
  }
}
