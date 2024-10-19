import { Component, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as ExcelJS from 'exceljs';
import saveAs from 'file-saver';
import { MessageService } from 'primeng/api';
import { debounceTime, distinctUntilChanged, map, Observable, of } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { CommonService, CompanyDto, ContactDto, PropertiesDto, PropertyDataDto, PropertyGroupDto, PropertyLookupDto, UserDto } from '../../../services/common.service';
import { BaseDataSourceActionEvent, CONTROL_TYPE, CONTROL_TYPE_CODE, FormConfig, OptionsModel } from '../../../services/components.service';
import { ROW_PER_PAGE_DEFAULT, ROW_PER_PAGE_DEFAULT_LIST, EMPTY_VALUE_STRING, NUMBER_OF_EXCEL_INSERT_ROW } from '../../constants/common.constants';
import * as XLSX from 'xlsx';
import { BaseCoreAbstract } from '../../base/base-core.abstract';

@Component({
  selector: 'app-contact-company-page',
  templateUrl: './contact-company-page.component.html',
  styleUrl: './contact-company-page.component.scss'
})
export class ContactCompanyPageComponent extends BaseCoreAbstract implements OnChanges {
  ROW_PER_PAGE_DEFAULT = ROW_PER_PAGE_DEFAULT;
  ROW_PER_PAGE_DEFAULT_LIST = ROW_PER_PAGE_DEFAULT_LIST;
  EMPTY_VALUE_STRING = EMPTY_VALUE_STRING;
  NUMBER_OF_EXCEL_INSERT_ROW = NUMBER_OF_EXCEL_INSERT_ROW;
  module: 'CONT' | 'COMP' = 'CONT';
  contactList: ContactDto[] = [];
  companyList: CompanyDto[] = [];
  modulePropertyList: PropertyGroupDto[] = [];

  CONTROL_TYPE_CODE = CONTROL_TYPE_CODE;
  propertiesList: PropertiesDto[] = [];
  propertiesList2: PropertiesDto[] = [];
  activeTabPanel: number = 0;
  columnPropertiesList: any[][] = [];
  tableConfig: any[] = []; // from table config
  tableLoading: boolean[] = [];
  selectedProfile: ContactDto[] | CompanyDto[] = [];
  displayCreateDialog: boolean = false;
  createFormPropertyList: PropertiesDto[] = [];
  createFormConfig: FormConfig[] = [];
  createFormGroup: FormGroup;
  profileProperty: PropertiesDto[] = [];
  panelList: any[] = [];
  isShowFilter: boolean = false;
  isShowTableColumnFilter: boolean = false;
  filterFormGroup: FormGroup;
  conditionFormGroup: FormGroup;
  tabFilterList: any[] = [];
  tempFilterList: any[] = [];
  tempColumnFilterList: PropertiesDto[] = [];
  filterPropList: any[] = [];
  filterSearch: FormControl = new FormControl("");
  headerKeyMapping: { [header: string]: string } = {};
  countryFormId: string = "";
  stateFormId: string = "";
  countryOptionList: OptionsModel[] = [];
  stateList: Observable<OptionsModel[]>;

  constructor(
    private commonService: CommonService,
    private router: Router,
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    protected override messageService: MessageService,
    private authService: AuthService,
  ) {
    super(messageService);

    if (this.router.url === '/contact') {
      this.module = 'CONT';
    }
    else {
      this.module = 'COMP';
    }

    this.panelList = [
      {
        headerLabel: this.module === 'CONT' ? this.translateService.instant("COMMON.CONTACT") : this.translateService.instant("COMMON.COMPANY"),
        closable: false,
        index: 0,
      }
    ];
    this.tabFilterList[this.activeTabPanel] = [];
    this.tempFilterList[this.activeTabPanel] = [];
    this.columnPropertiesList[this.activeTabPanel] = [];
  }

  async ngOnInit() {
    this.commonService.getAllCountry().subscribe(res => {
      if (res.isSuccess) {
        this.countryOptionList = res.data.map(c => {
          return {
            label: c.name,
            value: c.uid
          }
        });
      }
      else {
        this.popMessage(res.responseMessage, "Error", "error");
      }
    });
    this.initTableConfig();
    this.initCreateFormConfig();
    // this.filterTableConfig();
  }

  ngOnChanges(changes: SimpleChanges): void {

  }

  returnTranslate(text: string): string {
    return this.commonService.translate(text);
  }

  initTableConfig() {
    this.tableConfig[this.activeTabPanel] = [];
    if (this.module === 'CONT') {
      this.tableConfig[this.activeTabPanel].push({
        header: "contactProfilePhotoUrl",
        code: "contactProfilePhotoUrl",
        order: 0
      });
    }
    else {
      this.tableConfig[this.activeTabPanel].push({
        header: "companyProfilePhotoUrl",
        code: "companyProfilePhotoUrl",
        order: 0
      })
    }
  }

  initCreateFormConfig() {
    this.tableLoading[this.activeTabPanel] = true;
    let createPropCount = 0;
    let formsConfig: FormConfig[] = [];

    this.createFormGroup = this.formBuilder.group({});

    if (this.module === 'CONT') {
      this.getContact();
    }
    else {
      this.getCompany();
    }

    this.commonService.getAllPropertiesByModule(this.module, this.authService.tenant?.uid).subscribe((res) => {
      if (res.isSuccess) {
        this.modulePropertyList = res.data;

        res.data.forEach((item) => {
          item.propertiesList.forEach((prop) => {
            this.propertiesList.push(prop);
            this.propertiesList2.push(prop);
            this.headerKeyMapping[prop.propertyName] = prop.propertyCode;

            if (this.module === 'CONT') {
              this.contactList.forEach(cont => {
                let contactProp: PropertyDataDto[] = JSON.parse(cont.contactProperties);

                contactProp.forEach(p => {
                  cont[p.propertyCode] = p.value;
                });
              })
            }
            else {

            }

            // only display property that is system property which is not storing inside the properties column
            if (!prop.isDefaultProperty) {
              this.profileProperty.push(prop);
              if (prop.isVisible) {
                let config: any = {
                  header: prop.propertyName,
                  code: this.bindCode(prop.propertyCode),
                  order: prop.order,
                  type: prop.propertyType
                };
                this.tableConfig[this.activeTabPanel].push(config);
              }
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
                  propertyLookupList.push({ label: (item as PropertyLookupDto).propertyLookupLabel, value: item.uid });
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
              else if (prop.propertyType === CONTROL_TYPE_CODE.User) {
                let propertyLookupList: OptionsModel[] = [];
                prop.propertyLookupList.forEach((item) => {
                  propertyLookupList.push({ label: `${(item as UserDto).displayName}`, value: item.uid });
                });

                forms = {
                  id: prop.uid,
                  name: prop.propertyCode,
                  type: CONTROL_TYPE.Dropdown,
                  label: prop.propertyName,
                  fieldControl: this.createFormGroup.controls[prop.propertyCode],
                  layoutDefine: {
                    row: createPropCount,
                    column: 0,
                  },
                  options: propertyLookupList
                }
              }
              else if (prop.propertyType === CONTROL_TYPE_CODE.Country) {
                this.countryFormId = prop.uid;
                forms = {
                  id: prop.uid,
                  name: prop.propertyCode,
                  type: CONTROL_TYPE.Dropdown,
                  label: prop.propertyName,
                  fieldControl: this.createFormGroup.controls[prop.propertyCode],
                  layoutDefine: {
                    row: createPropCount,
                    column: 0,
                  },
                  options: this.countryOptionList
                }
              }
              else if (prop.propertyType === CONTROL_TYPE_CODE.State) {
                this.stateFormId = prop.uid;
                forms = {
                  id: prop.uid,
                  name: prop.propertyCode,
                  type: CONTROL_TYPE.Dropdown,
                  label: prop.propertyName,
                  fieldControl: this.createFormGroup.controls[prop.propertyCode],
                  layoutDefine: {
                    row: createPropCount,
                    column: 0,
                  },
                  dataSourceDependOn: [this.countryFormId],
                  dataSourceAction: () => this.getStateList()
                }
              }
              else if (prop.propertyType === CONTROL_TYPE_CODE.City) {
                forms = {
                  id: prop.uid,
                  name: prop.propertyCode,
                  type: CONTROL_TYPE.Dropdown,
                  label: prop.propertyName,
                  fieldControl: this.createFormGroup.controls[prop.propertyCode],
                  layoutDefine: {
                    row: createPropCount,
                    column: 0,
                  },
                  dataSourceDependOn: [this.stateFormId],
                  dataSourceAction: () => this.getCityList()
                }
              }
              else if (prop.propertyType === CONTROL_TYPE_CODE.Postcode) {
                forms = {
                  id: prop.uid,
                  name: prop.propertyCode,
                  type: CONTROL_TYPE.Textbox,
                  label: prop.propertyName,
                  fieldControl: this.createFormGroup.controls[prop.propertyCode],
                  layoutDefine: {
                    row: createPropCount,
                    column: 0,
                  }
                }
              }

              formsConfig.push(forms);
              createPropCount++;
            }
          });
        });

        this.createFormConfig = formsConfig;

        // sort table column
        this.tableConfig[this.activeTabPanel] = this.tableConfig[this.activeTabPanel].sort((a: any, b: any) => a.order - b.order);
        this.tableLoading[this.activeTabPanel] = false;
      }
      else {
        this.popMessage(res.responseMessage, "Error", "error");
      }
    });
  }

  returnFilteredProfileList() {
    if (this.module === 'CONT') {
      let tempProfileList: ContactDto[] = [];
      if (this.tabFilterList[this.activeTabPanel].length === 0) {
        this.getContact();
      }
      else {
        this.commonService.getAllContact().subscribe(res => {
          if (res.isSuccess) {
            this.tableLoading[this.activeTabPanel] = true;
            this.tabFilterList[this.activeTabPanel].forEach((item: Filter) => {
              // get state and city uid from input name 
              if (item.property.propertyCode === 'state') {
                this.commonService.getStateByStateName(item.filterFieldControl.value).subscribe(res => {
                  if (res.isSuccess) {
                    if (res.data.length == 1) {
                      item.filterFieldControl.setValue(res.data[0].uid);
                    }
                    else {
                      this.popMessage('Something wrong on searching of State', "Error", "error");
                    }
                  }
                  else {
                    this.popMessage(res.responseMessage, "Error", "error");
                  }
                });
              }
              else if (item.property.propertyCode === 'city') {
                this.commonService.getCityByCityName(item.filterFieldControl.value).subscribe(res => {
                  if (res.isSuccess) {
                    if (res.data.length == 1) {
                      item.filterFieldControl.setValue(res.data[0].uid);
                    }
                    else {
                      this.popMessage('Something wrong on searching of City', "Error", "error");
                    }
                  }
                  else {
                    this.popMessage(res.responseMessage, "Error", "error");
                  }
                });
              }

              res.data.forEach(cont => {
                let proProp: PropertyDataDto[] = JSON.parse(cont.contactProperties);
                proProp.forEach(p => {
                  cont[p.propertyCode] = p.value;
                });

                proProp.push(
                  {
                    uid: this.propertiesList.find(i => i.propertyCode === 'first_name')!.uid,
                    propertyCode: 'first_name',
                    value: cont.contactFirstName,
                  },
                  {
                    uid: this.propertiesList.find(i => i.propertyCode === 'last_name')!.uid,
                    propertyCode: 'last_name',
                    value: cont.contactLastName,
                  },
                  {
                    uid: this.propertiesList.find(i => i.propertyCode === 'email')!.uid,
                    propertyCode: 'email',
                    value: cont.contactEmail ?? '',
                  },
                  {
                    uid: this.propertiesList.find(i => i.propertyCode === 'phone_number')!.uid,
                    propertyCode: 'phone_number',
                    value: cont.contactPhone ?? '',
                  },
                  {
                    uid: this.propertiesList.find(i => i.propertyCode === 'created_date')!.uid,
                    propertyCode: 'created_date',
                    value: cont.createdDate!.toString(),
                  },
                  {
                    uid: this.propertiesList.find(i => i.propertyCode === 'last_modified_date')!.uid,
                    propertyCode: 'last_modified_date',
                    value: cont.modifiedDate!.toString(),
                  },
                  {
                    uid: this.propertiesList.find(i => i.propertyCode === 'created_by')!.uid,
                    propertyCode: 'created_by',
                    value: cont.createdBy ?? "",
                  },
                  {
                    uid: this.propertiesList.find(i => i.propertyCode === 'last_modified_by')!.uid,
                    propertyCode: 'last_modified_by',
                    value: cont.modifiedBy ?? "",
                  },
                  {
                    uid: this.propertiesList.find(i => i.propertyCode === 'lead_status')!.uid,
                    propertyCode: 'lead_status',
                    value: this.returnLeadStatusLabelFromId(cont.contactLeadStatusUid ?? ''),
                  },
                  {
                    uid: this.propertiesList.find(i => i.propertyCode === 'contact_owner')!.uid,
                    propertyCode: 'contact_owner',
                    value: cont.contactOwnerUid ?? "",
                  },
                );

                if (item.conditionFieldControl.value === 'is_not_known') {
                  // for properties
                  if (!proProp.find(p => p.uid === item.property.uid)) {
                    tempProfileList.push(cont);
                  }
                  // for default object like contact owner
                  else if (!proProp.find(p => p.uid === item.property.uid)?.value) {
                    tempProfileList.push(cont);
                  }
                }
                else if (item.conditionFieldControl.value === 'not_equal_to') {
                  if (!proProp.find(p => p.uid === item.property.uid) || !proProp.find(p => p.uid === item.property.uid)?.value.toLowerCase().includes(item.filterFieldControl.value.toString().toLowerCase())) {
                    tempProfileList.push(cont);
                  }
                }
                else {
                  proProp.forEach(propData => {
                    let propValue: any;
                    let itemValue: any;

                    switch (item.mode) {
                      case 'date':
                      case 'datetime':
                      case 'time':
                        itemValue = new Date(item.filterFieldControl.value);
                        propValue = new Date(propData.value);
                        break;
                      default:
                        itemValue = item.filterFieldControl.value;
                        propValue = propData.value;
                        break;
                    }

                    switch (item.conditionFieldControl.value) {
                      case 'equal_to':
                        if (propData.uid === item.property.uid && propData.value.toLowerCase().includes(item.filterFieldControl.value.toString().toLowerCase())) {
                          tempProfileList.push(cont);
                        }
                        break;
                      case 'is_known':
                        if (propData.uid === item.property.uid && propData.value) {
                          tempProfileList.push(cont);
                        }
                        break;
                      case 'more_than_equal_to':
                        if (propData.uid === item.property.uid && propValue >= itemValue) {
                          tempProfileList.push(cont);
                        }
                        break;
                      case 'less_than_equal_to':
                        if (propData.uid === item.property.uid && propValue <= itemValue) {
                          tempProfileList.push(cont);
                        }
                        break;
                      case 'more_than':
                        if (propData.uid === item.property.uid) {
                          console.log(propValue)
                          console.log(itemValue)
                          console.log(propValue > itemValue)
                        }
                        if (propData.uid === item.property.uid && propValue > itemValue) {
                          tempProfileList.push(cont);
                        }
                        break;
                      case 'less_than':
                        if (propData.uid === item.property.uid && propValue < itemValue) {
                          tempProfileList.push(cont);
                        }
                        break;
                    }
                  });
                }
              });

              tempProfileList
            });
            this.contactList = [];
            tempProfileList.forEach(cont => {
              if (!this.contactList.includes(cont)) {
                this.contactList.push(cont);
              }
            });
            this.tableLoading[this.activeTabPanel] = false;
          }
          else {
            this.popMessage(res.responseMessage, "Error", "error");
          }
        });
      }
    }
    else {

    }


    return [];
  }

  getContact() {
    this.tableLoading[this.activeTabPanel] = true;
    this.commonService.getAllContact().subscribe((res) => {
      if (res.isSuccess) {
        res.data.forEach(cont => {
          let prop: PropertyDataDto[] = JSON.parse(cont.contactProperties);

          prop.forEach(p => {
            cont[p.propertyCode] = p.value;
          });
        });

        this.contactList = res.data;
        this.tableLoading[this.activeTabPanel] = false;
      }
      else {
        this.popMessage(res.responseMessage, "Error", "error");
      }
    });
  }

  getCompany() {
    this.tableLoading[this.activeTabPanel] = true;
    this.commonService.getAllCompany().subscribe((res) => {
      if (res.isSuccess) {
        this.companyList = res.data;
        this.tableLoading[this.activeTabPanel] = false;
      }
      else {
        this.popMessage(res.responseMessage, "Error", "error");
      }

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
        case 'lead_status': return 'contactLeadStatusUid';
        case 'created_date': return 'createdDate';
        case 'created_by': return 'createdBy';
        case 'last_modified_date': return 'modifiedDate';
        case 'last_modified_by': return 'modifiedBy';
        default: return code;
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
        default: return code;
      }
    }
  }

  mapToContactDto(mappedData: any): ContactDto[] {
    return mappedData.map((data: any) => {
      let contactDto: ContactDto = new ContactDto();

      let prop: PropertyDataDto[] = [];

      // Iterate through each key-value pair in the data object
      Object.keys(data).forEach(key => {
        // Use bindCode to get the ContactDto property name
        const dtoKey = this.bindCode(key);
        if (dtoKey) {
          // Assign the value from mappedData to the ContactDto object
          this.propertiesList.forEach(p => {
            if (p.propertyCode === dtoKey && p.isDefaultProperty) {
              prop.push({
                uid: p.uid,
                propertyCode: p.propertyCode,
                value: (p.propertyLookupList as PropertyLookupDto[]) ? (p.propertyLookupList as PropertyLookupDto[]).find(l => l.propertyLookupLabel === data[key])?.uid : data[key]
              });
            }
          });

          if (this.propertiesList.find(p => p.isDefaultProperty && p.propertyCode === dtoKey)) {
            contactDto.contactProperties = JSON.stringify(prop);
          }
          else {
            contactDto[dtoKey as keyof ContactDto] = data[key];
          }
        }
      });

      return contactDto;
    });
  }

  mapToCompanyDto(mappedData: any): CompanyDto[] {
    return mappedData.map((data: any) => {
      let companyDto: CompanyDto = new CompanyDto();

      let prop: PropertyDataDto[] = [];

      // Iterate through each key-value pair in the data object
      Object.keys(data).forEach(key => {
        // Use bindCode to get the ContactDto property name
        const dtoKey = this.bindCode(key);
        if (dtoKey) {
          // Assign the value from mappedData to the ContactDto object
          this.propertiesList.forEach(p => {
            if (p.propertyCode === dtoKey && p.isDefaultProperty) {
              prop.push({
                uid: p.uid,
                propertyCode: p.propertyCode,
                value: (p.propertyLookupList as PropertyLookupDto[]) ? (p.propertyLookupList as PropertyLookupDto[]).find(l => l.propertyLookupLabel === data[key])?.uid : data[key]
              });
            }
          });

          if (this.propertiesList.find(p => p.isDefaultProperty && p.propertyCode === dtoKey)) {
            companyDto.companyProperties = JSON.stringify(prop);
          }
          else {
            companyDto[dtoKey as keyof CompanyDto] = data[key];
          }
        }
      });

      return companyDto;
    });
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
    return date ? new Date(date).toLocaleDateString() : '';
  }

  convertDateTimeFormat(date: any) {
    return date ? new Date(date).toLocaleString() : '';
  }

  convertTimeFormat(date: any) {
    return date ? new Date(date).toLocaleTimeString() : '';
  }

  getColumnLetter(index: number): string {
    let letter: string = '';
    while (index >= 0) {
      letter = String.fromCharCode((index % 26) + 65) + letter;
      index = Math.floor(index / 26) - 1;
    }

    return letter;
  }

  exportFile(data: any[]) {
    // Create a workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(this.translateService.instant(this.module === 'CONT' ? 'COMMON.CONTACT' : 'COMMON.COMPANY'));

    worksheet.columns = this.propertiesList.map(item => ({
      header: <string>item.propertyName,
      key: item.propertyCode,
      width: 15
    }));

    let count = 0;
    this.propertiesList.forEach(item => {
      let cell = this.getColumnLetter(count);
      count++;

      let row: number = 2;
      data.forEach(c => {
        if (worksheet.getColumn(`${cell}`).key === item.propertyCode) {
          let cellValue: any;
          switch (item.propertyType) {
            case CONTROL_TYPE_CODE.Date:
            case CONTROL_TYPE_CODE.DateTime:
            case CONTROL_TYPE_CODE.Time:
              cellValue = this.convertDateFormat(c[this.bindCode(item.propertyCode)]);
              break;
            case CONTROL_TYPE_CODE.Dropdown:
            case CONTROL_TYPE_CODE.Multiselect:
            case CONTROL_TYPE_CODE.Checkbox:
            case CONTROL_TYPE_CODE.MultiCheckbox:
            case CONTROL_TYPE_CODE.Radio:
              cellValue = (item.propertyLookupList as PropertyLookupDto[]).find(i => i.uid === c[this.bindCode(item.propertyCode)])?.propertyLookupLabel;
              break;
            case CONTROL_TYPE_CODE.User:
              cellValue = this.returnUserLabelFromUid(c[this.bindCode(item.propertyCode)], false);
              break;
            default:
              cellValue = c[this.bindCode(item.propertyCode)];
              break;
          }
          worksheet.getCell(`${cell}${row}`).value = cellValue;
          row++;
        }
      })

      if (item.propertyType === CONTROL_TYPE_CODE.Radio || item.propertyType === CONTROL_TYPE_CODE.MultiCheckbox || item.propertyType === CONTROL_TYPE_CODE.Multiselect || item.propertyType === CONTROL_TYPE_CODE.Dropdown || item.propertyType === CONTROL_TYPE_CODE.Checkbox) {
        let list = (item.propertyLookupList as PropertyLookupDto[])
          .map(dp => dp.propertyLookupLabel)
          .join(',');

        let tempList = (item.propertyLookupList as PropertyLookupDto[]);
        if (tempList.length > 20) {
          // Helper sheet to hold validation items
          const helperSheet = workbook.addWorksheet(`${item.propertyCode}Helper`);

          tempList.forEach((item, index) => {
            helperSheet.getCell(`A${index + 1}`).value = item.propertyLookupLabel;
          });
        }
        list = `"${list}"`;
        for (let i = 2; i < this.NUMBER_OF_EXCEL_INSERT_ROW; i++) {
          try {
            worksheet.getCell(`${cell}${i}`).dataValidation = {
              type: 'list',
              allowBlank: !item.isMandatory,
              formulae: tempList.length > 20 ? [`${item.propertyCode}Helper!$A$1:$A$${tempList.length}`] : [list],
              showErrorMessage: true,
              errorTitle: this.translateService.instant('ERROR.INVALID_SELECTION'),
              error: `(${cell}${i}) ${this.translateService.instant('ERROR.INVALID_SELECTION_MSG')}`,
            };
          } catch (e) {
            console.error(e);
          }
        }
      }
      else if (item.propertyType === CONTROL_TYPE_CODE.Number) {
        for (let i = 2; i < this.NUMBER_OF_EXCEL_INSERT_ROW; i++) {
          worksheet.getCell(`${cell}${i}`).dataValidation = {
            type: 'decimal',
            allowBlank: !item.isMandatory,
            formulae: [],
            showErrorMessage: true,
            errorTitle: this.translateService.instant('ERROR.INVALID_NUMBER'),
            error: `(${cell}${i}) ${this.translateService.instant('ERROR.INVALID_NUMBER_MSG')}`,
          };
        }
      }
      else if (item.propertyType === CONTROL_TYPE_CODE.Year) {
        for (let i = 2; i < this.NUMBER_OF_EXCEL_INSERT_ROW; i++) {
          worksheet.getCell(`${cell}${i}`).dataValidation = {
            type: 'decimal',
            allowBlank: !item.isMandatory,
            operator: 'between',
            formulae: ['0', '9999'],
            showErrorMessage: true,
            errorTitle: this.translateService.instant('ERROR.INVALID_NUMBER'),
            error: `(${cell}${i})${this.translateService.instant('ERROR.INVALID_NUMBER_MSG')} `,
          };
        }
      }
      else if (item.propertyType === CONTROL_TYPE_CODE.Date || item.propertyType === CONTROL_TYPE_CODE.DateTime || item.propertyType === CONTROL_TYPE_CODE.Time) {
        worksheet.getColumn(`${cell}`).numFmt = 'dd/mm/yyyy';
        for (let i = 2; i < this.NUMBER_OF_EXCEL_INSERT_ROW; i++) {
          worksheet.getCell(`${cell}${i}`).dataValidation = {
            type: 'date',                // Validation type set to date
            operator: 'between',         // Use 'between' to satisfy the need for formulae
            formulae: ['DATE(1900,1,1)', 'DATE(9999,12,31)'],  // Very wide date range
            allowBlank: !item.isMandatory,          // Disallow blank entries
            showErrorMessage: true,      // Show error message if invalid date
            errorTitle: this.translateService.instant('ERROR.INVALID_DATE'), // Error title
            error: `(${cell}${i}) ${this.translateService.instant('ERROR.INVALID_DATE_MSG')}`, // Error message
          };
        }
      }
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'dropdown-example.xlsx');
    });
  }

  importFile(event: any) {
    if (event.target.files.length === 0) {
      return;
    }
    else {
      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        // Read the Excel data as binary string
        const binaryString: string = e.target.result;

        // Parse the binary string using XLSX
        const workbook: XLSX.WorkBook = XLSX.read(binaryString, { type: 'binary' });

        // Get the first sheet name from the workbook
        const sheetName: string = workbook.SheetNames[0];

        // Get the sheet data from the workbook
        const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];

        // Convert the worksheet data into a JSON array
        const row: any = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const headers = row[0] as string[];

        const mappedData = row.slice(1).map((row: any) => {
          const rowObject: any = {};
          headers.forEach((header: string, index: number) => {
            // Use the mapping to get the key corresponding to the header
            const key = this.headerKeyMapping[header];
            if (key) {
              rowObject[key] = row[index]; // Assign the value using the key
            }
          });
          return rowObject;
        });

        if (this.module === 'CONT') {
          let contactList: ContactDto[] = [];
          contactList = this.mapToContactDto(mappedData);
          this.commonService.createContact(contactList).subscribe(res => {
            if (res.isSuccess) {
              this.getContact();
            }
            else {
              this.popMessage(res.responseMessage, "Error", "error");
            }
          });
        }
        else {
          let companyList: CompanyDto[] = [];
          companyList = this.mapToCompanyDto(mappedData);
          this.commonService.createCompany(companyList).subscribe(res => {
            if (res.isSuccess) {
              this.getCompany();
            }
            else {
              this.popMessage(res.responseMessage, "Error", "error");
            }
          });
        }
      }
      reader.readAsBinaryString(event.target.files[0]);
    }

  }

  downloadTemplate() {
    // Create a workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(this.translateService.instant(this.module === 'CONT' ? 'COMMON.CONTACT' : 'COMMON.COMPANY'));

    worksheet.columns = this.createFormConfig.map(item => ({
      header: <string>item.label,
      key: item.name!,
    }));

    let count = 0;
    this.createFormConfig.forEach(item => {
      let cell = this.getColumnLetter(count);
      count++;

      if (item.type === CONTROL_TYPE.Dropdown || item.type === CONTROL_TYPE.Multiselect || item.type === CONTROL_TYPE.Checkbox || item.type === CONTROL_TYPE.Radio) {
        let list = item.options!.map(dp => dp.label!).join(',');
        list = `"${list}"`;
        for (let i = 2; i < this.NUMBER_OF_EXCEL_INSERT_ROW; i++) {
          worksheet.getCell(`${cell}${i}`).dataValidation = {
            type: 'list',
            allowBlank: !item.required,
            formulae: [list],  // Set the dropdown options
            showErrorMessage: true,
            errorTitle: 'Invalid Selection',
            error: 'Please select a value from the list.',
          };
        }
      }
      else if (item.type === CONTROL_TYPE.Textbox && item.mode === 'number') {
        for (let i = 2; i < this.NUMBER_OF_EXCEL_INSERT_ROW; i++) {
          worksheet.getCell(`${cell}${i}`).dataValidation = {
            type: 'decimal',
            allowBlank: !item.required,
            formulae: [],
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
    if (this.authService.currentUser()) {
      this.displayCreateDialog = true;
    }
  }

  create() {
    if (this.createFormGroup.valid) {
      this.propertyValueUpdate(this.createFormConfig);
    }
    else {
      console.log(this.createFormGroup.controls)
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Profile is not created. Please check again.' });
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
        };

        newContact.contactOwnerUid = this.authService.currentUser()!.uid;
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
        };

        newCompany.companyOwnerUid = this.authService.currentUser()!.uid;
      }
    });
    if (this.module === "CONT") {
      newContact.contactProperties = JSON.stringify(profileProperty);
      this.commonService.createContact([newContact]).subscribe(res => {
        if (res.isSuccess) {
          this.displayCreateDialog = false;

          this.getContact();
        }
        else {
          this.popMessage(res.responseMessage, "Error", "error");
        }
      });
    }
    else {
      newCompany.companyProperties = JSON.stringify(profileProperty);
      this.commonService.createCompany([newCompany]).subscribe(res => {
        if (res.isSuccess) {
          this.displayCreateDialog = false;

          this.getCompany();
        }
        else {
          this.popMessage(res.responseMessage, "Error", "error");
        }
      });
    }

    return;
  }

  delete() {
    if (this.module === 'CONT') {
      this.commonService.deleteContact(this.selectedProfile as ContactDto[], this.authService.user?.uid ?? 'SYSTEM').subscribe(res => {
        if (res.isSuccess) {
          this.popMessage(this.translateService.instant("MESSAGE.DELETED_SUCCESSFULLY", { module: this.translateService.instant("COMMON.CONTACT") }), this.translateService.instant("MESSAGE.DELETED"), "success");
          this.getContact();
        }
        else {
          this.popMessage(res.responseMessage, "Error", "error");
        }
      });
    }
    else {
      this.commonService.deleteCompany(this.selectedProfile as CompanyDto[], this.authService.user?.uid ?? 'SYSTEM').subscribe(res => {
        if (res.isSuccess) {
          this.popMessage(this.translateService.instant("MESSAGE.DELETED_SUCCESSFULLY", { module: this.translateService.instant("COMMON.COMPANY") }), this.translateService.instant("MESSAGE.DELETED"), "success");
          this.getCompany();
        }
        else {
          this.popMessage(res.responseMessage, "Error", "error");
        }
      });
    }
  }

  returnUserLabelFromUid(uid: string, showDefault = true): string {
    return (this.propertiesList.find(item => item.propertyType === 'USR')!.propertyLookupList.find(item => item.uid === uid) as UserDto)?.displayName ?? (showDefault ? this.EMPTY_VALUE_STRING : uid);
  }

  returnLeadStatusLabelFromId(id: string, showDefault = true): string {
    return (this.propertiesList.find(f => f.propertyCode === 'lead_status')?.propertyLookupList.find(p => p.uid === id) as PropertyLookupDto)?.propertyLookupLabel ?? (showDefault ? this.EMPTY_VALUE_STRING : id);
  }

  addTab() {
    console.log(this.panelList)
    let isBlock = false;
    this.tableLoading.forEach(item => {
      if (item) {
        isBlock = true;
      }
    });

    if (!isBlock) {
      let newPanelIndex: number = this.panelList[this.panelList.length - 1].index + 1;
      this.panelList.push({
        headerLabel: 'TEST__' + newPanelIndex,
        closable: true,
        index: newPanelIndex
      });

      this.activeTabPanel = newPanelIndex;
      this.initCreateFormConfig();
      this.tabFilterList[newPanelIndex] = [];
    }
    else {
      this.messageService.add({
        severity: 'info',
        summary: this.translateService.instant('COMMON.DATA_LOADING'),
        detail: this.translateService.instant('COMMON.DATA_LOADING')
      });
    }
  }

  returnFilterProperty(prop: PropertiesDto) {
    return this.filterPropList.find(item => item.property === prop)!;
  }

  advanceFilterBtn() {
    this.tempFilterList[this.activeTabPanel] = [];
    if (this.propertiesList.length > 0) {
      this.isShowFilter = true;
      this.isShowTableColumnFilter = false;
      this.filterFormGroup = this.formBuilder.group({});
      this.conditionFormGroup = this.formBuilder.group({});
      this.propertiesList.forEach(prop => {
        let control = new FormControl(null);
        let control2 = new FormControl(null, Validators.required);
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

        Object.assign(this.tempFilterList[this.activeTabPanel], this.tabFilterList[this.activeTabPanel]);
      });
    }
    else {
      this.messageService.add({ severity: 'info', summary: 'Loading', detail: this.translateService.instant('COMMON.DATA_LOADING') });
    }
  }

  tableColumnFilterBtn() {
    this.isShowTableColumnFilter = true;

    this.columnPropertiesList[this.activeTabPanel] = [];

    this.tableConfig[this.activeTabPanel].forEach((i: any) => {
      let property = this.propertiesList.find(f => this.bindCode(f.propertyCode) === i.code);
      if (property) {
        this.columnPropertiesList[this.activeTabPanel].push(property);
      }
    });

    this.tableConfig[this.activeTabPanel].sort((a: any, b: any) => a.order - b.order);
  }

  closeFilter() {
    this.isShowFilter = false;
    this.tempFilterList[this.activeTabPanel] = [];
  }

  closeTableColumnFilter() {
    this.isShowTableColumnFilter = false;
  }

  filterClick(prop: PropertiesDto) {
    if (!this.tempFilterList[this.activeTabPanel]?.find((item: any) => item.property === prop)) {

      let mode = '';
      switch (prop.propertyType) {
        case CONTROL_TYPE_CODE.Dropdown:
        case CONTROL_TYPE_CODE.Multiselect:
        case CONTROL_TYPE_CODE.Checkbox:
        case CONTROL_TYPE_CODE.MultiCheckbox:
          mode = CONTROL_TYPE.Multiselect;
          break;
        case CONTROL_TYPE_CODE.Time:
          mode = 'time';
          break;
        case CONTROL_TYPE_CODE.Date:
          mode = 'date';
          break;
        case CONTROL_TYPE_CODE.DateTime:
          mode = 'datetime';
          break;
        case CONTROL_TYPE_CODE.Country:
          mode = CONTROL_TYPE.Multiselect;
          break;
        case CONTROL_TYPE_CODE.State:
          this.filterFormGroup.controls[prop.propertyCode].valueChanges.pipe(
            debounceTime(2000),
            distinctUntilChanged()
          ).subscribe(val => {
            this.commonService.getStateByStateName(val).subscribe(res => {
              if (res.data.length > 0) {

              }
            })
          });
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

      this.tempFilterList[this.activeTabPanel].push({
        property: prop,
        condition: this.getConditionList(prop),
        options: () => this.getValueList(prop),
        filterFieldControl: <FormControl>this.filterFormGroup.controls[prop.propertyCode],
        conditionFieldControl: <FormControl>this.conditionFormGroup.controls[prop.propertyCode],
        mode: mode,
      });

      console.log(this.tempFilterList[this.activeTabPanel]);
    }

  }

  deleteFilter(prop: PropertiesDto) {
    this.tabFilterList[this.activeTabPanel] = this.tabFilterList[this.activeTabPanel].filter((item: any) => {
      item.property === prop
    });
    this.tempFilterList[this.activeTabPanel] = this.tempFilterList[this.activeTabPanel].filter((item: any) => {
      item.property === prop
    });
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
      case CONTROL_TYPE_CODE.Radio:
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
      case CONTROL_TYPE_CODE.Date:
      case CONTROL_TYPE_CODE.DateTime:
      case CONTROL_TYPE_CODE.Time:
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
      case CONTROL_TYPE_CODE.Radio:
        list = this.propertiesList.find(prop1 => prop1.uid === prop.uid)!.propertyLookupList!.map(item => ({
          label: (item as PropertyLookupDto).propertyLookupLabel,
          value: item.uid
        }));
        break;
      case CONTROL_TYPE_CODE.User:
        list = this.propertiesList.find(prop1 => prop1.uid === prop.uid)!.propertyLookupList!.map(item => ({
          label: `${(item as UserDto).displayName} (${(item as UserDto).email})`,
          value: item.uid
        }));
        break;
      case CONTROL_TYPE_CODE.Country:
        list = this.countryOptionList;
        break;
    }

    return of(list);
  }

  filterSubmit() {
    this.filterFormGroup.markAllAsTouched();
    this.conditionFormGroup.markAllAsTouched();

    Object.assign(this.tabFilterList[this.activeTabPanel], this.tempFilterList[this.activeTabPanel]);

    if (this.module === 'CONT') {
      this.returnFilteredProfileList();
    }
    else {
      this.returnFilteredProfileList();
    }
    this.closeFilter();
  }

  tabViewOnChange(event: any) {
    this.activeTabPanel = event.index;
  }

  tabViewOnClose(event: any) {
    this.panelList = this.panelList.filter(item => item.index !== event.index)
  }

  returnPropertyValue(prop: any, value: string) {
    switch (prop.type) {
      case CONTROL_TYPE_CODE.Radio:
      case CONTROL_TYPE_CODE.Dropdown:
      case CONTROL_TYPE_CODE.Multiselect:
      case CONTROL_TYPE_CODE.Checkbox:
      case CONTROL_TYPE_CODE.MultiCheckbox:
        return (this.propertiesList.find(p => p.propertyCode === prop.code)?.propertyLookupList as PropertyLookupDto[])?.find(l => l.uid === value)?.propertyLookupLabel;
      case CONTROL_TYPE_CODE.User:
        return this.returnUserLabelFromUid(value);
      case CONTROL_TYPE_CODE.Date:
        return this.convertDateFormat(value);
      case CONTROL_TYPE_CODE.DateTime:
        return this.convertDateTimeFormat(value);
      case CONTROL_TYPE_CODE.Time:
        return this.convertTimeFormat(value);
      default:
        return value;
    }
  }

  onMoveToTarget(event: any) {
    console.log(event)
    event.items.forEach((p: PropertiesDto) => {
      if (!this.tempColumnFilterList.find(i => i.propertyCode === p.propertyCode)) {
        this.tempColumnFilterList.push(p);
      }
    })

  }

  reorderTarget(event: any) {
    console.log(event)
  }

  tableColumnFilterSubmit() {
    this.tempColumnFilterList.forEach(p => {
      this.columnPropertiesList[this.activeTabPanel].push(p)
    });

    this.tempColumnFilterList = [];

    this.columnPropertiesList[this.activeTabPanel].forEach((p: PropertiesDto) => {
      if (p && !this.tableConfig[this.activeTabPanel].find((i: any) => i.code === this.bindCode(p.propertyCode))) {
        this.tableConfig[this.activeTabPanel].push({
          header: p.propertyName,
          code: this.bindCode(p.propertyCode),
          order: p.order,
          type: p.propertyType
        });
      }
    });

    this.closeTableColumnFilter();
  }

  getStateList(): Observable<any[]> {
    if (!this.createFormGroup.controls['country'].value.length) {
      return of([]);
    }

    return this.commonService.getStateByCountryId(this.createFormGroup.controls['country'].value).pipe(
      map(res => {
        return res.data.map(val => ({
          value: val.uid,
          label: val.name
        }))
      })
    );
  }

  getCityList(): Observable<any[]> {
    if (!this.createFormGroup.controls['state'].value.length) {
      return of([]);
    }

    return this.commonService.getCityByStateId(this.createFormGroup.controls['state'].value).pipe(
      map(res => {
        console.log(res)
        return res.data.map(val => ({
          value: val.uid,
          label: val.name
        }))
      })
    );
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