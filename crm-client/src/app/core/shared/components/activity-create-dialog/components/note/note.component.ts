import { Component, EventEmitter, Input, NgZone, Output } from '@angular/core';
import { ActivityModuleDto, CreateActivityDto } from '../../../../../services/activity.service';
import { ContactDto, CompanyDto, CommonService, WindowSizeDto, ModuleDto } from '../../../../../services/common.service';
import { CONTROL_TYPE, FormConfig, OptionsModel } from '../../../../../services/components.service';
import { FormControl, Validators } from '@angular/forms';
import { CoreHttpService } from '../../../../../services/core-http.service';
import { ATTACHMENT_MAX_SIZE, EDITOR_CONTENT_LIMIT } from '../../../../constants/common.constants';
import { ToastService } from '../../../../../services/toast.service';
import { CoreAuthService } from '../../../../../services/core-auth.service';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrl: './note.component.scss'
})
export class NoteComponent {
  @Input() contactProfile: ContactDto = new ContactDto();
  @Input() companyProfile: CompanyDto = new CompanyDto();
  @Input() module: "CONT" | "COMP" = "CONT";
  @Input() activityModule: ModuleDto = new ModuleDto();
  @Output() noteValueEmit: EventEmitter<CreateActivityDto> = new EventEmitter<CreateActivityDto>();
  @Output() attachmentEmit: EventEmitter<File[]> = new EventEmitter<File[]>();

  windowSize: WindowSizeDto = new WindowSizeDto();

  createNoteFormConfig: FormConfig[] = [];
  editorFormControl: FormControl = new FormControl(null, Validators.required);
  contentWordLength: number = 0;
  attachmentList: File[] = [];
  fileMaxSize: number = ATTACHMENT_MAX_SIZE;
  editorContentLimit = EDITOR_CONTENT_LIMIT;
  assoContactFormConfig: FormConfig[] = [];
  assoCompanyFormConfig: FormConfig[] = [];
  assoCompanyForm: FormControl = new FormControl([]);
  assoContactForm: FormControl = new FormControl([]);
  assoCompanyList: OptionsModel[] = [];
  assoContactList: OptionsModel[] = [];

  constructor(
    private ngZone: NgZone,
    private coreAuthService: CoreAuthService,
    private commonService: CommonService,
    private toastService: ToastService,
  ) {
    this.windowSize = this.commonService.windowSize;
  }

  ngOnInit() {
    this.setAssociation();

    this.editorFormControl.valueChanges.subscribe(val => {
      this.sendEmit();
    });
  }

  countTextLength(length: number) {
    this.contentWordLength = length;
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

    this.assoContactForm.valueChanges.subscribe(val => {
      this.sendEmit();
    });

    this.assoCompanyForm.valueChanges.subscribe(val => {
      this.sendEmit();
    });
  }

  fileUpload(event: any) {
    // console.log(event.target.files)
    let list: File[] = event.target.files;

    for (let i = 0; i < list.length; i++) {
      if (!this.attachmentList.find(item => item.name === list[i].name)) {
        if (list[i].size > this.fileMaxSize) {
          this.toastService.addSingle({
            message: `File size is exceed. (${this.returnFileSize(list[i].size)})`,
            severity: 'error'
          });
          break;
        }
        this.attachmentList.push(list[i]);
        this.attachmentEmit.emit(this.attachmentList);
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
    return this.commonService.returnFileSize(bytes, decimals);
  }

  removeFile(file: File) {
    this.attachmentList = this.attachmentList.filter(item => item.name !== file.name)
  }

  sendEmit() {
    let createActivity: CreateActivityDto = {
      activityModuleCode: this.activityModule.moduleCode,
      activityModuleSubCode: this.activityModule.moduleSubCode,
      activityModuleId: this.activityModule.uid,
      activityContent: this.editorFormControl.value,
      activityContentLength: this.contentWordLength,
      activityContactedIdList: [],
      activityDatetime: new Date(),
      activityDirectionId: null,
      activityOutcomeId: null,
      activityDuration: null,
      associationContactUidList: this.assoContactForm.value ?? [],
      associationCompanyUidList: this.assoCompanyForm.value ?? [],
      attachmentUid: [],
      createdBy: this.coreAuthService.userC.uid,
      createdDate: new Date()
    }
    this.noteValueEmit.emit(createActivity);
  }
}
