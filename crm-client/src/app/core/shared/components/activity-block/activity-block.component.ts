import { Component, EventEmitter, Input, NgZone, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ActivityDto, ActivityModuleDto, ActivityService, UpdateActivityDto } from '../../../services/activity.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { AttachmentDto, CommonService, CompanyDto, ContactDto, ModuleDto } from '../../../services/common.service';
import { CONTROL_TYPE, FormConfig, OptionsModel } from '../../../services/components.service';
import { MessageService } from 'primeng/api';
import { EDITOR_CONTENT_LIMIT, ATTACHMENT_MAX_SIZE } from '../../constants/common.constants';
import { BaseCoreAbstract } from '../../base/base-core.abstract';
import { TranslateService } from '@ngx-translate/core';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-activity-block',
  templateUrl: './activity-block.component.html',
  styleUrl: './activity-block.component.scss'
})
export class ActivityBlockComponent implements OnChanges {
  @Input() activity: ActivityDto = new ActivityDto();
  @Input() activityModule: ModuleDto = new ModuleDto();
  @Input() subActivityModule: ModuleDto[] = [];
  @Input() activityModuleList: ModuleDto[] = [];
  @Input() activityControlList: ActivityModuleDto[] = [];
  @Input() module: 'CONT' | 'COMP' = 'CONT';
  @Input() contactProfile: ContactDto = new ContactDto();
  @Input() companyProfile: CompanyDto = new CompanyDto();
  @Input() moduleLable: string = '';
  @Output() activityReload: EventEmitter<any> = new EventEmitter<any>();

  readonly: boolean = true;
  contentReadonly: boolean = true;
  activityFormConfig: FormConfig[] = [];
  activityFormGroup: FormGroup = new FormGroup({
    CONT: new FormControl(this.module === "CONT" ? [this.contactProfile.contactId] : []),
    DATE: new FormControl(new Date()),
    TIME: new FormControl(new Date()),
    OUTCOME_C: new FormControl(this.activity.activityOutcomeId),
    DIRECT: new FormControl(this.activity.activityDirectionId),
    OUTCOME_M: new FormControl(this.activity.activityOutcomeId),
    DURAT: new FormControl(this.activity.activityDuration),
  });
  componentList: string[] = [];
  editorModel: string = '<p>test</p>';
  editorFormControl: FormControl = new FormControl(this.editorModel, Validators.required);
  contentWordLength: number = 0;
  editorContentLimit = EDITOR_CONTENT_LIMIT;
  attachmentList: File[] = [];
  fileMaxSize: number = ATTACHMENT_MAX_SIZE;
  assoContactFormConfig: FormConfig[] = [];
  assoCompanyFormConfig: FormConfig[] = [];
  assoCompanyForm: FormControl = new FormControl([]);
  assoContactForm: FormControl = new FormControl([]);
  updateAct: UpdateActivityDto = new UpdateActivityDto();
  actionMenu: any[] = [];

  constructor(
    private activityService: ActivityService,
    private ngZone: NgZone,
    private translateService: TranslateService,
    private commonService: CommonService,
    private toastService: ToastService
  ) {

  }

