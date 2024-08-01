import { Component, Input, NgZone, OnChanges, SimpleChanges } from '@angular/core';
import { ActivityDto, ActivityModuleDto, ActivityService } from '../../../services/activity.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ContactDto, ModuleDto } from '../../../services/common.service';
import { CONTROL_TYPE, FormConfig, OptionsModel } from '../../../services/components.service';
import Quill from 'quill';
import { MessageService } from 'primeng/api';
import { EDITOR_CONTENT_LIMIT, ATTACHMENT_MAX_SIZE } from '../../constants/common.constants';

@Component({
  selector: 'app-activity-block',
  templateUrl: './activity-block.component.html',
  styleUrl: './activity-block.component.scss'
})
export class ActivityBlockComponent implements OnChanges {
  @Input() activity: ActivityDto = new ActivityDto();
  @Input() activityModule: ModuleDto = new ModuleDto();
  @Input() activityModuleList: ModuleDto[] = [];
  @Input() activityControlList: ActivityModuleDto[] = [];
  @Input() module: 'CONT' | 'COMP' = 'CONT';
  @Input() contactProfile: ContactDto = new ContactDto();
  @Input() moduleLable: string = '';

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
  componentList: string[] = [];
  editorModel: string = '<p>test</p>';
  editorFormControl: FormControl = new FormControl(null, Validators.required);
  contentWordLength: number = 0;
  editorContentLimit = EDITOR_CONTENT_LIMIT;
  attachmentList: File[] = [];
  fileMaxSize: number = ATTACHMENT_MAX_SIZE;

  actionMenu: any[] = [
    {
      label: this.activity.isPinned ? 'Unpin' : 'Pin',
      icon: 'pi pi-thumbtack',
      command: () => {
        this.activity.isPinned = !this.activity.isPinned;
        console.log(this.activity.isPinned);
      }
    },
    {
      label: 'Delete',
      icon: 'pi pi-trash'
    }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private activityService: ActivityService,
    private ngZone: NgZone,
    private messageService: MessageService
  ) {

  }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes)
    if (changes['activityControlList'] && changes['activityControlList'].currentValue) {
      this.assignForm();

    }
  }

  assignForm() {
    switch (this.activity.activityModuleCode) {
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

    this.activityControlList = this.activityControlList.filter((control) => {
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
          row: 0,
          column: 0,
        }
      };

      if (module.moduleCode === 'CONT') {
        forms = {
          type: CONTROL_TYPE.Dropdown,
          label: module.moduleName,
          fieldControl: this.activityFormGroup.controls[module.moduleCode],
          layoutDefine: {
            row: 0,
            column: 0,
          },
          options: []
        }
        // this.activityFormGroup.controls[module.moduleCode].setValue([])
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

    this.assignActivityValue();
  }

  assignActivityValue() {
    // this.activityFormGroup.controls['CONT'].setValue([])
    this.activityFormGroup.controls['DATE'].setValue(new Date(this.activity.activityDatetime));
    this.activityFormGroup.controls['TIME'].setValue(new Date(this.activity.activityDatetime));
    this.activityFormGroup.controls['OUTCOME_C'].setValue(this.activity.activityOutcomeId);
    this.activityFormGroup.controls['OUTCOME_M'].setValue(this.activity.activityOutcomeId);
    this.activityFormGroup.controls['DIRECT'].setValue(this.activity.activityDirectionId);
    this.activityFormGroup.controls['DURAT'].setValue(this.activity.activityDuration);

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

  popMessage(message: string, title: string, severity: string = 'success',) {
    this.messageService.add({ severity: severity, summary: title, detail: message });
  }

  fileUpload(event: any) {
    let list: File[] = event.target.files;

    for (let i = 0; i < list.length; i++) {
      if (!this.activity.attachmentList.find(item => item.fileName === list[i].name)) {
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
    this.activity.attachmentList = this.activity.attachmentList.filter(item => item.fileName !== file.name)
  }
}
