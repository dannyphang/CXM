import { Component, EventEmitter, Input, NgZone, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { AttachmentDto, CommonService, CompanyDto, ContactDto, ModuleDto } from '../../../services/common.service';
import { FormBuilder, FormControl, FormGroup, NgModel, Validators } from '@angular/forms';
import { CONTROL_TYPE, FormConfig, OptionsModel } from '../../../services/components.service';
import { ActivityDto, ActivityModuleDto, ActivityService, CreateActivityDto } from '../../../services/activity.service';
import { EDITOR_CONTENT_LIMIT, ATTACHMENT_MAX_SIZE } from '../../constants/common.constants';
import { FileSelectEvent, UploadEvent } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { BaseCoreAbstract } from '../../base/base-core.abstract';

@Component({
  selector: 'app-activity-dialog',
  templateUrl: './activity-dialog.component.html',
  styleUrl: './activity-dialog.component.scss'
})
export class ActivityDialogComponent extends BaseCoreAbstract implements OnChanges {
  @Input() contactProfile: ContactDto = new ContactDto();
  @Input() companyProfile: CompanyDto = new CompanyDto();
  @Input() module: "CONT" | "COMP" = "CONT";
  @Input() activityModule: ModuleDto = new ModuleDto();
  @Input() visible: boolean = false;
  @Input() activityControlListInput: ActivityModuleDto[] = [];
  @Input() activityModuleList: ModuleDto[] = [];
  @Input() header: string = 'Activity Dialog';
  @Output() close: EventEmitter<any> = new EventEmitter<any>();

  activityControlList: ActivityModuleDto[] = [];
  activityFormConfig: FormConfig[] = [];
  activityFormGroup: FormGroup = new FormGroup({
    CONT: new FormControl(this.module === "CONT" ? [this.contactProfile.contactId] : []),
    DATE: new FormControl(new Date()),
    TIME: new FormControl(new Date()),
    OUTCOME_C: new FormControl(null),
    DIRECT: new FormControl(null),
    OUTCOME_M: new FormControl(null),
    DURAT: new FormControl(null),
  });
  activitiesList: ActivityDto[] = [];
  componentList: string[] = [];
  editorModel: string = '<p>Testing</p>';
  editorFormControl: FormControl = new FormControl(null, Validators.required);
  contentWordLength: number = 0;
  editorContentLimit = EDITOR_CONTENT_LIMIT;
  attachmentList: File[] = [];
  fileMaxSize: number = ATTACHMENT_MAX_SIZE;
  assoFormConfig: FormConfig[] = [];
  assoCompanyForm: FormControl = new FormControl([]);
  assoContactForm: FormControl = new FormControl([]);
  assoCompanyList: any[] = [];
  assoContactList: any[];

  constructor(
    private commonService: CommonService,
    private formBuilder: FormBuilder,
    private activityService: ActivityService,
    private ngZone: NgZone,
    protected override messageService: MessageService
  ) {
    super(messageService);
  }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contactProfile'] && changes['contactProfile'].currentValue) {
      this.activityFormGroup.controls['CONT'].setValue([this.contactProfile.contactId]);
      this.setAssociation();
    }
    if (changes['activityModule'] && changes['activityModule'].currentValue) {
      this.assignForm();
    }
  }

  closeDialog() {
    this.clearForm();
    this.visible = false;
    this.close.emit();
  }

  clearForm() {
    this.activityFormGroup.controls['CONT'].setValue(this.module === "CONT" ? [this.contactProfile.contactId] : []);
    this.activityFormGroup.controls['DATE'].setValue(new Date());
    this.activityFormGroup.controls['TIME'].setValue(new Date());
    this.activityFormGroup.controls['OUTCOME_C'].setValue(null);
    this.activityFormGroup.controls['DIRECT'].setValue(null);
    this.activityFormGroup.controls['OUTCOME_M'].setValue(null);
    this.activityFormGroup.controls['DURAT'].setValue(null);
  }

  assignForm() {
    switch (this.activityModule.moduleCode) {
      case 'NOTE':
        this.componentList = [];
        break;
      case 'EMAIL':
        this.componentList = ['CONT', 'DATE', 'TIME'];
        break;
      case 'CALL':
        this.componentList = ['CONT', 'OUTCOME_C', 'DIRECT', 'DATE', 'TIME'];
        break;
      case 'MEET':
        this.componentList = ['CONT', 'OUTCOME_M', 'DATE', 'TIME', 'DURAT'];
        break;
    }

    this.activityControlList = this.activityControlListInput.filter((control) => {
      return this.componentList.includes(control.moduleCode);
    });

    let cols = 0;
    let rows = 1;
    let formsConfig: FormConfig[] = [];

    this.activityControlList.forEach((module) => {

      if (cols === 3) {
        cols = 0;
        rows++;
      }

      let forms: FormConfig = {
        type: CONTROL_TYPE.Textbox,
        label: module.moduleName,
        fieldControl: this.activityFormGroup.controls[module.moduleCode],
        layoutDefine: {
          row: rows,
          column: cols,
        }
      };

      if (module.moduleCode === 'CONT') {
        forms = {
          type: CONTROL_TYPE.Multiselect,
          label: module.moduleName,
          fieldControl: this.activityFormGroup.controls[module.moduleCode],
          layoutDefine: {
            row: 0,
            column: 0,
          },
          options: this.getContactedList(),
        }
      }
      else if (module.moduleCode === 'DATE' || module.moduleCode === 'TIME') {
        forms = {
          type: CONTROL_TYPE.Calendar,
          label: module.moduleName,
          fieldControl: this.activityFormGroup.controls[module.moduleCode],
          layoutDefine: {
            row: rows,
            column: cols,
          },
          showTime: module.moduleCode === 'TIME' ? true : false,
          timeOnly: module.moduleCode === 'TIME' ? true : false
        }
      }
      else if (module.moduleCode === 'OUTCOME_C' || module.moduleCode === 'OUTCOME_M' || module.moduleCode === 'DIRECT') {
        let subList: OptionsModel[] = [];
        if (module.moduleCode === 'OUTCOME_M') {
          subList.push({ label: '(No value)', value: null });
        }
        module.subActivityControl.forEach((item) => {
          subList.push({ label: item.moduleName, value: item.uid });
        });

        forms = {
          type: CONTROL_TYPE.Dropdown,
          label: module.moduleName,
          fieldControl: this.activityFormGroup.controls[module.moduleCode],
          layoutDefine: {
            row: rows,
            column: cols,
          },
          options: subList
        }
      }
      else if (module.moduleCode === 'DURAT') {
        let subList: OptionsModel[] = [];
        this.generateTimeSlots().forEach((item) => {
          subList.push({ label: item.label, value: item.value });
        });

        forms = {
          type: CONTROL_TYPE.Dropdown,
          label: module.moduleName,
          fieldControl: this.activityFormGroup.controls[module.moduleCode],
          layoutDefine: {
            row: rows,
            column: cols,
          },
          options: this.generateTimeDurations()
        }
      }
      cols++;
      formsConfig.push(forms);
    });
    this.activityFormConfig = formsConfig;
  }

  setAssociation() {
    // assign association 
    console.log(this.contactProfile)
    if (this.module === 'CONT' && this.contactProfile.association) {
      this.contactProfile.association.companyList.forEach(profile => {
        this.assoCompanyList.push({
          label: `${profile.companyName} (${profile.companyEmail})`,
          value: profile.uid
        });
      });

      this.assoFormConfig = [
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
      ]
    }
    else if (this.module === 'COMP' && this.companyProfile.association) {
      this.companyProfile.association.contactList.forEach(profile => {
        this.assoContactList.push({
          label: `${profile.contactFirstName} ${profile.contactLastName}  (${profile.contactEmail})`,
          value: profile.uid
        });
      });
      this.assoFormConfig = [
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
      ]
    }

    console.log(this.assoCompanyList)
  }

  getContactedList(): OptionsModel[] {
    return [{
      label: `${this.contactProfile.contactFirstName} ${this.contactProfile.contactLastName} (${this.contactProfile.contactEmail})`,
      value: this.contactProfile.contactId
    }
    ];
  }

  generateTimeSlots(intervalMinutes: number = 30): any[] {
    let times: any[] = [];

    let minute: number = 0;
    for (let hours = 0; hours < 24; hours++) {
      for (let minutes = 0; minutes < 60; minutes += intervalMinutes) {
        const formattedTime = {
          value: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
          label: minute += minutes
        };

        times.push(formattedTime);
      }
    }

    return times;
  }

  generateTimeDurations(intervalMinutes: number = 15, iterations: number = 32): any[] {
    const durations: any[] = [];
    let currentMinutes = intervalMinutes;

    for (let i = 0; i < iterations; i++) {
      if (currentMinutes < 60) {
        durations.push({
          label: `${currentMinutes} minutes`,
          value: currentMinutes
        });
      } else {
        const hours = Math.floor(currentMinutes / 60);
        const minutes = currentMinutes % 60;
        const hourString = hours > 1 ? 'hours' : 'hour';
        const duration = minutes > 0
          ? `${hours} ${hourString} ${minutes} minutes`
          : `${hours} ${hourString}`;
        durations.push({
          label: duration,
          value: currentMinutes
        });
      }
      currentMinutes += intervalMinutes;
    }

    return durations;
  }

  countTextLength(text: any) {
    this.ngZone.run(() => {
      this.contentWordLength = text.textValue.length;
    });
  }

  fileUpload(event: any) {
    // console.log(event.target.files)
    let list: File[] = event.target.files;

    for (let i = 0; i < list.length; i++) {
      if (!this.attachmentList.find(item => item.name === list[i].name)) {
        if (list[i].size > this.fileMaxSize) {
          this.popMessage(`File size is exceed. (${this.returnFileSize(list[i].size)})`, "File size error", "error");
          break;
        }
        this.attachmentList.push(list[i]);
      }
      else {
        this.popMessage(`(${list[i].name}) is duplicated.`, "File duplicated", "error");
      }
    }

    console.log(this.attachmentList)
  }

  returnFileSize(bytes: number = 0, decimals: number = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
  }

  removeFile(file: File) {
    this.attachmentList = this.attachmentList.filter(item => item.name !== file.name)
  }

  save() {
    if (this.activityFormGroup.valid) {

      let createActivity: CreateActivityDto = {
        activityModuleCode: this.activityModule.moduleCode,
        activityModuleId: this.activityModule.uid,
        activityContent: this.editorFormControl.value,
        activityContactedIdList: this.activityFormGroup.controls['CONT'].value,
        activityDatetime: this.activityFormGroup.controls['DATE'].value, // TODO
        activityDirectionId: this.activityFormGroup.controls['DIRECT'].value,
        activityOutcomeId: this.activityFormGroup.controls['OUTCOME_C'].value || this.activityFormGroup.controls['OUTCOME_M'].value ? this.activityModule.moduleCode === 'CALL' ? this.activityFormGroup.controls['OUTCOME_C'].value : this.activityFormGroup.controls['OUTCOME_M'].value : null,
        activityDuration: this.activityFormGroup.controls['DURAT'].value,
        associationId: '',
        attachmentUid: '',
      }

      this.activityService.createActivity([createActivity]).subscribe(res => {
        if (res.isSuccess) {
          this.attachmentList.forEach(file => {
            this.commonService.uploadFile(file, "Activity").subscribe(res2 => {
              if (res2.isSuccess) {
                let uploadAttach: AttachmentDto = {
                  activityUid: res.data[0].uid!,
                  folderName: "Activity",
                  fileName: res2.data.metadata.name,
                  fullPath: res2.data.metadata.fullPath,
                  fileSize: res2.data.metadata.size
                }

                this.activityService.uploadAttachment([uploadAttach]).subscribe(res3 => {
                  if (res3.isSuccess) {
                    this.closeDialog();
                  }
                  else {
                    this.popMessage(res.responseMessage, "Error", "error");
                  }
                });
              }
              else {
                this.popMessage(res.responseMessage, "Error", "error");
              }
            });
          });
        }
        else {
          this.popMessage(res.responseMessage, "Error", "error");
        }

      });

    }
  }
}
