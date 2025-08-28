import { Component, EventEmitter, Input, NgZone, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { E } from '@fullcalendar/core/internal-common';
import { EditorToolbarSetupDto } from '../../../services/components.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent {
  @Input() editorFormControl: FormControl = new FormControl();
  @Input() readOnly: boolean = false;
  @Input() placeholder: string = '';
  @Input() editorStyle: any = { height: '200px' };
  @Output() onTextChangeEmit: EventEmitter<number> = new EventEmitter<number>();
  @Input() set toolbarSetup(value: EditorToolbarSetupDto | undefined) {
    this.editorToolbarSetup = {
      ...this.defaultToolbarSetup,
      ...(value ?? {})
    };
  }

  defaultToolbarSetup: EditorToolbarSetupDto = {
    header: true,
    font: true,
    italic: true,
    bold: true,
    underline: true,
    color: true,
    backgroundColor: true,
    orderedList: true,
    bulletList: true,
    link: true,
    clean: true,
    blockquote: true,
    strike: true,
    align: true,
  };
  editorToolbarSetup: EditorToolbarSetupDto = {
    ...this.defaultToolbarSetup
  };

  constructor(
    private ngZone: NgZone,
  ) {
  }

  countTextLength(text: any) {
    this.ngZone.run(() => {
      this.onTextChangeEmit.emit(text.textValue.length);
    });
  }
}
