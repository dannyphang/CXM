import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonService, ContactDto, PropertiesDto, PropertyDataDto, PropertyGroupDto, UpdateContactDto } from '../../../services/common.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CONTROL_TYPE, CONTROL_TYPE_CODE, FormConfig, OptionsModel } from '../../../services/components.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-all-properties-page',
  templateUrl: './all-properties-page.component.html',
  styleUrl: './all-properties-page.component.scss'
})
export class AllPropertiesPageComponent implements OnChanges {
  @Input() module: 'CONT' | 'COMP' = 'CONT';
  @Input() propertyList: PropertyGroupDto[] = [];
  @Input() contactProfile: ContactDto = new ContactDto();
  searchControl: FormControl = new FormControl('');
  hideEmptySearchCheckbox = [{ label: 'Hide blank properties', value: 'hideEmpty' }];
  profileFormGroup: FormGroup;
  propertyConfig: any[] = [];
  showFormUpdateSidebar: boolean = false;
  propUpdateList: profileUpdateDto[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
  ) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['propertyList'] && changes['propertyList'].currentValue) {
      this.propertyList = changes['propertyList'].currentValue;
      this.initProfileFormConfig();
    }
  }

  ngOnInit() {
    this.searchControl.valueChanges.subscribe((value) => {
      console.log(value);
      // for (let i = 0; i < this.propertyList.length; i++) {
      //   if (this.propertyList[i].propertiesList.length > 0) {
      //     this.propertyList[i].isHide = true;
      //     this.propertyList[i].propertiesList.forEach((property) => {
      //       property.isHide = true;
      //       if (property.propertyName.toLowerCase().includes(value.toLowerCase())) {
      //         property.isHide = false;
      //         this.propertyList[i].isHide = false;
      //       }
      //     })
      //   }

      // }

      // this.propertyConfig.forEach(item => {
      //   item.list.forEach((prop: any) => {
      //     prop.visibility = 'hidden'
      //     if (prop.label!.toLowerCase().includes(value.toLowerCase())) {
      //       prop.visibility = 'visible'
      //     }

      //   })
      // })
    });
  }

  initProfileFormConfig() {
    let propCount = 0;

    this.profileFormGroup = this.formBuilder.group({});

    this.propertyList.forEach(item => {
      let formsConfig: FormConfig[] = [];
      item.propertiesList.forEach(prop => {
        if (prop.moduleCat === item.moduleCode) {
          let propProfileValue = this.returnProfileValue(prop);
          let control = new FormControl(propProfileValue ? propProfileValue : this.commonService.returnControlTypeEmptyValue(prop));

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
            },
            required: prop.isMandatory
          };

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
              },
              required: prop.isMandatory
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
              required: prop.isMandatory
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
              },
              required: prop.isMandatory,
              timeOnly: prop.propertyType === CONTROL_TYPE_CODE.Time ? true : false,
              showTime: prop.propertyType !== CONTROL_TYPE_CODE.Date ? true : false
            }
          }

          this.profileFormGroup.controls[prop.propertyCode].valueChanges.pipe(
            debounceTime(2000),
            distinctUntilChanged()
          ).subscribe(value => {
            this.showFormUpdateSidebar = true;

            let profileUpdateObj: profileUpdateDto = {
              property: prop,
              value: value
            };

            // add to the list if not exist else replace the value
            if (!this.propUpdateList.find(item => item.property === prop)) {
              this.propUpdateList.push(profileUpdateObj);
            }
            else {
              this.propUpdateList.find(item => item.property === prop)!.value = value;
            }
          })

          formsConfig.push(forms);
          propCount++;
        }
      });

      this.propertyConfig.push({
        moduleCode: item.moduleCode,
        list: formsConfig
      });
    });
  }

  returnProfileValue(prop: PropertiesDto) {
    if (this.contactProfile) {
      if (this.module === 'CONT') {
        switch (prop.propertyCode) {
          case 'first_name':
            return this.contactProfile.contactFirstName;
          case 'last_name':
            return this.contactProfile.contactLastName
          case 'email':
            return this.contactProfile.contactEmail;
          case 'phone_number':
            return this.contactProfile.contactPhone;
          case 'contact_owner':
            return this.contactProfile.contactOwnerUid
          default:
            let contactProp: PropertyDataDto[] = JSON.parse(this.contactProfile.contactProperties ?? '{}');
            if (contactProp.find(item => item.uid === prop.uid) && (prop.propertyType === CONTROL_TYPE_CODE.Date || prop.propertyType === CONTROL_TYPE_CODE.DateTime || prop.propertyType === CONTROL_TYPE_CODE.Time)) {
              return new Date(contactProp.find(item => item.uid === prop.uid)!.value);
            }
            return contactProp.find(item => item.uid === prop.uid)?.value;
        }
      }
      else {
        return 'return from COMP';
      }
    }
    else {
      return;
    }
  }

  returnProfileFormConfig(code: string): FormConfig[] {
    return this.propertyConfig.find(item => item.moduleCode === code).list;
  }

  cancelButton() {
    this.showFormUpdateSidebar = false;
  }

  saveButton() {
    let updateContact: UpdateContactDto = new UpdateContactDto();
    let profileProperty: PropertyDataDto[] = JSON.parse(this.contactProfile.contactProperties);

    // cast property value into contact/company object
    if (this.module === 'CONT') {
      updateContact.uid = this.contactProfile.uid;
      this.propUpdateList.forEach(prop => {
        switch (prop.property.propertyCode) {
          case 'first_name':
            updateContact.contactFirstName = prop.value;
            break;
          case 'last_name':
            updateContact.contactLastName = prop.value;
            break;
          case 'email':
            updateContact.contactEmail = prop.value;
            break;
          case 'phone_number':
            updateContact.contactPhone = prop.value;
            break;
          case 'contact_owner':
            updateContact.contactOwnerUid = prop.value;
            break;
          case 'lead_status':
            updateContact.contactLeadStatusId = prop.value;
            break;
          default:
            if (!profileProperty.find(item => item.uid === prop.property.uid)) {
              profileProperty.push({
                uid: prop.property.uid,
                propertyCode: prop.property.propertyCode,
                value: this.commonService.setPropertyDataValue(prop.property, prop.value)
              });
            }
            else {
              profileProperty.find(item => item.uid === prop.property.uid)!.value = this.commonService.setPropertyDataValue(prop.property, prop.value);
            }
            updateContact.contactProperties = JSON.stringify(profileProperty);
        }
      })
    }

    // this.commonService.updateContact([updateContact]).subscribe(res => {
    //   // this.contactProfileUpdateEmit.emit(updateContact);
    // });

    console.log(updateContact);
  }
}

class profileUpdateDto {
  property: PropertiesDto;
  value: string;
}