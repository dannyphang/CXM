import { Component, Input, NgZone } from '@angular/core';
import { ContactDto, CompanyDto } from '../../../../../services/common.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CONTROL_TYPE, FormConfig } from '../../../../../services/components.service';

@Component({
  selector: 'app-email',
  templateUrl: './email.component.html',
  styleUrl: './email.component.scss'
})
export class EmailComponent {
  @Input() contactProfile: ContactDto = new ContactDto();
  @Input() companyProfile: CompanyDto = new CompanyDto();
  @Input() module: "CONT" | "COMP" = "CONT";
  createEmailFormGroup: FormGroup = new FormGroup({
    toEmail: new FormControl([], Validators.required),
    fromEmail: new FormControl('', Validators.required),
    subject: new FormControl(''),
  });
  createEmailFormConfig: FormConfig[] = [];
  editorFormControl: FormControl = new FormControl(null, Validators.required);
  contentWordLength: number = 0;

  countTextLength(text: any) {
    this.ngZone.run(() => {
      this.contentWordLength = text.textValue.length;
    });
  }

  constructor(
    private ngZone: NgZone,

  ) {

  }

  ngOnInit() {
    this.initCreatForm();
  }

  initCreatForm() {
    this.createEmailFormConfig = [
      {
        label: 'INPUT.TO',
        fieldControl: this.createEmailFormGroup.controls['toEmail'],
        type: CONTROL_TYPE.Textbox,
        layoutDefine: {
          row: 0,
          column: 0
        },
        mode: 'chips',
        seperator: ' '
      },
      {
        label: 'INPUT.FROM',
        fieldControl: this.createEmailFormGroup.controls['fromEmail'],
        type: CONTROL_TYPE.Textbox,
        layoutDefine: {
          row: 0,
          column: 1
        },
        mode: 'email'
      },
      {
        label: 'INPUT.SUBJECT',
        fieldControl: this.createEmailFormGroup.controls['subject'],
        type: CONTROL_TYPE.Textbox,
        layoutDefine: {
          row: 1,
          column: 0
        },
      },
    ]
  }
}
