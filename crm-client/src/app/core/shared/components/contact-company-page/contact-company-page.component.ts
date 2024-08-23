import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BaseDataSourceActionEvent, CONTROL_TYPE, CONTROL_TYPE_CODE, FormConfig, OptionsModel, TableConfig } from '../../../services/components.service';
import { CommonService, CompanyDto, ContactDto, ModuleDto, PropertiesDto, PropertyDataDto } from '../../../services/common.service';
import { NavigationExtras, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { Observable, of } from 'rxjs';
import { ROW_PER_PAGE_DEFAULT, ROW_PER_PAGE_DEFAULT_LIST } from '../../constants/common.constants';

@Component({
  selector: 'app-contact-company-page',
  templateUrl: './contact-company-page.component.html',
  styleUrl: './contact-company-page.component.scss'
})
export class ContactCompanyPageComponent implements OnChanges {
  ROW_PER_PAGE_DEFAULT = ROW_PER_PAGE_DEFAULT;
  ROW_PER_PAGE_DEFAULT_LIST = ROW_PER_PAGE_DEFAULT_LIST;
  module: 'CONT' | 'COMP' = 'CONT';
  contactList: ContactDto[] = [];
  companyList: CompanyDto[] = [];
  modulePropertyList: ModuleDto[] = [];

  CONTROL_TYPE_CODE = CONTROL_TYPE_CODE;
  propertiesList: PropertiesDto[] = [];
  tableConfig: any[] = []; // from table config
  selectedProfile: ContactDto[] | CompanyDto[] = [];
  displayCreateDialog: boolean = false;
  createFormPropertyList: PropertiesDto[] = [];
  createFormConfig: FormConfig[] = [];
  createFormGroup: FormGroup;
  profileProperty: PropertiesDto[] = [];
  panelList: any[] = [];
  isShowFilter: boolean = false;
  filterFormGroup: FormGroup;
  conditionFormGroup: FormGroup;
  filterList: Filter[] = [];
  filterPropList: any[] = [];

  constructor(
    private commonService: CommonService,
    private router: Router,
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private messageService: MessageService
  ) {
    if (this.router.url === '/contact') {
      this.module = 'CONT';
    }
    else {
      this.module = 'COMP';
    }

    this.panelList = [
      {
        headerLabel: this.module === 'CONT' ? this.translateService.instant("COMMON.CONTACT") : this.translateService.instant("COMMON.COMPANY"),
        order: 0,
        closable: false,
      }
    ];
  }

  async ngOnInit() {
    this.initCreateFormConfig();
  }

  ngOnChanges(changes: SimpleChanges): void {

  }

  initCreateFormConfig() {
    let createPropCount = 0;
    let formsConfig: FormConfig[] = [];

    this.createFormGroup = this.formBuilder.group({});

    if (this.module === 'CONT') {
      this.getContact();
    }
    else {
      this.getCompany();
    }

    this.tableConfig = [];
    if (this.module === 'CONT') {
      this.tableConfig.push({
        header: "contactProfilePhotoUrl",
        code: "contactProfilePhotoUrl",
        order: 0
      })
    }
    else {
      this.tableConfig.push({
        header: "companyProfilePhotoUrl",
        code: "companyProfilePhotoUrl",
        order: 0
      })
    }


    this.commonService.getAllPropertiesByModule(this.module).subscribe((res) => {
      this.modulePropertyList = res;
      console.log(this.modulePropertyList);
      res.forEach((item) => {
        item.propertiesList.forEach((prop) => {
          this.propertiesList.push(prop);

          // only display property that is system property which is not storing inside the properties column
          if (!prop.isDefaultProperty) {
            let config: any = {
              header: prop.propertyName,
              code: this.bindCode(prop.propertyCode),
              order: prop.order
            };
            this.tableConfig.push(config);
            this.profileProperty.push(prop);
          }

          // for create contact/company properties
          if (prop.isMandatory && prop.isEditable) {
            this.createFormPropertyList.push(prop);

            let control = new FormControl(this.commonService.returnControlTypeEmptyValue(prop), prop.isMandatory ? Validators.required : null);
            this.createFormGroup.addControl(prop.propertyCode, control);

            let forms: FormConfig = {
              id: prop.uid,
              name: prop.propertyCode,
              type: CONTROL_TYPE.Textbox,
              label: prop.propertyName,
              fieldControl: this.createFormGroup.controls[prop.propertyCode],
              layoutDefine: {
                row: createPropCount,
                column: 0,
              }
            };

            if (prop.propertyType === CONTROL_TYPE_CODE.Textbox || prop.propertyType === CONTROL_TYPE_CODE.Textarea || prop.propertyType === CONTROL_TYPE_CODE.Email || prop.propertyType === CONTROL_TYPE_CODE.Phone || prop.propertyType === CONTROL_TYPE_CODE.Url || prop.propertyType === CONTROL_TYPE_CODE.Number) {
              forms = {
                id: prop.uid,
                name: prop.propertyCode,
                type: CONTROL_TYPE.Textbox,
                label: prop.propertyName,
                fieldControl: this.createFormGroup.controls[prop.propertyCode],
                layoutDefine: {
                  row: createPropCount,
                  column: 0,
                },
                mode: this.returnTextMode(prop.propertyType),
              }
            }
            else if (prop.propertyType === CONTROL_TYPE_CODE.Checkbox || prop.propertyType === CONTROL_TYPE_CODE.MultiCheckbox || prop.propertyType === CONTROL_TYPE_CODE.Multiselect || prop.propertyType === CONTROL_TYPE_CODE.Dropdown || prop.propertyType === CONTROL_TYPE_CODE.Radio) {
              let propertyLookupList: OptionsModel[] = [];
              prop.propertyLookupList.forEach((item) => {
                propertyLookupList.push({ label: item.propertyLookupLabel, value: item.uid });
              });

              forms = {
                id: prop.uid,
                name: prop.propertyCode,
                type: prop.propertyType === CONTROL_TYPE_CODE.Checkbox || prop.propertyType === CONTROL_TYPE_CODE.MultiCheckbox ? CONTROL_TYPE.Checkbox : prop.propertyType === CONTROL_TYPE_CODE.Multiselect ? CONTROL_TYPE.Multiselect : prop.propertyType === CONTROL_TYPE_CODE.Dropdown ? CONTROL_TYPE.Dropdown : CONTROL_TYPE.Radio,
                label: prop.propertyName,
                fieldControl: this.createFormGroup.controls[prop.propertyCode],
                layoutDefine: {
                  row: createPropCount,
                  column: 0,
                },
                options: propertyLookupList,
              }
            }
            else if (prop.propertyType === CONTROL_TYPE_CODE.DateTime || prop.propertyType === CONTROL_TYPE_CODE.Date || prop.propertyType === CONTROL_TYPE_CODE.Time) {
              forms = {
                id: prop.uid,
                name: prop.propertyCode,
                type: CONTROL_TYPE.Calendar,
                label: prop.propertyName,
                fieldControl: this.createFormGroup.controls[prop.propertyCode],
                layoutDefine: {
                  row: createPropCount,
                  column: 0,
                },
                timeOnly: prop.propertyType === CONTROL_TYPE_CODE.Time ? true : false,
                showTime: prop.propertyType !== CONTROL_TYPE_CODE.Date ? true : false
              }
            }

            formsConfig.push(forms);
            createPropCount++;

          }



        });
      });

      this.createFormConfig = formsConfig;

      // sort table column
      this.tableConfig = this.tableConfig.sort((a, b) => a.order - b.order);
    });
  }

  getContact() {
    this.commonService.getAllContact().subscribe((res) => {
      this.contactList = res;
    });
  }

  getCompany() {
    this.commonService.getAllCompany().subscribe((res) => {
      this.companyList = res;
    });
  }

  bindCode(code: string) {
    if (this.module === 'CONT') {
      switch (code) {
        case 'contact_owner': return 'contactOwnerUid';
        case 'first_name': return 'contactFirstName';
        case 'last_name': return 'contactLastName';
        case 'email': return 'contactEmail';
        case 'phone_number': return 'contactPhone';
        case 'lead_status': return 'contactLeadStatusId';
        case 'created_date': return 'createdDate';
        case 'created_by': return 'createdBy';
        case 'last_modified_date': return 'modifiedDate';
        case 'last_modified_by': return 'modifiedBy';
        default: return '';
      }
    }
    else {
      switch (code) {
        case 'company_owner': return 'companyOwnerUid';
        case 'company_name': return 'companyName';
        case 'company_email': return 'companyEmail';
        case 'lead_status': return 'companyLeadStatusId';
        case 'company_website_url': return 'companyWebsite';
        case 'created_date': return 'createdDate';
        case 'created_by': return 'createdBy';
        case 'last_modified_date': return 'modifiedDate';
        case 'last_modified_by': return 'modifiedBy';
        default: return '';
      }
    }
  }

  returnTextMode(type: string): any {
    switch (type) {
      case CONTROL_TYPE_CODE.Email:
        return 'email';
      case CONTROL_TYPE_CODE.Phone:
        return 'phone';
      case CONTROL_TYPE_CODE.Url:
        return 'url';
      case CONTROL_TYPE_CODE.Number:
        return 'number';
    }

    return 'text';
  }

  convertDateFormat(date: any) {
    return new Date(date).toLocaleDateString();
  }

  exportFile(data: any) {
    console.log(data)
  }

  importFile() {

  }

  downloadTemplate() {
    // Create a workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(this.translateService.instant(this.module === 'CONT' ? 'COMMON.CONTACT' : 'COMMON.COMPANY'));

    worksheet.columns = this.createFormConfig.map(item => ({
      header: <string>item.label,
      key: item.name!,
    }));

    let letter = 'A';
    let count = 0;
    this.createFormConfig.forEach(item => {
      let cell = String.fromCharCode(letter.charCodeAt(0) + count);
      count++;

      if (item.type === CONTROL_TYPE.Dropdown || item.type === CONTROL_TYPE.Multiselect || item.type === CONTROL_TYPE.Checkbox || item.type === CONTROL_TYPE.Radio) {
        let list = item.options!.map(dp => dp.label!).join(',');
        list = `"${list}"`;
        for (let i = 2; i < 100; i++) {
          worksheet.getCell(`${cell}${i}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [list],  // Set the dropdown options
            showErrorMessage: true,
            errorTitle: 'Invalid Selection',
            error: 'Please select a value from the list.',
          };
        }
      }
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'dropdown-example.xlsx');
    });
  }

  toProfile(profile: ContactDto | CompanyDto) {
    const navigationExtras: NavigationExtras = {
      state: {
        module: this.module
      }
    };

    if (this.module === 'CONT') {
      this.router.navigate(['contact/profile/' + profile.uid], navigationExtras);
    }
    else {
      this.router.navigate(['company/profile/' + profile.uid], navigationExtras);
    }
  }

  toCreate() {
    this.displayCreateDialog = true;
  }

  create() {
    if (this.createFormGroup.valid) {
      this.propertyValueUpdate(this.createFormConfig);
    }
    else {
      console.log(this.createFormGroup)
    }
  }

  propertyValueUpdate(form: any[]) {
    let newContact: ContactDto = new ContactDto();
    let newCompany: CompanyDto = new CompanyDto();
    let profileProperty: PropertyDataDto[] = [];

    this.createFormPropertyList.forEach(prop => {
      if (this.module === 'CONT') {
        switch (prop.propertyCode) {
          case ('first_name'):
            newContact.contactFirstName = form.find((item: any) => item.name === 'first_name').fieldControl.value;
            break;
          case ('last_name'):
            newContact.contactLastName = form.find((item: any) => item.name === 'last_name').fieldControl.value;
            break;
          case ('email'):
            newContact.contactEmail = form.find((item: any) => item.name === 'email').fieldControl.value;
            break;
          case ('phone_number'):
            newContact.contactPhone = form.find((item: any) => item.name === 'phone_number').fieldControl.value;
            break;
          default:
            let inputValue = form.find(item => item.name === prop.propertyCode)?.fieldControl.value;
            if (inputValue) {
              profileProperty.push({
                uid: prop.uid,
                propertyCode: prop.propertyCode,
                value: inputValue
              });
            }
        }
      }
      else {
        switch (prop.propertyCode) {
          case ('company_name'):
            newCompany.companyName = form.find((item: any) => item.name === 'company_name').fieldControl.value;
            break;
          case ('company_website'):
            newCompany.companyWebsite = form.find((item: any) => item.name === 'company_website').fieldControl.value;
            break;
          case ('company_website_url'):
            newCompany.companyEmail = form.find((item: any) => item.name === 'company_website_url').fieldControl.value;
            break;
          default:
            let inputValue = form.find(item => item.name === prop.propertyCode)?.fieldControl.value;
            if (inputValue) {
              profileProperty.push({
                uid: prop.uid,
                propertyCode: prop.propertyCode,
                value: inputValue
              });
            }
        }
      }
    });
    if (this.module === "CONT") {
      newContact.contactProperties = JSON.stringify(profileProperty);
      this.commonService.createContact([newContact]).subscribe(res => {
        this.displayCreateDialog = false;

        this.getContact();
      });
    }
    else {
      newCompany.companyProperties = JSON.stringify(profileProperty);
      this.commonService.createCompany([newCompany]).subscribe(res => {
        this.displayCreateDialog = false;

        this.getCompany();
      });
    }


    return;
  }

  delete() {
    if (this.module === 'CONT') {
      this.commonService.deleteContact(this.selectedProfile as ContactDto[]).subscribe(res => {
        this.getContact();
      });
    }
    else {
      this.commonService.deleteCompany(this.selectedProfile as CompanyDto[]).subscribe(res => {
        this.getContact();
      });
    }
  }

  addTab() {
    console.log("add tab");
    this.panelList.push({
      headerLabel: 'TEST',
      order: 1,
      closable: true,
    })
  }

  advanceFilterBtn() {
    if (this.propertiesList.length > 0) {
      this.isShowFilter = true;
      this.filterFormGroup = this.formBuilder.group({});
      this.conditionFormGroup = this.formBuilder.group({});
      this.propertiesList.forEach(prop => {
        let control = new FormControl();
        let control2 = new FormControl();
        this.filterFormGroup.addControl(prop.propertyCode, control);
        this.conditionFormGroup.addControl(prop.propertyCode, control2);
        let icon = '';
        switch (prop.propertyType) {
          case CONTROL_TYPE_CODE.Dropdown:
          case CONTROL_TYPE_CODE.Multiselect:
          case CONTROL_TYPE_CODE.Checkbox:
          case CONTROL_TYPE_CODE.MultiCheckbox:
            icon = 'pi pi-clone';
            break;
          case CONTROL_TYPE_CODE.Time:
          case CONTROL_TYPE_CODE.Date:
          case CONTROL_TYPE_CODE.DateTime:
            icon = 'pi pi-calendar';
            break;
          case CONTROL_TYPE_CODE.Country:
          case CONTROL_TYPE_CODE.City:
          case CONTROL_TYPE_CODE.State:
          case CONTROL_TYPE_CODE.Postcode:
            icon = 'pi pi-globe';
            break;
          case CONTROL_TYPE_CODE.Number:
            icon = 'pi pi-hashtag';
            break;
          case CONTROL_TYPE_CODE.User:
            icon = 'pi pi-user';
            break;
          case CONTROL_TYPE_CODE.Year:
            icon = 'pi pi-hashtag';
            break;
          default:
            icon = 'pi pi-language';
            break;
        }
        this.filterPropList.push({
          property: prop,
          filterFieldControl: this.filterFormGroup.controls[prop.propertyCode],
          conditionFieldControl: this.conditionFormGroup.controls[prop.propertyCode],
          condition: [],
          icon: icon,
        });
      });
    }
    else {
      this.messageService.add({ severity: 'info', summary: 'Loading', detail: this.translateService.instant('COMMON.DATA_LOADING') });
    }
  }

  closeFilter() {
    this.isShowFilter = false;
    this.filterList = [];
  }

  filterClick(prop: PropertiesDto) {
    if (!this.filterList.find(item => item.property === prop)) {

      let mode = '';
      switch (prop.propertyType) {
        case CONTROL_TYPE_CODE.Dropdown:
        case CONTROL_TYPE_CODE.Multiselect:
        case CONTROL_TYPE_CODE.Checkbox:
        case CONTROL_TYPE_CODE.MultiCheckbox:
          mode = CONTROL_TYPE.Multiselect;
          break;
        case CONTROL_TYPE_CODE.Time:
        case CONTROL_TYPE_CODE.Date:
        case CONTROL_TYPE_CODE.DateTime:
          mode = 'date';
          break;
        case CONTROL_TYPE_CODE.Country:
        case CONTROL_TYPE_CODE.City:
        case CONTROL_TYPE_CODE.State:
        case CONTROL_TYPE_CODE.Postcode:
          mode = CONTROL_TYPE.Multiselect;
          break;
        case CONTROL_TYPE_CODE.Number:
          mode = 'number'
          break;
        case CONTROL_TYPE_CODE.Year:
          mode = 'year'
          break;
        default:
          mode = 'text';
          break;
      }

      this.filterList.push({
        property: prop,
        condition: this.getConditionList(prop),
        options: () => this.getValueList(prop),
        filterFieldControl: <FormControl>this.filterFormGroup.controls[prop.propertyCode],
        conditionFieldControl: <FormControl>this.conditionFormGroup.controls[prop.propertyCode],
        mode: mode,
      });
    }

  }

  deleteFilter(prop: PropertiesDto) {
    this.filterList = this.filterList.filter(item => {
      item.property === prop
    })
  }

  getConditionList(prop: PropertiesDto): OptionsModel[] {
    let conditionList: OptionsModel[] = [];
    switch (prop.propertyType) {
      case CONTROL_TYPE_CODE.Textbox:
      case CONTROL_TYPE_CODE.Textarea:
      case CONTROL_TYPE_CODE.Url:
      case CONTROL_TYPE_CODE.Email:
      case CONTROL_TYPE_CODE.Phone:
      case CONTROL_TYPE_CODE.Dropdown:
      case CONTROL_TYPE_CODE.Multiselect:
      case CONTROL_TYPE_CODE.Checkbox:
      case CONTROL_TYPE_CODE.MultiCheckbox:
      case CONTROL_TYPE_CODE.Country:
      case CONTROL_TYPE_CODE.State:
      case CONTROL_TYPE_CODE.City:
      case CONTROL_TYPE_CODE.Postcode:
      case CONTROL_TYPE_CODE.User:
        conditionList = [
          {
            label: `${this.translateService.instant("INPUT.EQUAL_TO")} (==)`,
            value: 'equal_to',
          },
          {
            label: `${this.translateService.instant("INPUT.NOT_EQUAL_TO")} (!=)`,
            value: 'not_equal_to',
          },
          {
            label: this.translateService.instant("INPUT.IS_KNOWN"),
            value: 'is_known',
          },
          {
            label: this.translateService.instant("INPUT.IS_NOT_KNOWN"),
            value: 'is_not_known',
          }
        ];
        break;
      case CONTROL_TYPE_CODE.Number:
      case CONTROL_TYPE_CODE.Year:
        conditionList = [
          {
            label: `${this.translateService.instant("INPUT.EQUAL_TO")} (==)`,
            value: 'equal_to',
          },
          {
            label: `${this.translateService.instant("INPUT.NOT_EQUAL_TO")} (!=)`,
            value: 'not_equal_to',
          },
          {
            label: `${this.translateService.instant("INPUT.MORE_THAN_EQUAL_TO")} (>=)`,
            value: 'more_than_equal_to',
          },
          {
            label: `${this.translateService.instant("INPUT.MORE_THAN")} (>)`,
            value: 'more_than',
          },
          {
            label: `${this.translateService.instant("INPUT.LESS_THAN_EQUAL_TO")} (<=)`,
            value: 'less_than_equal_to',
          },
          {
            label: `${this.translateService.instant("INPUT.LESS_THAN")} (<)`,
            value: 'less_than',
          },
          {
            label: this.translateService.instant("INPUT.IS_KNOWN"),
            value: 'is_known',
          },
          {
            label: this.translateService.instant("INPUT.IS_NOT_KNOWN"),
            value: 'is_not_known',
          }
        ];
        break;
    }
    return conditionList;
  }

  getValueList(prop: PropertiesDto): Observable<OptionsModel[]> {
    let list: OptionsModel[] = [];

    switch (prop.propertyType) {
      case CONTROL_TYPE_CODE.Dropdown:
      case CONTROL_TYPE_CODE.Multiselect:
      case CONTROL_TYPE_CODE.Checkbox:
      case CONTROL_TYPE_CODE.MultiCheckbox:
        list = this.propertiesList.find(prop1 => prop1.uid === prop.uid)!.propertyLookupList!.map(item => ({
          label: item.propertyLookupLabel,
          value: item.uid
        }));
        break;
    }

    return of(list);
  }

  filterSubmit() {
    this.filterList.forEach(item => {
      console.log("Condition: " + this.conditionFormGroup.controls[item.property.propertyCode].value);
      console.log("filter: " + this.filterFormGroup.controls[item.property.propertyCode].value);
      console.log('-----------');
    })
  }
}

class Filter {
  property: PropertiesDto;
  condition: OptionsModel[];
  options: ((event?: BaseDataSourceActionEvent) => Observable<any>);
  filterFieldControl: FormControl;
  conditionFieldControl: FormControl;
  mode: any;
}