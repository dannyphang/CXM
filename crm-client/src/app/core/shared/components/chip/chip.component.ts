import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { AttachmentDto } from '../../../services/common.service';
import { PreviewFile } from '@eternalheart/ngx-file-preview';
import { CoreAuthService } from '../../../services/core-auth.service';

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
  @Input() isReadable: boolean = true;
  @Output() remove = new EventEmitter();

  isShowDIalog: boolean = false;
  previewFile: PreviewFile;

  constructor(
    private coreAuthService: CoreAuthService,
  ) {
  }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['attachment'] && changes['attachment'].currentValue) {
      this.previewFile = {
        name: this.attachment.fileName,
        size: this.attachment.fileSize,
        type: 'image',
        url: this.attachment.url
      };

      console.log(this.previewFile)
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

  onShowPreview() {
    this.isShowDIalog = true;
    console.log(this.previewFile)
    console.log(this.file)
    console.log(this.attachment)
  }

  returnThemeMode(): 'dark' | 'light' {
    return this.coreAuthService.userC.setting.darkMode ? 'dark' : 'light';
  }
}
