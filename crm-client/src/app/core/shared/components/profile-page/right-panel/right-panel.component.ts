import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivityService } from '../../../../services/activity.service';
import { PropertyGroupDto, ContactDto, CompanyDto, CommonService, CreateAssociationDto } from '../../../../services/common.service';
import { CONTROL_TYPE, CONTROL_TYPE_CODE, FormConfig, OptionsModel } from '../../../../services/components.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-right-panel',
  templateUrl: './right-panel.component.html',
  styleUrl: './right-panel.component.scss'
})
export class RightPanelComponent {
  @Input() propertiesList: PropertyGroupDto[] = [];
  @Input() module: 'CONT' | 'COMP' = 'CONT';
  @Input() contactProfile: ContactDto = new ContactDto();
  @Input() companyProfile: CompanyDto = new CompanyDto();
  showAddAssoSidebar: boolean = false;
  assoPanelExpand: boolean = true;

  assoFormConfig: FormConfig[] = [];
  assoFormControl: FormControl = new FormControl([]);

  constructor(
    private commonService: CommonService,
    private activityService: ActivityService
  ) {

  }

  ngOnInit() {

  }

  openSidebar(field: string) {
    this.showAddAssoSidebar = true;
    switch (field) {
      case 'asso':
        if (this.module === 'COMP') {
          this.commonService.getAllContact().subscribe(res => {
            let contList: OptionsModel[] = []
            res.data.forEach(cont => {
              contList.push({
                label: `${cont.contactFirstName} ${cont.contactLastName} (${cont.contactEmail})`,
                value: cont.uid
              })
            })
            this.assoFormConfig = [
              {
                id: 'CONTACT_ASSO',
                label: "Contact",
                type: CONTROL_TYPE.Multiselect,
                layoutDefine: {
                  row: 0,
                  column: 0
                },
                options: contList,
                fieldControl: this.assoFormControl
              }
            ]
          });
        }
        else {
          this.commonService.getAllCompany().subscribe(res => {
            let compList: OptionsModel[] = []
            res.data.forEach(comp => {
              compList.push({
                label: `${comp.companyName} (${comp.companyEmail})`,
                value: comp.uid
              })
            })
            this.assoFormConfig = [
              {
                id: 'COMPANY_ASSO',
                label: "Company",
                type: CONTROL_TYPE.Multiselect,
                layoutDefine: {
                  row: 0,
                  column: 0
                },
                options: compList,
                fieldControl: this.assoFormControl
              }
            ]
          });
        }
        break;
      default:
        break;
    }
  }

  closeSidebar() {
    this.showAddAssoSidebar = false;
  }

  panelOnClick(field: string) {
    switch (field) {
      case 'asso':
        this.assoPanelExpand = !this.assoPanelExpand;
        break;
    }
  }

  save() {
    let createAsso: CreateAssociationDto = {
      module: this.module,
      profileUid: this.module === 'CONT' ? this.contactProfile.uid : this.companyProfile.uid,
      contactAssoList: this.module === 'CONT' ? [] : this.assoFormControl.value,
      companyAssoList: this.module === 'CONT' ? this.assoFormControl.value : [],
    }
    this.commonService.createAssociation(createAsso).subscribe(res => {
      console.log(res)
    })
  }
}
