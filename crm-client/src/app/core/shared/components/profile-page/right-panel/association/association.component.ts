import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivityService } from '../../../../../services/activity.service';
import { AuthService } from '../../../../../services/auth.service';
import { PropertyGroupDto, ContactDto, CompanyDto, CommonService, CreateAssociationDto } from '../../../../../services/common.service';
import { FormConfig, OptionsModel, CONTROL_TYPE } from '../../../../../services/components.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-association',
  templateUrl: './association.component.html',
  styleUrl: './association.component.scss'
})
export class AssociationComponent {
  @Input() propertiesList: PropertyGroupDto[] = [];
  @Input() module: 'CONT' | 'COMP' = 'CONT';
  @Input() contactProfile: ContactDto = new ContactDto();
  @Input() companyProfile: CompanyDto = new CompanyDto();
  @Output() getProfileEmit: EventEmitter<any> = new EventEmitter();

  showAddAssoSidebar: boolean = false;
  assoPanelExpand: boolean = false;

  assoFormConfig: FormConfig[] = [];
  assoFormControl: FormControl = new FormControl([]);

  constructor(
    private commonService: CommonService,
    private activityService: ActivityService,
    private authService: AuthService,
    private toastService: ToastService
  ) {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['contactProfile'] && changes['contactProfile'].currentValue) {
      this.assoPanelExpand = this.contactProfile.association?.companyList?.length > 0 ? true : false;
    }
    if (changes['companyProfile'] && changes['companyProfile'].currentValue) {
      this.assoPanelExpand = this.companyProfile.association?.contactList?.length > 0 ? true : false;
    }
  }

  openSidebar(field: string) {
    this.showAddAssoSidebar = true;
    switch (field) {
      case 'asso':
        if (this.module === 'COMP') {
          this.commonService.getAllContact().subscribe(res => {
            if (res.isSuccess) {
              let contList: OptionsModel[] = [];
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
              ];
            }
            else {
              this.toastService.addSingle({
                message: res.responseMessage,
                severity: 'error'
              });
            }

          });
        }
        else {
          this.commonService.getAllCompany().subscribe(res => {
            if (res.isSuccess) {
              let compList: OptionsModel[] = [];
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
              ];
            }
            else {
              this.toastService.addSingle({
                message: res.responseMessage,
                severity: 'error'
              });
            }

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
      if (!res.isSuccess) {
        this.toastService.addSingle({
          message: res.responseMessage,
          severity: 'error'
        });
      }
      else {
        this.assoEmitToParent(this.module);
        this.closeSidebar();
      }
    })
  }

  assoEmitToParent(module: 'CONT' | 'COMP') {
    this.getProfileEmit.emit(module);
  }
}
