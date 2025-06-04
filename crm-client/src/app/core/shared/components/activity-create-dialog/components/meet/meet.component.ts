import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ContactDto, CompanyDto, ModuleDto } from '../../../../../services/common.service';
import { CONTROL_TYPE, FormConfig, OptionsModel } from '../../../../../services/components.service';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CreateActivityDto, MeetingDto } from '../../../../../services/activity.service';

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
    start: new FormControl(new Date()),
    end: new FormControl(new Date()),
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
  ]

  constructor(
    private translateService: TranslateService,
  ) {

  }

  ngOnChanges(changes: SimpleChanges) {

  }

  ngOnInit() {
    this.initMeetFormConfig();
    this.meetFormGroup.valueChanges.subscribe(change => {
      let meet: CreateActivityDto = {
        activityModuleCode: this.activityModule.moduleCode,
        activityModuleSubCode: this.activityModule.moduleSubCode,
        activityContent: '',
        activityModuleId: this.activityModule.moduleId,
        associationContactUidList: this.meetFormGroup.controls['association'].get('contact')?.value || [],
        associationCompanyUidList: this.meetFormGroup.controls['association'].get('company')?.value || [], activityContentLength: 0,
        activityType: {
          meeting: {
            subject: this.meetFormGroup.controls['subject'].value,
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
    });
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
        label: 'INPUT.ATTENDEES',
        type: CONTROL_TYPE.Dropdown,
        fieldControl: this.meetFormGroup.controls['attendees'],
        options: [],
        layoutDefine: {
          row: 2,
          column: 0
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
    ]
  }
}

enum ReminderTypeEnum {
  Minutes = 1,
  Hours = 2,
  Days = 3,
  Weeks = 4,
}