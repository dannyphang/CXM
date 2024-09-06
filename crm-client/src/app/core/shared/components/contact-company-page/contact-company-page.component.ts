import { Component, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as ExcelJS from 'exceljs';
import saveAs from 'file-saver';
import { MessageService } from 'primeng/api';
import { Observable, of } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { CommonService, CompanyDto, ContactDto, PropertiesDto, PropertyDataDto, PropertyGroupDto, PropertyLookupDto, UserDto } from '../../../services/common.service';
import { BaseDataSourceActionEvent, CONTROL_TYPE, CONTROL_TYPE_CODE, FormConfig, OptionsModel } from '../../../services/components.service';
import { ROW_PER_PAGE_DEFAULT, ROW_PER_PAGE_DEFAULT_LIST, EMPTY_VALUE_STRING } from '../../constants/common.constants';

@Component({
  selector: 'app-contact-company-page',
  templateUrl: './contact-company-page.component.html',
  styleUrl: './contact-company-page.component.scss'
})
export class ContactCompanyPageComponent implements OnChanges {
  ROW_PER_PAGE_DEFAULT = ROW_PER_PAGE_DEFAULT;
  ROW_PER_PAGE_DEFAULT_LIST = ROW_PER_PAGE_DEFAULT_LIST;
  EMPTY_VALUE_STRING = EMPTY_VALUE_STRING;
  module: 'CONT' | 'COMP' = 'CONT';
  contactList: ContactDto[] = [];
  companyList: CompanyDto[] = [];
  modulePropertyList: PropertyGroupDto[] = [];

  CONTROL_TYPE_CODE = CONTROL_TYPE_CODE;
  propertiesList: PropertiesDto[] = [];
  activeTabPanel: number = 0;
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
  filterFormGroup: FormGroup;
  conditionFormGroup: FormGroup;
  tabFilterList: any[] = [];
  tempFilterList: any[] = [];
  filterPropList: any[] = [];
  filterSearch: FormControl = new FormControl("");

  constructor(
    private commonService: CommonService,
    private router: Router,
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private messageService: MessageService,
    private authService: AuthService,
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
        closable: false,
        index: 0,
      }
    ];
    this.tabFilterList[this.activeTabPanel] = [];
    this.tempFilterList[this.activeTabPanel] = [];
  }

  async ngOnInit() {
    this.initTableConfig();
    this.initCreateFormConfig();
    this.filterTableConfig();
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
      })
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

    this.commonService.getAllPropertiesByModule(this.module).subscribe((res) => {
      this.modulePropertyList = res;

      res.forEach((item) => {
        item.propertiesList.forEach((prop) => {
          this.propertiesList.push(prop);

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

            formsConfig.push(forms);
            createPropCount++;
          }
        });
      });

      this.createFormConfig = formsConfig;

      // sort table column
      this.tableConfig[this.activeTabPanel] = this.tableConfig[this.activeTabPanel].sort((a: any, b: any) => a.order - b.order);
      this.tableLoading[this.activeTabPanel] = false;
    });
  }

  filterTableConfig() {
    if (this.tabFilterList[this.activeTabPanel].length > 0) {
      this.tableConfig[this.activeTabPanel] = [];
      this.initTableConfig();

      this.tabFilterList[this.activeTabPanel].forEach((item: Filter) => {
        let tConfig = {
          header: item.property.propertyName,
          code: this.bindCode(item.property.propertyCode),
          order: item.property.order,
          type: item.property.propertyType
        }

        this.tableConfig[this.activeTabPanel].push(tConfig);
      });
    }
    else if (this.tabFilterList[this.activeTabPanel].length === 0) {
      if (this.module === 'CONT') {
        this.getContact();
      }
      else {
        this.getCompany();
      }
    }
  }

  returnFilteredProfileList() {
    if (this.module === 'CONT') {
      let tempProfileList: ContactDto[] = [];
      if (this.tabFilterList[this.activeTabPanel].length === 0) {
        this.getContact();
      }
      else {
        this.commonService.getAllContact().subscribe(res => {
          this.tableLoading[this.activeTabPanel] = true;
          this.tabFilterList[this.activeTabPanel].forEach((item: Filter) => {
            res.forEach(cont => {
              let proProp: PropertyDataDto[] = JSON.parse(cont.contactProperties);
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
                  }
                });
              }
            });
          });
          this.contactList = [];
          tempProfileList.forEach(cont => {
            if (!this.contactList.includes(cont)) {
              this.contactList.push(cont);
            }
          });
          this.tableLoading[this.activeTabPanel] = false;
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
      this.contactList = res;
      this.tableLoading[this.activeTabPanel] = false;
    });
  }

  getCompany() {
    this.tableLoading[this.activeTabPanel] = true;
    this.commonService.getAllCompany().subscribe((res) => {
      this.companyList = res;
      this.tableLoading[this.activeTabPanel] = false;
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
    if (this.authService.currentUser()) {
      this.displayCreateDialog = true;
    }
  }

  create() {
    if (this.createFormGroup.valid) {
      this.propertyValueUpdate(this.createFormConfig);
    }
    else {
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

  returnUserLabelFromUid(uid: string): string {
    return (this.propertiesList.find(item => item.propertyType === 'USR')!.propertyLookupList.find(item => item.uid === uid) as UserDto)?.displayName ?? this.EMPTY_VALUE_STRING;
  }

  returnLeadStatusLabelFromId(id: string): string {
    return (this.propertiesList.find(f => f.propertyCode === 'lead_status')?.propertyLookupList.find(p => p.uid === id) as PropertyLookupDto)?.propertyLookupLabel ?? this.EMPTY_VALUE_STRING;
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

  closeFilter() {
    this.isShowFilter = false;
    this.tempFilterList[this.activeTabPanel] = [];
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

      this.tempFilterList[this.activeTabPanel].push({
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
    }

    return of(list);
  }

  filterSubmit() {
    this.filterFormGroup.markAllAsTouched();
    this.conditionFormGroup.markAllAsTouched();

    Object.assign(this.tabFilterList[this.activeTabPanel], this.tempFilterList[this.activeTabPanel]);

    // this.filterTableConfig();

    console.log(this.tabFilterList[this.activeTabPanel]);
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

  testing(text: any) {
    if (text === 'company_name') {
      console.log(text);

    }
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