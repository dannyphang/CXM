import { Component } from '@angular/core';
import { ROW_PER_PAGE_DEFAULT, ROW_PER_PAGE_DEFAULT_LIST } from '../../../core/shared/constants/common.constants';
import { CommonService, PropertiesDto, PropertyGroupDto } from '../../../core/services/common.service';
import { BaseCoreAbstract } from '../../../core/shared/base/base-core.abstract';
import { MessageService } from 'primeng/api';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CONTROL_TYPE, CONTROL_TYPE_CODE, FormConfig, OptionsModel } from '../../../core/services/components.service';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-setting-property',
  templateUrl: './property.component.html',
  styleUrl: './property.component.scss'
})
export class PropertyComponent extends BaseCoreAbstract {
  ROW_PER_PAGE_DEFAULT = ROW_PER_PAGE_DEFAULT;
  ROW_PER_PAGE_DEFAULT_LIST = ROW_PER_PAGE_DEFAULT_LIST;
  moduleOptions: OptionsModel[] = [];
  selectedProperty: PropertiesDto[] = [];
  propertiesList: PropertiesDto[] = [];
  propertyModule: PropertyGroupDto[] = [];
  moduleFormControl: FormControl = new FormControl("CONT");
  tableConfig: Column[] = [
    {
      field: 'propertyName',
      header: 'Name'
    },
    {
      field: 'propertyType',
      header: 'Type'
    },
    {
      field: 'moduleCat',
      header: 'Module Group'
    },
    {
      field: 'dealOwner',
      header: 'Deal Owner'
    },
    {
      field: 'createdBy',
      header: 'Created By'
    },
  ];
  tableLoading: boolean = false;
  isPropertyDialogVisible: boolean = false;
  propertyCreateFormConfig: FormConfig[] = [];
  propertyTypeFormConfig: FormConfig[] = [];
  propertyDetailFormGroup: FormGroup = new FormGroup({
    label: new FormControl('', Validators.required),
    code: new FormControl('', Validators.required),
    module: new FormControl('', Validators.required),
    group: new FormControl('', Validators.required),
    type: new FormControl('', Validators.required),
    isUnique: new FormControl(false),
    isMandatory: new FormControl(false),
    isEditable: new FormControl(false),
    isVisible: new FormControl(false),
    minLength: new FormControl(null),
    maxLength: new FormControl(null),
    minValue: new FormControl(null),
    maxValue: new FormControl(null),
    maxDecimal: new FormControl(null),
    numberOnly: new FormControl(false),
    noSpecialChar: new FormControl(false),
    futureDateOnly: new FormControl(false),
    pastDateOnly: new FormControl(false),
    weekdayOnly: new FormControl(false),
    weekendOnly: new FormControl(false),
    dateRangeStart: new FormControl(new Date()),
    dateRangeEnd: new FormControl(new Date()),
    regaxFormat: new FormControl(''),
    propertiesLookup: this.formBuilder.array([])
  });

  constructor(
    private commonService: CommonService,
    protected override messageService: MessageService,
    private translateService: TranslateService,
    private formBuilder: FormBuilder,
  ) {
    super(messageService);
  }

  ngOnInit() {
    this.getAllProperties('CONT');

    this.moduleFormControl.valueChanges.subscribe(val => {
      this.getAllProperties(val);
    });

    this.commonService.getAllModuleByModuleType('MODULE').subscribe(res => {
      if (res.isSuccess) {
        this.moduleOptions = res.data.map(i => ({
          label: i.moduleName,
          value: i.moduleCode
        }))
      }
      else {
        this.popMessage(res.responseMessage, "Error", "error");
      }
    });

    this.propertyDetailFormGroup.controls['label'].valueChanges.subscribe(val => {
      if (val) {
        this.propertyDetailFormGroup.controls['code'].setValue(val.toLowerCase().trim().replace(/ /g, '_'), { emitEvent: false });
      }
    });

    // init 1st lookup 
    this.addLookup();
  }

  get propertiesLookup(): FormArray {
    return this.propertyDetailFormGroup.controls['propertiesLookup'] as FormArray;
  }

  getAllProperties(module: string) {
    this.tableLoading = true;
    this.commonService.getAllPropertiesByModule(module).subscribe(res => {
      this.propertiesList = [];
      if (res.isSuccess) {
        res.data.forEach(group => {
          this.propertyModule.push(group);
          group.propertiesList.forEach(prop => {
            this.propertiesList.push(prop);
          })
        })
      }
      else {
        this.popMessage(res.responseMessage, "Error", "error");
      }
      this.tableLoading = false;
    });
  }