  ngOnInit() {
    this.componentList.forEach(comp => {
      this.activityFormGroup.controls[comp].valueChanges.subscribe(value => {
        this.updateAct.uid = this.activity.uid

        switch (comp) {
          case 'CONT':
            break;
          case 'DATE':
          case 'TIME':
            this.updateAct.activityDatetime = new Date(value);
            break;
          case 'OUTCOME_C':
          case 'OUTCOME_M':
            this.updateAct.activityOutcomeId = value;
            break;
          case 'DIRECT':
            this.updateAct.activityDirectionId = value;
            break;
          case 'DURAT':
            this.updateAct.activityDuration = value;
            break;
          default:
          // console.log(comp);
        }

        // this.activityService.updateActivity(updateAct).subscribe(res => {
        //   if (!res.isSuccess) {
        //     this.toastService.addSingle({
        //       message: res.responseMessage,
        //       severity: 'error'
        //     });
        //   }
        // });
        this.readonly = false;
      })
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['activity'] && changes['activity'].currentValue) {
      this.assignForm();
      this.assignActivityValue();
      this.actionMenu = [
        {
          label: this.activity.isPinned ? this.translateService.instant('ACTIVITY.UNPIN') : this.translateService.instant('ACTIVITY.PIN'),
          icon: this.activity.isPinned ? 'pi pi-star-fill' : 'pi pi-star',
          command: () => {
            this.activity.isPinned = !this.activity.isPinned;
            this.activityService.updateActivity({
              uid: this.activity.uid,
              isPinned: this.activity.isPinned
            }).subscribe(res => {
              if (res.isSuccess) {
                this.activityReload.emit();
              }
              else {
                this.toastService.addSingle({
                  message: res.responseMessage,
                  severity: 'error'
                });
              }
            })
          }
        },
        {
          label: 'Delete',
          icon: 'pi pi-trash',
          command: () => {
            this.activityService.updateActivity({
              uid: this.activity.uid,
              statusId: 2
            }).subscribe(res => {
              if (res.isSuccess) {
                this.toastService.addSingle({
                  message: this.translateService.instant("MESSAGE.DELETED_SUCCESSFULLY", {
                    module: this.translateService.instant(`ACTIVITY.MODULE.${this.activity.activityModuleCode}`)
                  })
                })
                this.activityReload.emit();
              }
              else {
                this.toastService.addSingle({
                  message: res.responseMessage,
                  severity: 'error'
                });
              }
            })
          }
        }
      ];
    }
    if (changes['contactProfile'] && changes['contactProfile'].currentValue) {
      if (changes['activityControlList'] && changes['activityControlList'].currentValue) {
        this.assignForm();
      }
      this.setAssociation();
    }
    if (changes['companyProfile'] && changes['companyProfile'].currentValue) {
      if (changes['activityControlList'] && changes['activityControlList'].currentValue) {
        this.assignForm();
      }
      this.setAssociation();
    }
    if (changes['activityModule'] && changes['activityModule'].currentValue) {
      console.log(this.activityModule)
    }
    if (changes['subActivityModule'] && changes['subActivityModule'].currentValue) {
      console.log(this.subActivityModule)
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
        fieldControl: new FormControl(),
        layoutDefine: {
          row: 0,
          column: 0,
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
          options: this.getContactedList()
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

  getContactedList(): OptionsModel[] {
    let contactList: OptionsModel[] = [];
    this.activity.association.contactList.forEach((profile) => {
      contactList.push({
        label: `${profile.contactFirstName} ${profile.contactLastName}  (${profile.contactEmail})`,
        value: profile.uid
      });
    });

    if (this.module === 'CONT') {
      if (!contactList.find(c => c.value === this.contactProfile?.uid)) {
        contactList.push({
          label: `${this.contactProfile.contactFirstName} ${this.contactProfile.contactLastName}  (${this.contactProfile.contactEmail})`,
          value: this.contactProfile.uid
        });
      }
    }
    else if (this.module === 'COMP') {
      this.companyProfile.association?.contactList.forEach(co => {
        if (!contactList.find(c => c.value === co.uid)) {
          contactList.push({
            label: `${co.contactFirstName} ${co.contactLastName}  (${co.contactEmail})`,
            value: co.uid
          });
        }
      })
    }
    return contactList;
  }

  assignActivityValue() {
    this.activityFormGroup.controls['CONT'].setValue(this.activity.activityContactedIdList, { emitEvent: false })
    this.activityFormGroup.controls['DATE'].setValue(this.activity.activityDatetime, { emitEvent: false })
    this.activityFormGroup.controls['TIME'].setValue(this.activity.activityDatetime, { emitEvent: false })
    this.activityFormGroup.controls['OUTCOME_C'].setValue(this.activity.activityOutcomeId, { emitEvent: false })
    this.activityFormGroup.controls['DIRECT'].setValue(this.activity.activityDirectionId, { emitEvent: false })
    this.activityFormGroup.controls['OUTCOME_M'].setValue(this.activity.activityOutcomeId, { emitEvent: false })
    this.activityFormGroup.controls['DURAT'].setValue(this.activity.activityDuration, { emitEvent: false })
    this.editorFormControl = new FormControl(this.activity.activityContent);
  }

  setAssociation() {
    let assoCompanyList: OptionsModel[] = [];
    let assoContactList: OptionsModel[] = [];

    this.activity.association.contactList.forEach((profile) => {
      assoContactList.push({
        label: `${profile.contactFirstName} ${profile.contactLastName}  (${profile.contactEmail})`,
        value: profile.uid
      });
    })

    this.activity.association.companyList.forEach((profile) => {
      assoCompanyList.push({
        label: `${profile.companyName} (${profile.companyEmail})`,
        value: profile.uid
      });
    })

    this.assoContactFormConfig = [
      {
        id: '',
        type: CONTROL_TYPE.Multiselect,
        layoutDefine: {
          row: 0,
          column: 0
        },
        options: assoContactList,
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
        options: assoCompanyList,
        fieldControl: this.assoCompanyForm
      }
    ];

    this.assoContactForm.setValue(this.activity.associationContactUidList, { emitEvent: false });
    this.assoCompanyForm.setValue(this.activity.associationCompanyUidList, { emitEvent: false });
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
    let list: File[] = event.target.files;

    for (let i = 0; i < list.length; i++) {
      if (!this.activity.attachmentList?.find(item => item.fileName === list[i].name)) {
        if (list[i].size > this.fileMaxSize) {
          this.toastService.addSingle({
            message: `File size is exceed. (${this.returnFileSize(list[i].size)})`,
            severity: 'error'
          });
          break;
        }
        this.attachmentList.push(list[i]);
      }
      else {
        this.toastService.addSingle({
          message: `(${list[i].name}) is duplicated.`,
          severity: 'error'
        });
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

  updateActivity() {
    this.toastService.addSingle({
      key: 'update_activity',
      message: this.translateService.instant('MESSAGE.UPDATING_ACTIVITY'),
      isLoading: true,
      severity: 'info'
    });
    this.activityService.updateActivity({
      activityContent: this.editorFormControl.value,
      ...this.updateAct
    }).subscribe(res => {
      if (res.isSuccess) {
        if (this.attachmentList && this.attachmentList.length > 0) {
          this.attachmentList.forEach(file => {
            this.commonService.uploadFile(file, "Activity").subscribe(res2 => {
              if (res2.isSuccess) {
                let uploadAttach: AttachmentDto = {
                  activityUid: this.activity.uid,
                  folderName: "Activity",
                  fileName: res2.data.metadata.name,
                  fullPath: res2.data.metadata.fullPath,
                  fileSize: res2.data.metadata.size
                }

                this.activityService.uploadAttachment([uploadAttach]).subscribe(res3 => {
                  if (res3.isSuccess) {
                    this.activityService.updateActivity({
                      uid: res3.data[0].activityUid,
                      attachmentUid: this.returnAttactmentList(this.activity.attachmentUid, res3.data[0].uid),
                    }).subscribe(
                      {
                        next: res4 => {
                          if (res4.isSuccess) {
                            this.editorFormControl = new FormControl(this.editorFormControl.value);
                            this.activity.activityContent = this.editorFormControl.value;
                            this.readonly = true;
                            this.toastService.clear('update_activity');
                          }
                          else {
                            this.toastService.addSingle({
                              message: res4.responseMessage,
                              severity: 'error'
                            });
                          }
                        },
                        error: err => {
                          this.toastService.addSingle({
                            message: err,
                            severity: 'error'
                          });
                        }
                      }
                    )
                  }
                  else {
                    this.toastService.addSingle({
                      message: res.responseMessage,
                      severity: 'error'
                    });
                  }
                });
              }
              else {
                this.toastService.addSingle({
                  message: res.responseMessage,
                  severity: 'error'
                });
              }
            });
          });
        }
        else {
          this.editorFormControl = new FormControl(this.editorFormControl.value);
          this.activity.activityContent = this.editorFormControl.value;
          this.readonly = true;
          this.toastService.clear('update_activity');
        }
      }
      else {
        this.toastService.clear('update_activity');
        this.toastService.addSingle({
          message: res.responseMessage,
          severity: 'error'
        });
      }

    });
  }

  panelOnClick() {
    this.activity.isExpand = !this.activity.isExpand;
  }

  returnModuleInfo(code: string, id: string): string {
    return this.activityControlList.find(control => control.moduleCode === code)?.subActivityControl.find(item => item.uid === id)?.moduleName ?? '';
  }

  returnAttactmentList(attactmentList: string[], attachmentUid: string | undefined): string[] {
    if (!attachmentUid) {
      this.toastService.addSingle({
        message: this.translateService.instant('ERROR.ATTACHMENT_UPDATE_ERROR'),
        severity: 'error'
      });
    }
    else {
      if (!attactmentList.find(s => s === attachmentUid)) {
        attactmentList.push(attachmentUid);
        return attactmentList;
      }
    }
    return [];
  }
}
