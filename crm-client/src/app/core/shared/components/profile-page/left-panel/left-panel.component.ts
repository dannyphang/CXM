import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonService, ContactDto, PropertyGroupDto } from '../../../../services/common.service';
import { NavigationExtras, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CONTROL_TYPE, CONTROL_TYPE_CODE, FormConfig, OptionsModel } from '../../../../services/components.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-left-panel',
  templateUrl: './left-panel.component.html',
  styleUrl: './left-panel.component.scss'
})
export class LeftPanelComponent implements OnChanges {
  @Input() propertiesList: PropertyGroupDto[] = [];
  @Input() module: 'CONT' | 'COMP' = 'CONT';
  @Input() contactProfile: ContactDto = new ContactDto();
  actionMenu: any[] = [
    {
      label: 'View all properties',
      icon: '',
      command: () => {
        const navigationExtras: NavigationExtras = {
          state: {
            data: this.propertiesList
          }
        };

        // navigate to setting page
        this.router.navigate(['contact/profile/' + this.contactProfile.uid + '/allProperties'], navigationExtras);
      }
    }
  ];
  profileFormGroup: FormGroup;
  profileFormConfig: FormConfig[] = [];
  isConfigForm: boolean = false;

  constructor(
    private commonService: CommonService,
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: MessageService
  ) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['propertiesList'] && changes['propertiesList'].currentValue) {
      this.propertiesList = changes['propertiesList'].currentValue;
      // if (!this.isConfigForm) {
      //   this.returnProfileFormConfig();
      // }
    }
  }

  copyEmailToClipboard(copiedText: string) {
    navigator.clipboard.writeText(copiedText);
    this.messageService.add({ severity: 'success', summary: 'Copy text', detail: 'Successful copied text' });
  }

  returnProfileFormConfig() {
    if (this.profileFormConfig.length > 0) {
      this.isConfigForm = true;
    }
    let propCount = 0;
    let formsConfig: FormConfig[] = [];

    this.profileFormGroup = this.formBuilder.group({});

    this.propertiesList.forEach(item => {
      if (item.moduleCode === "CONT_INFO" || item.moduleCode === "COMP_INFO") {
        item.propertiesList.forEach(prop => {
          let control = new FormControl(this.commonService.returnControlTypeEmptyValue(prop), Validators.required);
          this.profileFormGroup.addControl(prop.propertyCode, control);

          let forms: FormConfig = {
            id: prop.uid,
            name: prop.propertyCode,
            type: CONTROL_TYPE.Textbox,
            label: prop.propertyName,
            fieldControl: this.profileFormGroup.controls[prop.propertyCode],
            layoutDefine: {
              row: propCount,
              column: 0,
            }
          };

          if (prop.isVisible) {
            if (prop.propertyType === CONTROL_TYPE_CODE.Textbox || prop.propertyType === CONTROL_TYPE_CODE.Textarea || prop.propertyType === CONTROL_TYPE_CODE.Email || prop.propertyType === CONTROL_TYPE_CODE.Phone || prop.propertyType === CONTROL_TYPE_CODE.Url || prop.propertyType === CONTROL_TYPE_CODE.Number) {
              forms = {
                id: prop.uid,
                name: prop.propertyCode,
                type: CONTROL_TYPE.Textbox,
                label: prop.propertyName,
                fieldControl: this.profileFormGroup.controls[prop.propertyCode],
                layoutDefine: {
                  row: propCount,
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
                fieldControl: this.profileFormGroup.controls[prop.propertyCode],
                layoutDefine: {
                  row: propCount,
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
                fieldControl: this.profileFormGroup.controls[prop.propertyCode],
                layoutDefine: {
                  row: propCount,
                  column: 0,
                }
              }
            }

            formsConfig.push(forms);
            propCount++;
          }
        });
      }
    });
    this.profileFormConfig = formsConfig;
  }
}
