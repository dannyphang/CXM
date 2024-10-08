import { Component } from '@angular/core';
import { ROW_PER_PAGE_DEFAULT, ROW_PER_PAGE_DEFAULT_LIST } from '../../../core/shared/constants/common.constants';
import { CommonService, PropertiesDto, PropertyGroupDto } from '../../../core/services/common.service';
import { BaseCoreAbstract } from '../../../core/shared/base/base-core.abstract';
import { MessageService } from 'primeng/api';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
  propertyCreateFormGroup: FormGroup = new FormGroup({
    label: new FormControl('', Validators.required),
    code: new FormControl('', Validators.required),
    module: new FormControl('', Validators.required),
    group: new FormControl('', Validators.required),
    type: new FormControl('', Validators.required),
    isUnique: new FormControl(false, Validators.required),
    isMandatory: new FormControl(false, Validators.required),
    isEditable: new FormControl(false, Validators.required),
    isVisible: new FormControl(false, Validators.required),
  })

  constructor(
    private commonService: CommonService,
    protected override messageService: MessageService,
    private translateService: TranslateService
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

    this.propertyCreateFormGroup.controls['label'].valueChanges.subscribe(val => {
      this.propertyCreateFormGroup.controls['code'].setValue(val.toLowerCase().trim().replace(/ /g, '_'));
    })
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
        fieldControl: this.propertyCreateFormGroup.controls['label'],
        layoutDefine: {
          row: 0,
          column: 0
        }
      },
      {
        label: 'SETTING.PROPERTY_CODE',
        type: CONTROL_TYPE.Textbox,
        fieldControl: this.propertyCreateFormGroup.controls['code'],
        layoutDefine: {
          row: 1,
          column: 0
        }
      },
      {
        id: 'PROPERTY_MODULE',
        label: 'SETTING.PROPERTY_MODULE',
        type: CONTROL_TYPE.Dropdown,
        fieldControl: this.propertyCreateFormGroup.controls['module'],
        layoutDefine: {
          row: 2,
          column: 0
        },
        options: this.moduleOptions
      },
      {
        label: 'SETTING.PROPERTY_GROUP',
        type: CONTROL_TYPE.Dropdown,
        fieldControl: this.propertyCreateFormGroup.controls['group'],
        layoutDefine: {
          row: 3,
          column: 0
        },
        dataSourceDependOn: ['PROPERTY_MODULE'],
        dataSourceAction: () => this.getModuleGroupList()
      },
      {
        label: 'SETTING.PROPERTY_TYPE',
        type: CONTROL_TYPE.Dropdown,
        fieldControl: this.propertyCreateFormGroup.controls['type'],
        layoutDefine: {
          row: 4,
          column: 0
        },
        dataSourceAction: () => this.getModuleListByModuleType('CONTROLTYPE')
      },
    ]
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
    return this.commonService.getSubModuleByModule(this.propertyCreateFormGroup.controls['module'].value).pipe(
      map(res => {
        return res.data.map(val => ({
          value: val.moduleCode,
          label: val.moduleName
        }));
      })
    );
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
    this.propertyCreateFormGroup.reset({ emitEvent: false })
  }

  create() {

  }
}
