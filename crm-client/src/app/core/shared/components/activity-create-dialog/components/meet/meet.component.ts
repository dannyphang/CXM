import { Component, EventEmitter, Input, NgZone, Output, SimpleChanges } from '@angular/core';
import { ContactDto, CompanyDto, ModuleDto } from '../../../../../services/common.service';
import { CONTROL_TYPE, FormConfig, OptionsModel } from '../../../../../services/components.service';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CreateActivityDto, MeetingDto } from '../../../../../services/activity.service';
import { CoreAuthService } from '../../../../../services/core-auth.service';
import { ReminderTypeEnum } from '../../../../constants/property.constant';

@Component({
  selector: 'app-meet',
  templateUrl: './meet.component.html',
  styleUrl: './meet.component.scss'
})
export class MeetComponent {
  @Input() contactProfile: ContactDto = new ContactDto();
  @Input() companyProfile: CompanyDto = new CompanyDto();
  @Input() module: "CONT" | "COMP" = "CONT";
  @Input() activityModule: ModuleDto = new ModuleDto();
  @Output() meetValueEmit: EventEmitter<CreateActivityDto> = new EventEmitter<CreateActivityDto>();

  meetFormConfig: FormConfig[] = [];
  meetFormGroup: FormGroup = new FormGroup({
    subject: new FormControl(''),
    organizer: new FormControl(''),
    start: new FormControl(new Date()),
    end: new FormControl(this.increasedEndTime()),
    location: new FormControl(''),
    description: new FormControl(''),
    internalNotes: new FormControl(''),
    attendees: new FormControl<string[]>([]),
    association: new FormGroup({
      contact: new FormControl<string[]>([]),
      company: new FormControl<string[]>([]),
    }),
    module: new FormControl(this.module),
    reminder: new FormControl(0),
    reminderType: new FormControl(1),
  });
  reminderTypes: OptionsModel[] = [
    {
      label: 'INPUT.MINUTES',
      value: ReminderTypeEnum.Minutes
    },
    {
      label: 'INPUT.HOURS',
      value: ReminderTypeEnum.Hours
    },
    {
      label: 'INPUT.DAYS',
      value: ReminderTypeEnum.Days
    },
    {
      label: 'INPUT.WEEKS',
      value: ReminderTypeEnum.Weeks
    }
  ];
  tempEvent: {
    startTime: Date;
    endTime: Date;
    subject?: string;
  } = {
      startTime: new Date(),
      endTime: this.increasedEndTime(),
      subject: ''
    };
  assoContactFormConfig: FormConfig[] = [];
  assoCompanyFormConfig: FormConfig[] = [];
  assoCompanyList: OptionsModel[] = [];
  assoContactList: OptionsModel[] = [];
  descriptionWordLength: number = 0;

  constructor(
    private translateService: TranslateService,
    private coreAuthService: CoreAuthService,
    private ngZone: NgZone,
  ) {

  }

  ngOnChanges(changes: SimpleChanges) {

  }

  ngOnInit() {
    this.initMeetFormConfig();
    this.setAssociation();
    this.meetFormGroup.valueChanges.subscribe(change => {
      this.tempEvent = {
        startTime: this.meetFormGroup.controls['start'].value,
        endTime: this.meetFormGroup.controls['end'].value,
        subject: this.meetFormGroup.controls['subject'].value,
      };
      this.sendEmit();
    });
  }

  increasedEndTime(): Date {
    let time = new Date();
    let endTime = time.setMinutes(time.getMinutes() + 30);
    return new Date(endTime);
  }

  formUpdate(form: any) {
    this.meetFormGroup.controls['start'].setValue(form.startTime);
    this.meetFormGroup.controls['end'].setValue(form.endTime);
  }

