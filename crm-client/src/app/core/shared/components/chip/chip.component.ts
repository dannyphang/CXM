import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { AttachmentDto } from '../../../services/common.service';
import { PreviewEvent, PreviewFile } from '@eternalheart/ngx-file-preview';
import { CoreAuthService } from '../../../services/core-auth.service';
import { StorageService } from '../../../services/storage.service';

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
    private storageService: StorageService
  ) {
  }

  ngOnInit() {
    if (this.file || this.attachment) {
      this.previewFile = {
        name: this.attachment?.fileName ?? this.file?.name,
        size: this.attachment?.fileSize ?? this.file?.size,
        type: this.storageService.mapMimeTypeToPreviewType(this.attachment?.fileType ?? this.file?.type),
        url: this.attachment?.url,
      };
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['attachment'] && changes['attachment'].currentValue) {

    }
  }

  onRemove() {
    this.previewFile = null;
    if (this.isFile) {
      this.remove.emit(this.file);
    }
    else {
      this.remove.emit(this.attachment);
    }
  }

  returnThemeMode(): 'dark' | 'light' {
    return this.coreAuthService.userC.setting.darkMode ? 'dark' : 'light';
  }

  handlePreviewEvent(event: PreviewEvent) {
    console.log(event);
    const { type, message, event: targetEvent } = event;
    if (type === "error") {
      console.log(message); // Handle error event
    }
    if (type === "select") {
      console.log(targetEvent); // Handle file selection event
    }
  }
}
