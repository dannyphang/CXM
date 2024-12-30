import { Component, EventEmitter, Input, NgZone, Output } from '@angular/core';
import { ContactDto, CompanyDto } from '../../../../../services/common.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CONTROL_TYPE, FormConfig, OptionsModel } from '../../../../../services/components.service';
import { SendEmailDto } from '../../../../../services/activity.service';
import { CoreHttpService } from '../../../../../services/core-http.service';

@Component({
  selector: 'app-email',
  templateUrl: './email.component.html',
  styleUrl: './email.component.scss'
})
export class EmailComponent {
  @Input() contactProfile: ContactDto = new ContactDto();
  @Input() companyProfile: CompanyDto = new CompanyDto();
  @Input() module: "CONT" | "COMP" = "CONT";
  @Output() emailValueEmit: EventEmitter<SendEmailDto> = new EventEmitter<SendEmailDto>();
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
    private coreHTTPService: CoreHttpService

  ) {

  }

  ngOnInit() {
    this.initCreatForm();

    this.createEmailFormGroup.valueChanges.subscribe(change => {
      this.emailValueEmit.emit({
        toEmailUid: this.module === 'CONT' ? [this.contactProfile.contactEmail] : [this.companyProfile.companyEmail],
        toEmail: change.toEmail,
        fromEmail: change.fromEmail,
        subject: change.subject,
        content: this.editorFormControl.value,
        emailDateTime: new Date(),
      });
    });

    this.editorFormControl.valueChanges.subscribe(change => {
      this.emailValueEmit.emit({
        toEmailUid: this.module === 'CONT' ? [this.contactProfile.contactEmail] : [this.companyProfile.companyEmail],
        toEmail: this.createEmailFormGroup.controls['toEmail'].value,
        fromEmail: this.createEmailFormGroup.controls['fromEmail'].value,
        subject: this.createEmailFormGroup.controls['subject'].value,
        content: change,
        emailDateTime: new Date(),
      });
    })
  }

  initCreatForm() {
    let emailList: OptionsModel[] = [
      {
        label: this.module === 'CONT' ? this.contactProfile.contactEmail : this.companyProfile.companyEmail,
        value: this.module === 'CONT' ? this.contactProfile.contactEmail : this.companyProfile.companyEmail,
      }
    ]
    this.createEmailFormConfig = [
      {
        label: 'INPUT.TO',
        fieldControl: this.createEmailFormGroup.controls['toEmail'],
        type: CONTROL_TYPE.Multiselect,
        layoutDefine: {
          row: 0,
          column: 0
        },
        options: emailList
      },
      {
        label: 'INPUT.FROM',
        fieldControl: this.createEmailFormGroup.controls['fromEmail'],
        type: CONTROL_TYPE.Textbox,
        layoutDefine: {
          row: 0,
          column: 1
        },
        mode: 'email',
        disabled: true,
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
    ];

    this.createEmailFormGroup.controls['fromEmail'].setValue(this.coreHTTPService.userC.email, { emitEvent: false })
  }
}