  returnColumnData(field: string, data: string): string {
    switch (field) {
      case 'propertyType':
        return this.returnPropertyType(data);
      case 'moduleCat':
        return this.returnModuleCode(data);
      default:
        return data;
    }
  }

  returnPropertyType(type: string): string {
    switch (type) {
      case 'TXT_S':
        return 'Textbox';
      case 'TXT_M':
        return 'Textarea';
      case 'SEL_S':
        return 'Dropdown';
      case 'SEL_M':
        return 'Multiselect';
      case 'RAD':
        return 'Radio';
      case 'CBX_S':
        return 'Checkbox';
      case 'CBX_M':
        return 'MultiCheckbox';
      case 'NUM':
        return 'Number';
      case 'DATE':
        return 'Date';
      case 'DATETIME':
        return 'DateTime';
      case 'TIME':
        return 'Time';
      case 'URL':
        return 'Url';
      case 'EML':
        return 'Email';
      case 'PHN':
        return 'Phone';
      case 'USR':
        return 'User';
      case 'COUNTRY':
        return 'Country';
      case 'STATE':
        return 'State';
      case 'CITY':
        return 'City';
      case 'POSTCODE':
        return 'Postcode';
      case 'YEAR':
        return 'Year';
      default:
        return '';
    }
  }

  returnModuleCode(code: string): string {
    return this.propertyModule.find(p => p.moduleCode === code)!.moduleName;
  }

