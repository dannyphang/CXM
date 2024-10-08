import { Component } from '@angular/core';
import { ROW_PER_PAGE_DEFAULT, ROW_PER_PAGE_DEFAULT_LIST } from '../../../core/shared/constants/common.constants';
import { CommonService, PropertiesDto, PropertyGroupDto } from '../../../core/services/common.service';
import { BaseCoreAbstract } from '../../../core/shared/base/base-core.abstract';
import { MessageService } from 'primeng/api';
import { FormControl } from '@angular/forms';
import { CONTROL_TYPE_CODE, OptionsModel } from '../../../core/services/components.service';
import { TranslateService } from '@ngx-translate/core';

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

  constructor(
    private commonService: CommonService,
    protected override messageService: MessageService,
    private translateService: TranslateService
  ) {
    super(messageService);
  }

  ngOnInit() {
    this.moduleOptions = [
      {
        label: this.translateService.instant('COMMON.CONTACT'),
        value: 'CONT',
      },
      {
        label: this.translateService.instant('COMMON.COMPANY'),
        value: 'COMP',
      },
    ];

    this.getAllProperties('CONT');

    this.moduleFormControl.valueChanges.subscribe(val => {
      this.getAllProperties(val);
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

  toCreate() {

  }

  delete() {
    if (this.selectedProperty.find(p => p.isSystem)) {
      this.popMessage(this.translateService.instant("MESSAGE.CANNOT_DELETE_SYSTEM_PROPERTY"), "Error", "error");
    }
    else {
      // TODO: delete property
    }
  }
}
