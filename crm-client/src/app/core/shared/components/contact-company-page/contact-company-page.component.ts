import { Component, Input } from '@angular/core';
import { CONTROL_TYPE, CONTROL_TYPE_CODE, FormConfig, TableConfig } from '../../../services/components.service';
import { CommonService, ContactDto, ModulePropertiesDto, PropertiesDto } from '../../../services/common.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-contact-company-page',
  templateUrl: './contact-company-page.component.html',
  styleUrl: './contact-company-page.component.scss'
})
export class ContactCompanyPageComponent {
  @Input() module: 'CONT' | 'COMP' = 'CONT';
  @Input() contactList: ContactDto[] = [];
  @Input() modulePropertyList: ModulePropertiesDto[] = [];
  propertiesList: PropertiesDto[] = [];
  tableConfig: TableConfig[] = [];
  selectedContact: ContactDto[] = [];
  displayCreateDialog: boolean = false;
  createFormConfig: any[] = [];

  constructor(
    private commonService: CommonService,
    private router: Router,
  ) {

  }

  ngOnInit() {
    this.commonService.getAllContact().subscribe((res) => {
      this.contactList = res;
    })

    this.commonService.getAllPropertiesByModule(this.module).subscribe((res) => {
      res.forEach((item) => {
        item.propertiesList.forEach((prop) => {

          this.propertiesList.push(prop);

          if (!prop.isDefaultProperty) {
            let config: TableConfig = {
              header: prop.propertyName,
              code: this.bindCode(prop.propertyCode),
            };
            this.tableConfig.push(config);
          }

          if (prop.isMandatory) {
            // let config: FormConfig = {
            //   label: prop.propertyName,
            //   type: CONTROL_TYPE[CONTROL_TYPE_CODE[prop.propertyType]],
            //   dataSourceAction: (): Observable<any> => {
            //     return prop.propertyLookupList;
            //   }, 

            // };
            this.createFormConfig.push(prop);
          }
        });
      });
    })
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

    return returnCode
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
    this.initFormConfig();

    this.displayCreateDialog = true;
  }

  initFormConfig() {

  }
}
