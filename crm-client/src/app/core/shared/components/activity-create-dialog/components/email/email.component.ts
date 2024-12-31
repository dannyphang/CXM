import { Component, EventEmitter, Input, NgZone, Output, SimpleChanges } from '@angular/core';
import { ContactDto, CompanyDto } from '../../../../../services/common.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CONTROL_TYPE, FormConfig, OptionsModel } from '../../../../../services/components.service';
import { EmailDto } from '../../../../../services/activity.service';
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
  @Output() emailValueEmit: EventEmitter<EmailDto> = new EventEmitter<EmailDto>();

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

  assoContactFormConfig: FormConfig[] = [];
  assoCompanyFormConfig: FormConfig[] = [];
  assoCompanyForm: FormControl = new FormControl([]);
  assoContactForm: FormControl = new FormControl([]);
  assoCompanyList: OptionsModel[] = [];
  assoContactList: OptionsModel[] = [];

  constructor(
    private ngZone: NgZone,
    private coreHTTPService: CoreHttpService

  ) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contactProfile'] && changes['contactProfile'].currentValue) {
      this.setAssociation();
    }
    if (changes['companyProfile'] && changes['companyProfile'].currentValue) {
      this.setAssociation();
    }
  }

  ngOnInit() {
    this.initCreatForm();

    this.createEmailFormGroup.valueChanges.subscribe(change => {
      this.emailValueEmit.emit({
        toEmailUid: this.module === 'CONT' ? [this.contactProfile.uid] : [this.companyProfile.uid],
        toEmail: change.toEmail,
        fromEmail: change.fromEmail,
        subject: change.subject,
        content: this.editorFormControl.value,
        emailDateTime: new Date(),
        contactAssoList: this.assoContactForm.value,
        companyAssoList: this.assoCompanyForm.value
      });
    });

    this.editorFormControl.valueChanges.subscribe(change => {
      this.emailValueEmit.emit({
        toEmailUid: this.module === 'CONT' ? [this.contactProfile.uid] : [this.companyProfile.uid],
        toEmail: this.createEmailFormGroup.controls['toEmail'].value,
        fromEmail: this.createEmailFormGroup.controls['fromEmail'].value,
        subject: this.createEmailFormGroup.controls['subject'].value,
        content: change,
        emailDateTime: new Date(),
        contactAssoList: this.assoContactForm.value,
        companyAssoList: this.assoCompanyForm.value
      });
    });

    this.assoContactForm.valueChanges.subscribe(change => {
      this.emailValueEmit.emit({
        toEmailUid: this.module === 'CONT' ? [this.contactProfile.uid] : [this.companyProfile.uid],
        toEmail: this.createEmailFormGroup.controls['toEmail'].value,
        fromEmail: this.createEmailFormGroup.controls['fromEmail'].value,
        subject: this.createEmailFormGroup.controls['subject'].value,
        content: this.editorFormControl.value,
        emailDateTime: new Date(),
        contactAssoList: change,
        companyAssoList: this.assoCompanyForm.value
      });
    });

    this.assoCompanyForm.valueChanges.subscribe(change => {
      this.emailValueEmit.emit({
        toEmailUid: this.module === 'CONT' ? [this.contactProfile.uid] : [this.companyProfile.uid],
        toEmail: this.createEmailFormGroup.controls['toEmail'].value,
        fromEmail: this.createEmailFormGroup.controls['fromEmail'].value,
        subject: this.createEmailFormGroup.controls['subject'].value,
        content: this.editorFormControl.value,
        emailDateTime: new Date(),
        contactAssoList: this.assoContactForm.value,
        companyAssoList: change
      });
    });
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

    this.createEmailFormGroup.controls['fromEmail'].setValue(this.coreHTTPService.userC.email)
  }

  setAssociation() {
    this.assoCompanyList = [];
    this.assoContactList = [];

    // assign association 
    if (this.module === 'CONT' && this.contactProfile.association) {
      this.contactProfile.association.companyList.forEach(profile => {
        this.assoCompanyList.push({
          label: `${profile.companyName} (${profile.companyEmail})`,
          value: profile.uid
        });
      });

      this.assoContactList.push({
        label: `${this.contactProfile.contactFirstName} ${this.contactProfile.contactLastName} (${this.contactProfile.contactEmail})`,
        value: this.contactProfile.uid
      });
    }
    else if (this.module === 'COMP' && this.companyProfile.association) {
      this.companyProfile.association.contactList.forEach(profile => {
        this.assoContactList.push({
          label: `${profile.contactFirstName} ${profile.contactLastName}  (${profile.contactEmail})`,
          value: profile.uid
        });
      });

      this.assoCompanyList.push({
        label: `${this.companyProfile.companyName} (${this.companyProfile.companyEmail})`,
        value: this.companyProfile.uid
      });
    }

    this.assoContactFormConfig = [
      {
        id: '',
        type: CONTROL_TYPE.Multiselect,
        layoutDefine: {
          row: 0,
          column: 0
        },
        options: this.assoContactList,
        fieldControl: this.assoContactForm
      }
    ];

    this.assoCompanyFormConfig = [
      {
        id: '',
        type: CONTROL_TYPE.Multiselect,
        layoutDefine: {
          row: 0,
          column: 0
        },
        options: this.assoCompanyList,
        fieldControl: this.assoCompanyForm
      }
    ];

    if (this.module === 'CONT' && this.contactProfile.association) {
      this.assoContactForm.setValue([this.contactProfile.uid]);
      this.assoContactForm.disable();
    }
    else if (this.module === 'COMP' && this.companyProfile.association) {
      this.assoCompanyForm.setValue([this.companyProfile.uid]);
      this.assoCompanyForm.disable();
    }
  }
}