  initPropertyForm() {
    this.propertyCreateFormConfig = [
      {
        label: 'SETTING.PROPERTY_LABEL',
        type: CONTROL_TYPE.Textbox,
        fieldControl: this.propertyDetailFormGroup.controls['label'],
        layoutDefine: {
          row: 0,
          column: 0
        },
      },
      {
        label: 'SETTING.PROPERTY_CODE',
        type: CONTROL_TYPE.Textbox,
        fieldControl: this.propertyDetailFormGroup.controls['code'],
        layoutDefine: {
          row: 0,
          column: 1
        }
      },
      {
        id: 'PROPERTY_MODULE',
        label: 'SETTING.PROPERTY_MODULE',
        type: CONTROL_TYPE.Dropdown,
        fieldControl: this.propertyDetailFormGroup.controls['module'],
        layoutDefine: {
          row: 1,
          column: 0
        },
        options: this.moduleOptions
      },
      {
        label: 'SETTING.PROPERTY_GROUP',
        type: CONTROL_TYPE.Dropdown,
        fieldControl: this.propertyDetailFormGroup.controls['group'],
        layoutDefine: {
          row: 1,
          column: 2
        },
        dataSourceDependOn: ['PROPERTY_MODULE'],
        dataSourceAction: () => this.getModuleGroupList()
      },
      {
        label: 'SETTING.PROPERTY_TYPE',
        type: CONTROL_TYPE.Dropdown,
        fieldControl: this.propertyDetailFormGroup.controls['type'],
        layoutDefine: {
          row: 2,
          column: 0
        },
        dataSourceAction: () => this.getModuleListByModuleType('CONTROLTYPE')
      },
    ];
    this.propertyDetailFormGroup.controls['type'].valueChanges.subscribe(val => {
      let form: FormConfig[] = [];
      let rowCount = 0;
      form = [
        {
          id: 'IS_UNIQUE',
          label: 'SETTING.IS_UNIQUE',
          type: CONTROL_TYPE.Checkbox,
          fieldControl: this.propertyDetailFormGroup.controls['isUnique'],
          layoutDefine: {
            row: ++rowCount,
            column: 0
          },
          options: [],
          switchInput: true,
          iconLabelTooltip: '// TODO: descibe the field'
        },
        {
          id: 'IS_MANDATORY',
          label: 'SETTING.IS_MANDATORY',
          type: CONTROL_TYPE.Checkbox,
          fieldControl: this.propertyDetailFormGroup.controls['isMandatory'],
          layoutDefine: {
            row: rowCount,
            column: 1
          },
          options: [],
          switchInput: true,
          iconLabelTooltip: '// TODO: descibe the field',
        },
        {
          id: 'IS_EDITABLE',
          label: 'SETTING.IS_EDITABLE',
          type: CONTROL_TYPE.Checkbox,
          fieldControl: this.propertyDetailFormGroup.controls['isEditable'],
          layoutDefine: {
            row: ++rowCount,
            column: 0
          },
          options: [],
          switchInput: true,
          iconLabelTooltip: '// TODO: descibe the field',
        },
        {
          id: 'IS_VISIBLE',
          label: 'SETTING.IS_VISIBLE',
          type: CONTROL_TYPE.Checkbox,
          fieldControl: this.propertyDetailFormGroup.controls['isVisible'],
          layoutDefine: {
            row: rowCount,
            column: 1
          },
          options: [],
          switchInput: true,
          iconLabelTooltip: '// TODO: descibe the field',
        },
        {
          id: 'REGAX_FORMAT',
          label: 'SETTING.REGAX_FORMAT',
          type: CONTROL_TYPE.Textbox,
          fieldControl: this.propertyDetailFormGroup.controls['regaxFormat'],
          layoutDefine: {
            row: ++rowCount,
            column: 0
          },
          iconLabelTooltip: '// TODO: descibe the field',
        },
      ];

      switch (val) {
        case 'TXT_S':
        case 'TXT_M':
          form = form.concat(
            [
              {
                id: 'MIN_LENGTH',
                label: 'SETTING.MIN_LENGTH',
                type: CONTROL_TYPE.Textbox,
                fieldControl: this.propertyDetailFormGroup.controls['minLength'],
                layoutDefine: {
                  row: ++rowCount,
                  column: 0
                },
                onlyNumber: true,
                min: 0,
                iconLabelTooltip: '// TODO: descibe the field',
              },
              {
                id: 'MAX_LENGTH',
                label: 'SETTING.MAX_LENGTH',
                type: CONTROL_TYPE.Textbox,
                fieldControl: this.propertyDetailFormGroup.controls['maxLength'],
                layoutDefine: {
                  row: rowCount,
                  column: 1
                },
                onlyNumber: true,
                min: 0,
                iconLabelTooltip: '// TODO: descibe the field',
              },
              {
                id: 'NUMBER_ONLY',
                label: 'SETTING.NUMBER_ONLY',
                type: CONTROL_TYPE.Checkbox,
                fieldControl: this.propertyDetailFormGroup.controls['numberOnly'],
                layoutDefine: {
                  row: ++rowCount,
                  column: 0
                },
                options: [],
                switchInput: true,
                iconLabelTooltip: '// TODO: descibe the field',
              },
              {
                id: 'NO_SPECIAL_CHAR',
                label: 'SETTING.NO_SPECIAL_CHAR',
                type: CONTROL_TYPE.Checkbox,
                fieldControl: this.propertyDetailFormGroup.controls['noSpecialChar'],
                layoutDefine: {
                  row: rowCount,
                  column: 1
                },
                options: [],
                switchInput: true,
                iconLabelTooltip: '// TODO: descibe the field',
              }
            ]
          )
          break;
        case 'NUM':
          form = form.concat(
            [
              {
                id: 'MIN_VALUE',
                label: 'SETTING.MIN_VALUE',
                type: CONTROL_TYPE.Textbox,
                fieldControl: this.propertyDetailFormGroup.controls['minValue'],
                layoutDefine: {
                  row: ++rowCount,
                  column: 0
                },
                onlyNumber: true,
                iconLabelTooltip: '// TODO: descibe the field',
              },
              {
                id: 'MAX_VALUE',
                label: 'SETTING.MAX_VALUE',
                type: CONTROL_TYPE.Textbox,
                fieldControl: this.propertyDetailFormGroup.controls['maxValue'],
                layoutDefine: {
                  row: rowCount,
                  column: 1
                },
                onlyNumber: true,
                iconLabelTooltip: '// TODO: descibe the field',
              },
              {
                id: 'MAX_DECIMAL',
                label: 'SETTING.MAX_DECIMAL',
                type: CONTROL_TYPE.Textbox,
                fieldControl: this.propertyDetailFormGroup.controls['maxDecimal'],
                layoutDefine: {
                  row: ++rowCount,
                  column: 0
                },
                onlyNumber: true,
                min: 0,
                iconLabelTooltip: '// TODO: descibe the field',
              },
            ]
          );
          break;
        case 'DATE':
        case 'DATETIME':
        case 'TIME':
          form = form.concat(
            [
              {
                id: 'FUTURE_DATE_ONLY',
                label: 'SETTING.FUTURE_DATE_ONLY',
                type: CONTROL_TYPE.Checkbox,
                fieldControl: this.propertyDetailFormGroup.controls['futureDateOnly'],
                layoutDefine: {
                  row: ++rowCount,
                  column: 0
                },
                options: [],
                switchInput: true,
                iconLabelTooltip: '// TODO: descibe the field',
              },
              {
                id: 'PAST_DATE_ONLY',
                label: 'SETTING.PAST_DATE_ONLY',
                type: CONTROL_TYPE.Checkbox,
                fieldControl: this.propertyDetailFormGroup.controls['pastDateOnly'],
                layoutDefine: {
                  row: rowCount,
                  column: 1
                },
                options: [],
                switchInput: true,
                iconLabelTooltip: '// TODO: descibe the field',
              },
              {
                id: 'WEEKDAY_ONLY',
                label: 'SETTING.WEEKDAY_ONLY',
                type: CONTROL_TYPE.Checkbox,
                fieldControl: this.propertyDetailFormGroup.controls['weekdayOnly'],
                layoutDefine: {
                  row: ++rowCount,
                  column: 0
                },
                options: [],
                switchInput: true,
                iconLabelTooltip: '// TODO: descibe the field',
              },
              {
                id: 'WEEKEND_ONLY',
                label: 'SETTING.WEEKEND_ONLY',
                type: CONTROL_TYPE.Checkbox,
                fieldControl: this.propertyDetailFormGroup.controls['weekendOnly'],
                layoutDefine: {
                  row: rowCount,
                  column: 1
                },
                options: [],
                switchInput: true,
                iconLabelTooltip: '// TODO: descibe the field',
              },
              {
                id: 'DATE_RANGE_START',
                label: 'SETTING.DATE_RANGE_START',
                type: CONTROL_TYPE.Calendar,
                fieldControl: this.propertyDetailFormGroup.controls['dateRangeStart'],
                layoutDefine: {
                  row: ++rowCount,
                  column: 0
                },
                iconLabelTooltip: '// TODO: descibe the field',
              },
              {
                id: 'DATE_RANGE_END',
                label: 'SETTING.DATE_RANGE_END',
                type: CONTROL_TYPE.Calendar,
                fieldControl: this.propertyDetailFormGroup.controls['dateRangeEnd'],
                layoutDefine: {
                  row: rowCount,
                  column: 1
                },
                iconLabelTooltip: '// TODO: descibe the field',
              },
            ]
          );
          break;
        case 'SEL_S':
        case 'SEL_M':
        case 'CBX_M':
        case 'RAD':
          form = form.concat(
            [

            ]
          );
          break
        default: break;
      }
      this.propertyTypeFormConfig = form;
    });
  }

