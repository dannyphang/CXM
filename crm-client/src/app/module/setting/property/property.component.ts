import { Component } from '@angular/core';
import { ROW_PER_PAGE_DEFAULT, ROW_PER_PAGE_DEFAULT_LIST } from '../../../core/shared/constants/common.constants';
import { CommonService, CreatePropertyDto, CreatePropertyLookupDto, PropertiesDto, PropertyGroupDto, PropertyLookupDto, UpdatePropertyDto, UpdatePropertyLookupDto, UserDto } from '../../../core/services/common.service';
import { BaseCoreAbstract } from '../../../core/shared/base/base-core.abstract';
import { MessageService } from 'primeng/api';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CONTROL_TYPE, CONTROL_TYPE_CODE, FormConfig, OptionsModel } from '../../../core/services/components.service';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable, pairwise } from 'rxjs';
import { list } from 'firebase/storage';
import { AuthService } from '../../../core/services/auth.service';

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
    isEditable: new FormControl(true),
    isVisible: new FormControl(true),
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
  filterField: string[] = ['propertyName', 'propertyType', 'moduleCat', 'dealOwner', 'createdBy'];
  propertySearchFormControl: FormControl = new FormControl("");
  editable: boolean = true;
  editMode: boolean = false;

  constructor(
    private commonService: CommonService,
    protected override messageService: MessageService,
    private translateService: TranslateService,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    super(messageService);
  }

  ngOnInit() {
    this.getAllProperties('CONT');
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
          });
        });
        this.propertiesList.sort((a, b) => a.order - b.order);
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
        return this.returnUser(data);
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

  returnUser(uid: string): string {
    return (this.propertiesList.find(p => p.propertyType === 'USR')!.propertyLookupList as UserDto[]).find(u => u.uid === uid)?.displayName ?? uid;
  }

  initPropertyForm(editMode = false, typeCode: string = '') {
    this.editMode = editMode;

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

    if (editMode) {
      this.updateFormConfigFromTypeControl(typeCode);
    }

    this.propertyDetailFormGroup.controls['type'].valueChanges.subscribe(val => {
      this.updateFormConfigFromTypeControl(val);
    });

    // value changes 
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

    this.propertyDetailFormGroup.controls['propertiesLookup'].valueChanges
      .pipe(pairwise()).subscribe(([prev, next]) => {
        let defaultCount = 0;
        next.forEach((obj: {
          lookupName: string,
          lookupCode: string,
          isVisible: boolean,
          isDefault: boolean
        }) => {
          if (obj.isDefault) {
            defaultCount++;
          }
        });

        if (defaultCount > 1) {
          this.propertyDetailFormGroup.controls['propertiesLookup'].setValue(prev, { emitEvent: false });

          this.popMessage(this.translateService.instant('MESSAGE.ONLY_ONE_DEFAULT'), this.translateService.instant('MESSAGE.INVALID_FORM'), 'error');
        }
      });
  }

  updateFormConfigFromTypeControl(typeCode: string) {
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
    ];

    switch (typeCode) {
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
      isVisible: new FormControl(true, Validators.required),
      isDefault: new FormControl(false, Validators.required),
      statusId: new FormControl(1)
    });

    this.propertiesLookup.push(lookupForm);
  }

  deleteLookup(index: number) {
    this.propertiesLookup.removeAt(index);
  }

  editDeleteLookup(index: number) {
    this.propertiesLookup.value[index]['statusId'] = 2;
  }

  toCreate() {
    this.editable = true;
    this.propertyDetailFormGroup.enable();
    this.initPropertyForm();
    this.isPropertyDialogVisible = true;

    // init 1st lookup 
    this.addLookup();
  }

  toEdit(prop: PropertiesDto) {
    this.propertyDetailFormGroup = new FormGroup({
      label: new FormControl(prop.propertyName, Validators.required),
      code: new FormControl(prop.propertyCode, Validators.required),
      module: new FormControl(prop.moduleCode, Validators.required),
      group: new FormControl(prop.moduleCat, Validators.required),
      type: new FormControl(prop.propertyType, Validators.required),
      isUnique: new FormControl(prop.isUnique),
      isMandatory: new FormControl(prop.isMandatory),
      isEditable: new FormControl(prop.isEditable),
      isVisible: new FormControl(prop.isVisible),
      minLength: new FormControl(prop.minLength),
      maxLength: new FormControl(prop.maxLength),
      minValue: new FormControl(prop.minValue),
      maxValue: new FormControl(prop.maxValue),
      maxDecimal: new FormControl(prop.maxDecimal),
      numberOnly: new FormControl(prop.numberOnly),
      noSpecialChar: new FormControl(prop.noSpecialChar),
      futureDateOnly: new FormControl(prop.futureDateOnly),
      pastDateOnly: new FormControl(prop.pastDateOnly),
      weekdayOnly: new FormControl(prop.weekdayOnly),
      weekendOnly: new FormControl(prop.weekendOnly),
      dateRangeStart: new FormControl(prop.dateRangeStart),
      dateRangeEnd: new FormControl(prop.dateRangeEnd),
      regaxFormat: new FormControl(prop.regaxFormat),
      propertiesLookup: this.formBuilder.array([]),
    });
    this.returnPropertyLookupFormArray(prop).forEach(i => {
      this.propertiesLookup.push(this.formBuilder.group(i));
    })

    if (prop.isSystem) {
      this.editable = false;
      this.propertyDetailFormGroup.disable();
    }
    this.initPropertyForm(true, prop.propertyType);

    this.isPropertyDialogVisible = true;
  }

  returnPropertyLookupFormArray(prop: PropertiesDto): any[] {
    let formArr: {
      lookupName: string,
      lookupCode: string,
      isVisible: boolean,
      isDefault: boolean,
      statusId: number,
    }[] = [];
    (prop.propertyLookupList as PropertyLookupDto[]).forEach(p => {
      formArr.push({
        lookupName: p.propertyLookupLabel,
        lookupCode: p.propertyLookupCode,
        isVisible: p.isVisible,
        isDefault: p.isDefault,
        statusId: p.statusId ?? 1
      });
    });

    return formArr;
  }

  delete() {
    if (this.selectedProperty.find(p => p.isSystem)) {
      this.popMessage(this.translateService.instant("MESSAGE.CANNOT_DELETE_SYSTEM_PROPERTY"), "Error", "error");
    }
    else {
      this.commonService.deleteProperty(this.selectedProperty, this.authService.user?.uid ?? 'SYSTEM').subscribe(res => {
        if (res.isSuccess) {
          this.popMessage(res.responseMessage, this.translateService.instant('MESSAGE.SUCCESS'));
          this.getAllProperties(this.moduleFormControl.value ?? 'CONT');
        }
        else {
          this.popMessage(res.responseMessage, "Error", "error");
        }
      })
    }
  }

  closeDialog() {
    this.isPropertyDialogVisible = false;
    this.propertyDetailFormGroup.reset({ emitEvent: false });
    this.propertyTypeFormConfig = [];
    this.propertiesLookup.reset({ emitEvent: false });
    this.propertiesLookup.clear({ emitEvent: false });
    this.getAllProperties(this.moduleFormControl.value ?? 'CONT');
  }

  create() {
    this.propertyDetailFormGroup.markAllAsTouched();
    if (this.propertyDetailFormGroup.valid) {
      let createPropertyObj: CreatePropertyDto = {
        propertyName: this.propertyDetailFormGroup.controls['label'].value,
        propertyCode: this.propertyDetailFormGroup.controls['code'].value,
        moduleCode: this.propertyDetailFormGroup.controls['module'].value,
        moduleCat: this.propertyDetailFormGroup.controls['group'].value,
        propertyType: this.propertyDetailFormGroup.controls['type'].value,
        isUnique: this.propertyDetailFormGroup.controls['isUnique'].value,
        isMandatory: this.propertyDetailFormGroup.controls['isMandatory'].value,
        isEditable: this.propertyDetailFormGroup.controls['isEditable'].value,
        isVisible: this.propertyDetailFormGroup.controls['isVisible'].value,
        minLength: this.propertyDetailFormGroup.controls['minLength'].value,
        maxLength: this.propertyDetailFormGroup.controls['maxLength'].value,
        minValue: this.propertyDetailFormGroup.controls['minValue'].value,
        maxValue: this.propertyDetailFormGroup.controls['maxValue'].value,
        maxDecimal: this.propertyDetailFormGroup.controls['maxDecimal'].value,
        numberOnly: this.propertyDetailFormGroup.controls['numberOnly'].value,
        noSpecialChar: this.propertyDetailFormGroup.controls['noSpecialChar'].value,
        futureDateOnly: this.propertyDetailFormGroup.controls['futureDateOnly'].value,
        pastDateOnly: this.propertyDetailFormGroup.controls['pastDateOnly'].value,
        weekdayOnly: this.propertyDetailFormGroup.controls['weekdayOnly'].value,
        weekendOnly: this.propertyDetailFormGroup.controls['weekendOnly'].value,
        dateRangeStart: this.propertyDetailFormGroup.controls['dateRangeStart'].value,
        dateRangeEnd: this.propertyDetailFormGroup.controls['dateRangeEnd'].value,
        regaxFormat: this.propertyDetailFormGroup.controls['regaxFormat'].value,
        createdBy: this.authService.user?.uid,
        modifiedBy: this.authService.user?.uid,
        statusId: 1,
        dealOwner: this.authService.user?.uid ?? 'SYSTEM'
      }

      this.commonService.createProperties([createPropertyObj]).subscribe(res => {
        if (res.isSuccess) {
          // check if need to call another API to create lookup property list
          if (this.propertyDetailFormGroup.controls['propertiesLookup'].value?.length > 0) {
            let propertyId: number = res.data[0].propertyId;
            let createPropLookup: CreatePropertyLookupDto[] = (this.propertyDetailFormGroup.controls['propertiesLookup'].value as {
              lookupName: string,
              lookupCode: string,
              isVisible: boolean,
              isDefault: boolean
            }[]).map(item => ({
              propertyId: propertyId,
              propertyLookupLabel: item.lookupName,
              propertyLookupCode: item.lookupCode,
              moduleCode: this.propertyDetailFormGroup.controls['module'].value,
              isVisible: item.isVisible,
              isDefault: item.isDefault,
              isSystem: false,
              createdBy: this.authService.user?.uid,
              modifiedBy: this.authService.user?.uid,
              statusId: 1,
            }) as CreatePropertyLookupDto);

            this.commonService.createPropertyLookup(createPropLookup).subscribe(res => {
              if (res.isSuccess) {
                this.popMessage(res.responseMessage, this.translateService.instant('MESSAGE.SUCCESS'));
                this.closeDialog();
              }
              else {
                this.popMessage(res.responseMessage, "Error", "error");
              }
            });
          }
          else {
            this.popMessage(res.responseMessage, this.translateService.instant('MESSAGE.SUCCESS'));
            this.closeDialog();
          }
        }
        else {
          this.popMessage(res.responseMessage, "Error", "error");
        }
      });
    }
  }

  edit() {
    if (this.editable) {
      this.propertyDetailFormGroup.markAllAsTouched();
      if (this.propertyDetailFormGroup.valid) {
        let update: UpdatePropertyDto = {
          propertyName: this.propertyDetailFormGroup.controls['label'].value,
          propertyCode: this.propertyDetailFormGroup.controls['code'].value,
          moduleCode: this.propertyDetailFormGroup.controls['module'].value,
          moduleCat: this.propertyDetailFormGroup.controls['group'].value,
          propertyType: this.propertyDetailFormGroup.controls['type'].value,
          isUnique: this.propertyDetailFormGroup.controls['isUnique'].value,
          isMandatory: this.propertyDetailFormGroup.controls['isMandatory'].value,
          isEditable: this.propertyDetailFormGroup.controls['isEditable'].value,
          isVisible: this.propertyDetailFormGroup.controls['isVisible'].value,
          minLength: this.propertyDetailFormGroup.controls['minLength'].value,
          maxLength: this.propertyDetailFormGroup.controls['maxLength'].value,
          minValue: this.propertyDetailFormGroup.controls['minValue'].value,
          maxValue: this.propertyDetailFormGroup.controls['maxValue'].value,
          maxDecimal: this.propertyDetailFormGroup.controls['maxDecimal'].value,
          numberOnly: this.propertyDetailFormGroup.controls['numberOnly'].value,
          noSpecialChar: this.propertyDetailFormGroup.controls['noSpecialChar'].value,
          futureDateOnly: this.propertyDetailFormGroup.controls['futureDateOnly'].value,
          pastDateOnly: this.propertyDetailFormGroup.controls['pastDateOnly'].value,
          weekdayOnly: this.propertyDetailFormGroup.controls['weekdayOnly'].value,
          weekendOnly: this.propertyDetailFormGroup.controls['weekendOnly'].value,
          dateRangeStart: this.propertyDetailFormGroup.controls['dateRangeStart'].value,
          dateRangeEnd: this.propertyDetailFormGroup.controls['dateRangeEnd'].value,
          regaxFormat: this.propertyDetailFormGroup.controls['regaxFormat'].value
        }

        this.commonService.updateProperties([update], this.authService.user?.uid ?? 'SYSTEM').subscribe(res => {
          if (res.isSuccess) {
            if (this.propertyDetailFormGroup.controls['propertiesLookup'].value?.length > 0) {
              let updateLookupList: UpdatePropertyLookupDto[] = [];

              (this.propertyDetailFormGroup.controls['propertiesLookup'].value as {
                lookupName: string,
                lookupCode: string,
                isVisible: boolean,
                isDefault: boolean,
                statusId: number
              }[]).forEach(i => {
                updateLookupList.push({
                  propertyLookupLabel: i.lookupName,
                  propertyLookupCode: i.lookupCode,
                  isVisible: i.isVisible,
                  isDefault: i.isDefault,
                  statusId: i.statusId,
                });
              });

              this.commonService.updatePropertiesLookup(updateLookupList, this.authService.user?.uid ?? 'SYSTEM').subscribe(res => {
                if (res.isSuccess) {

                }
                else {
                  this.popMessage(res.responseMessage, "Error", "error");
                }
              });
            }
          }
          else {
            this.popMessage(res.responseMessage, "Error", "error");
          }
        })
      }
    }
    else {
      this.popMessage(this.translateService.instant('MESSAGE.PROPERTY_NOT_EDITABLE'), this.translateService.instant('MESSAGE.ERROR'), 'error');
    }
  }

  returnFormControlLookupObj(name: string, form: any): FormControl {
    switch (name) {
      case 'name':
        return (form as FormGroup).controls['lookupName'] as FormControl;
      case 'code':
        let fc: FormControl = ((form as FormGroup).controls['lookupCode'] as FormControl);
        let fcNameValue: string = ((form as FormGroup).controls['lookupName'] as FormControl).value;

        if (fcNameValue) {
          fc.setValue(fcNameValue.toLowerCase().trim().replace(/ /g, '_'), { emitEvent: false });
        }

        return fc;
      case 'visible':
        return (form as FormGroup).controls['isVisible'] as FormControl;
      case 'default':
        return (form as FormGroup).controls['isDefault'] as FormControl;
      default:
        return new FormControl();
    }
  }
}
