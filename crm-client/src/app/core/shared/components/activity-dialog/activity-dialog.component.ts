import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ContactDto, ModuleDto } from '../../../services/common.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CONTROL_TYPE, FormConfig, OptionsModel } from '../../../services/components.service';
import { ActivityDto, ActivityModuleDto, ActivityService } from '../../../services/activity.service';

@Component({
  selector: 'app-activity-dialog',
  templateUrl: './activity-dialog.component.html',
  styleUrl: './activity-dialog.component.scss'
})
export class ActivityDialogComponent {
  @Input() module: "CONT" | "COMP" = "CONT";
  @Input() activityModule: ModuleDto = new ModuleDto();
  @Input() visible: boolean = false;
  @Input() activityControlList: ActivityModuleDto[] = [];
  @Input() activityModuleList: ModuleDto[] = [];
  @Input() header: string = 'Activity Dialog';
  @Input() contactProfile: ContactDto = new ContactDto();
  @Output() close: EventEmitter<any> = new EventEmitter<any>();

  activityFormConfig: FormConfig[] = [];
  activityFormGroup: FormGroup = new FormGroup({
    CONT: new FormControl(this.module === "CONT" ? this.contactProfile.uid : null, Validators.required),
    DATE: new FormControl(new Date(), Validators.required),
    TIME: new FormControl(new Date(), Validators.required),
    OUTCOME_C: new FormControl(null, Validators.required),
    DIRECT: new FormControl(null, Validators.required),
    OUTCOME_M: new FormControl(null, Validators.required),
    DURAT: new FormControl(null, Validators.required),
  });
  activitiesList: ActivityDto[] = [];
  componentList: string[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private activityService: ActivityService
  ) {

  }

  ngOnInit() {
    this.assignForm();
    this.activityService.getAllActivities().subscribe(res => {
      this.activitiesList = res;
      console.log(res)
    })
    console.log(this.activityFormGroup)
  }

  closeDialog() {
    this.visible = false;
    this.close.emit();
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

    this.activityControlList = this.activityControlList.filter((control) => {
      return this.componentList.includes(control.moduleCode);
    });

    console.log(this.activityModule.moduleName);
    console.log(this.activityControlList);

    this.activityFormGroup = this.formBuilder.group({});

    let cols = 0;
    let rows = 0;
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
          type: CONTROL_TYPE.Dropdown,
          label: module.moduleName,
          fieldControl: this.activityFormGroup.controls[module.moduleCode],
          layoutDefine: {
            row: rows,
            column: cols,
          },
          options: []
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
      cols++;
      formsConfig.push(forms);
    });
    this.activityFormConfig = formsConfig;
  }

  save() {
    console.log(this.activityFormGroup)
  }
}