  getModuleListByModuleType(moduleType: string): Observable<OptionsModel[]> {
    return this.commonService.getAllModuleByModuleType(moduleType).pipe(
      map(res => {
        return res.data.map(val => ({
          value: val.moduleCode,
          label: val.moduleName
        }));
      })
    )
  }

  getModuleGroupList(): Observable<any[]> {
    return this.commonService.getSubModuleByModule(this.propertyDetailFormGroup.controls['module'].value).pipe(
      map(res => {
        return res.data.map(val => ({
          value: val.moduleCode,
          label: val.moduleName
        }));
      })
    );
  }

  addLookup() {
    let lookupForm = this.formBuilder.group({
      lookupName: new FormControl('', Validators.required),
      lookupCode: new FormControl('', Validators.required),
    });

    this.propertiesLookup.push(lookupForm);
  }

  deleteLookup(index: number) {
    this.propertiesLookup.removeAt(index);
  }

  toCreate() {
    this.initPropertyForm();
    this.isPropertyDialogVisible = true;
  }

  delete() {
    if (this.selectedProperty.find(p => p.isSystem)) {
      this.popMessage(this.translateService.instant("MESSAGE.CANNOT_DELETE_SYSTEM_PROPERTY"), "Error", "error");
    }
    else {
      // TODO: delete property
    }
  }

  closeDialog() {
    this.isPropertyDialogVisible = false;
    this.propertyDetailFormGroup.reset({ emitEvent: false });
    this.propertyTypeFormConfig = [];
  }

  create() {
    console.log(this.propertyDetailFormGroup.controls['propertiesLookup'].value)
  }

  returnFormControlLookUpName(form: any) {
    return (form as FormGroup).controls['lookupName'] as FormControl;
  }

  returnFormControlLookUpCode(form: any) {
    let fc: FormControl = ((form as FormGroup).controls['lookupCode'] as FormControl);
    let fcNameValue: string = ((form as FormGroup).controls['lookupName'] as FormControl).value;

    if (fcNameValue) {
      fc.setValue(fcNameValue.toLowerCase().trim().replace(/ /g, '_'), { emitEvent: false });
    }

    return fc;
  }
}