  initMeetFormConfig() {
    this.meetFormConfig = [
      {
        label: 'INPUT.TITLE',
        type: CONTROL_TYPE.Textbox,
        fieldControl: this.meetFormGroup.controls['subject'],
        required: true,
        layoutDefine: {
          row: 0,
          column: 0
        }
      },
      {
        label: 'INPUT.START_TIME',
        type: CONTROL_TYPE.Calendar,
        fieldControl: this.meetFormGroup.controls['start'],
        required: true,
        layoutDefine: {
          row: 1,
          column: 0
        },
        showTime: true,
      },
      {
        label: 'INPUT.END_TIME',
        type: CONTROL_TYPE.Calendar,
        fieldControl: this.meetFormGroup.controls['end'],
        required: true,
        layoutDefine: {
          row: 1,
          column: 1
        },
        showTime: true,
      },
      {
        label: 'INPUT.ORGANIZATER',
        type: CONTROL_TYPE.Textbox,
        fieldControl: this.meetFormGroup.controls['organizer'],
        required: true,
        layoutDefine: {
          row: 2,
          column: 0
        }
      },
      {
        label: 'INPUT.ATTENDEES',
        type: CONTROL_TYPE.Multiselect,
        fieldControl: this.meetFormGroup.controls['attendees'],
        options: this.getAttendeeList(),
        layoutDefine: {
          row: 2,
          column: 1
        }
      },
      {
        label: 'INPUT.LOCATION',
        type: CONTROL_TYPE.Textbox,
        fieldControl: this.meetFormGroup.controls['location'],
        layoutDefine: {
          row: 3,
          column: 0
        }
      },
      {
        type: CONTROL_TYPE.Html,
        dynamicHTML: `<label>${this.translateService.instant('INPUT.REMINDER')}</label>`,
        layoutDefine: {
          row: 4,
          column: 0
        }
      },
      {
        type: CONTROL_TYPE.Textbox,
        fieldControl: this.meetFormGroup.controls['reminder'],
        layoutDefine: {
          row: 5,
          column: 0,
          colSpan: 2
        },
        mode: 'number',
        useGrouping: false,
        min: 0,
        minFractionDigits: 0,
        maxFractionDigits: 0,
      },
      {
        type: CONTROL_TYPE.Dropdown,
        fieldControl: this.meetFormGroup.controls['reminderType'],
        layoutDefine: {
          row: 5,
          column: 1,
          colSpan: 3
        },
        options: this.reminderTypes,
      },
    ];

    this.meetFormGroup.controls['organizer'].setValue(this.coreAuthService.userC.email, { emitEvent: false });
    this.meetFormGroup.controls['organizer'].disable();
  }

  setAssociation() {
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
        fieldControl: this.meetFormGroup.controls['attendees']
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
        fieldControl: this.meetFormGroup.controls['association'].get('company'),
      }
    ];

    if (this.module === 'CONT' && this.contactProfile.association) {
      this.meetFormGroup.controls['attendees'].setValue([this.contactProfile.uid]);
      this.meetFormGroup.controls['attendees'].disable();
    }
    else if (this.module === 'COMP' && this.companyProfile.association) {
      this.meetFormGroup.controls['association'].get('company').setValue([this.companyProfile.uid]);
      this.meetFormGroup.controls['association'].get('company').disable();
    }

    this.meetFormGroup.controls['attendees'].valueChanges.subscribe(val => {
      this.sendEmit();
    });

    this.meetFormGroup.controls['association'].get('company').valueChanges.subscribe(val => {
      this.sendEmit();
    });
  }

  getAttendeeList(): OptionsModel[] {
    if (this.module === 'COMP') {
      let contactList: OptionsModel[] = [];
      this.companyProfile.association?.contactList.forEach(profile => {
        contactList.push({
          label: `${profile.contactFirstName} ${profile.contactLastName}  (${profile.contactEmail})`,
          value: profile.uid
        });
      });

      return contactList;
    }
    else if (this.module === 'CONT') {
      return [
        {
          label: `${this.contactProfile.contactFirstName} ${this.contactProfile.contactLastName} (${this.contactProfile.contactEmail})`,
          value: this.contactProfile.uid
        }
      ];
    }

    return [];
  }

  sendEmit() {
    let meet: CreateActivityDto = {
      activityModuleCode: this.activityModule.moduleCode,
      activityModuleSubCode: this.activityModule.moduleSubCode,
      activityContent: this.meetFormGroup.controls['description'].value,
      activityContentLength: this.descriptionWordLength,
      activityDatetime: this.meetFormGroup.controls['start'].value,
      activityContactedIdList: this.meetFormGroup.controls['attendees'].value || [],
      activityModuleId: this.activityModule.moduleId,
      associationContactUidList: this.meetFormGroup.controls['attendees'].value || [],
      associationCompanyUidList: this.meetFormGroup.controls['association'].get('company')?.value || [],
      activityType: {
        meeting: {
          subject: this.meetFormGroup.controls['subject'].value,
          organizer: this.meetFormGroup.controls['organizer'].value,
          location: this.meetFormGroup.controls['location'].value,
          internalNotes: this.meetFormGroup.controls['internalNotes'].value,
          reminder: this.meetFormGroup.controls['reminder'].value,
          reminderType: this.meetFormGroup.controls['reminderType'].value,
          start: this.meetFormGroup.controls['start'].value,
          end: this.meetFormGroup.controls['end'].value
        }
      }
    };
    this.meetValueEmit.emit(meet);
  }

  returnFormControl(controlName: string): FormControl {
    return this.meetFormGroup.controls[controlName] as FormControl;
  }

  countTextLength(text: any) {
    this.ngZone.run(() => {
      this.descriptionWordLength = text.textValue.length;
    });
  }
}