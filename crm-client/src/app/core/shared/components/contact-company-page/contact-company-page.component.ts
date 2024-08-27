import { Component, Input } from '@angular/core';
import { CONTROL_TYPE, CONTROL_TYPE_CODE, FormConfig, OptionsModel, TableConfig } from '../../../services/components.service';
import { CommonService, CompanyDto, ContactDto, ModuleDto, PropertiesDto, PropertyDataDto, PropertyLookupDto, UserDto } from '../../../services/common.service';
import { NavigationExtras, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DEFAULT_FORMAT_DATE } from '../../constants/common.constants';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-contact-company-page',
  templateUrl: './contact-company-page.component.html',
  styleUrl: './contact-company-page.component.scss'
})
export class ContactCompanyPageComponent {
  @Input() module: 'CONT' | 'COMP' = 'CONT';
  @Input() contactList: ContactDto[] = [];
  @Input() companyList: CompanyDto[] = [];
  @Input() modulePropertyList: ModuleDto[] = [];

  propertiesList: PropertiesDto[] = [];
  tableConfig: any[] = []; // from table config
  selectedProfile: ContactDto[] | CompanyDto[] = [];
  displayCreateDialog: boolean = false;
  createFormPropertyList: PropertiesDto[] = [];
  createFormConfig: FormConfig[] = [];
  createFormGroup: FormGroup;
  profileProperty: PropertiesDto[] = [];

  constructor(
    private commonService: CommonService,
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {

  }

  async ngOnInit() {
    this.initCreateFormConfig();
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
      res.forEach((item) => {
        item.propertiesList.forEach((prop) => {
          this.propertiesList.push(prop);

          // only display property that is system property which is not storing inside the properties column
          if (!prop.isDefaultProperty) {
            let config: any = {
              header: prop.propertyName,
              code: this.bindCode(prop.propertyCode),
              order: prop.order,
              type: prop.propertyType
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
    // import("xlsx").then(xlsx => {
    //   const worksheet = xlsx.utils.json_to_sheet(this.products);
    //   const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    //   const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
    //   this.saveAsExcelFile(excelBuffer, "products");
    // });
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    // https://www.primefaces.org/primeng-v14-lts/table/export
    // let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    // let EXCEL_EXTENSION = '.xlsx';
    // const data: Blob = new Blob([buffer], {
    //     type: EXCEL_TYPE
    // });
    // FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  importFile() {

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
    return (this.propertiesList.find(item => item.propertyType === 'USR')!.propertyLookupList.find(item => item.uid === uid) as UserDto)?.displayName;
  }
}
