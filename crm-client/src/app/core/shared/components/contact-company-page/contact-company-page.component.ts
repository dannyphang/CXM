import { Component, Input } from '@angular/core';
import { CONTROL_TYPE, CONTROL_TYPE_CODE, FormConfig, OptionsModel, TableConfig } from '../../../services/components.service';
import { CommonService, ContactDto, ModuleDto, PropertiesDto, PropertyDataDto } from '../../../services/common.service';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DEFAULT_FORMAT_DATE } from '../../constants/common.constants';

@Component({
  selector: 'app-contact-company-page',
  templateUrl: './contact-company-page.component.html',
  styleUrl: './contact-company-page.component.scss'
})
export class ContactCompanyPageComponent {
  @Input() module: 'CONT' | 'COMP' = 'CONT';
  @Input() contactList: ContactDto[] = [];
  @Input() modulePropertyList: ModuleDto[] = [];

  propertiesList: PropertiesDto[] = [];
  tableConfig: TableConfig[] = [];
  selectedContact: ContactDto[] = [];
  displayCreateDialog: boolean = false;
  createFormPropertyList: PropertiesDto[] = [];
  createFormConfig: FormConfig[] = [];
  createFormGroup: FormGroup;
  profileProperty: PropertiesDto[] = [];

  constructor(
    private commonService: CommonService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {

  }

  async ngOnInit() {
    this.initCreateFormConfig();
  }

  initCreateFormConfig() {
    let createPropCount = 0;
    let formsConfig: FormConfig[] = [];

    this.commonService.getAllContact().subscribe((res) => {
      this.contactList = res;
    })

    this.createFormGroup = this.formBuilder.group({});

    this.commonService.getAllPropertiesByModule(this.module).subscribe((res) => {
      res.forEach((item) => {
        item.propertiesList.forEach((prop) => {
          this.propertiesList.push(prop);

          // only display property that is system property which is not storing inside the properties column
          if (!prop.isDefaultProperty) {
            let config: TableConfig = {
              header: prop.propertyName,
              code: this.bindCode(prop.propertyCode),
            };
            this.tableConfig.push(config);
            this.profileProperty.push(prop);
          }

          // for create contact/company properties
          if (prop.isMandatory && prop.isEditable) {
            this.createFormPropertyList.push(prop);

            let control = new FormControl(this.returnControlTypeEmptyValue(prop), Validators.required);
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
              //console.log(this.createFormGroup.controls[prop.propertyCode].value)
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
                }
              }
            }

            formsConfig.push(forms);
            createPropCount++;
          }
        });
      });

      this.createFormConfig = formsConfig;
    });
  }

  returnControlTypeEmptyValue(prop: PropertiesDto): any {
    let type = prop.propertyType;

    if (type === CONTROL_TYPE_CODE.Textbox || type === CONTROL_TYPE_CODE.Textarea || type === CONTROL_TYPE_CODE.Email || type === CONTROL_TYPE_CODE.Phone || type === CONTROL_TYPE_CODE.Url) {
      return '';
    }
    else if (type === CONTROL_TYPE_CODE.Checkbox) {
      return false;
    }
    else if (type === CONTROL_TYPE_CODE.Date) {
      return new Date();
    }
    else if (type === CONTROL_TYPE_CODE.Number) {
      return 0;
    }
    else if (type === CONTROL_TYPE_CODE.Dropdown || type === CONTROL_TYPE_CODE.Multiselect) {
      let lookup = {
        label: '',
        value: ''
      };
      prop.propertyLookupList.forEach((item) => {
        if (item.isDefault) {
          lookup = {
            label: item.propertyLookupLabel,
            value: item.uid
          }
        }
      });
      return lookup.value;
    }
    else if (type === CONTROL_TYPE_CODE.Radio) {
      return false;
    }
    return {};
  }

  bindCode(code: string) {
    let returnCode = '';

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
    }

    return returnCode;
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
    console.log(this.selectedContact)
  }

  toProfile(contact: ContactDto) {
    this.router.navigate(['contact/profile/' + contact.uid]);
  }

  toCreate() {
    this.displayCreateDialog = true;
  }

  create() {
    let contactPropertyList: PropertyDataDto[] = [];

    console.log(this.createFormConfig)

    this.createFormConfig.forEach((item: any) => {
      let propertyJson: PropertyDataDto = {
        uid: item.id,
        propertyCode: item.name,
        value: item.fieldControl.value
      }
      contactPropertyList.push(propertyJson)
    });

    let propertyListJson = JSON.stringify(contactPropertyList);
    // this.commonService.createContact
    console.log(contactPropertyList);

    this.propertyValueUpdate(this.createFormConfig)
  }

  propertyValueUpdate(form: any[], contactProperty: PropertyDataDto[] = []) {
    let newContact: ContactDto = new ContactDto();
    this.profileProperty.forEach(prop => {
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
        }
      }
    });

    // {
    //   // store to properties
    //   contactProperty.push({
    //     uid: form.id,
    //     propertyCode: form.name,
    //     value: form.fieldControl.value
    //   });
    // }
    console.log(newContact)
    console.log(this.profileProperty)
    return;
  }
}
