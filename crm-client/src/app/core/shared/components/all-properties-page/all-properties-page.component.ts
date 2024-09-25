import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonService, CompanyDto, ContactDto, PropertiesDto, PropertyDataDto, PropertyGroupDto, PropertyLookupDto, StateDto, UpdateCompanyDto, UpdateContactDto, UserDto } from '../../../services/common.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CONTROL_TYPE, CONTROL_TYPE_CODE, FormConfig, OptionsModel } from '../../../services/components.service';
import { debounceTime, distinctUntilChanged, map, Observable, ObservableLike, of } from 'rxjs';

@Component({
  selector: 'app-all-properties-page',
  templateUrl: './all-properties-page.component.html',
  styleUrl: './all-properties-page.component.scss'
})
export class AllPropertiesPageComponent implements OnChanges {
  @Input() module: 'CONT' | 'COMP' = 'CONT';
  @Input() propertyList: PropertyGroupDto[] = [];
  @Input() contactProfile: ContactDto = new ContactDto();
  @Input() companyProfile: CompanyDto = new CompanyDto();

  searchControl: FormControl = new FormControl('');
  hideEmptySearchCheckbox = [{ label: 'Hide blank properties', value: true }];
  profileFormGroup: FormGroup = new FormGroup({});
  propertyConfig: any[] = [];
  showFormUpdateSidebar: boolean = false;
  propUpdateList: profileUpdateDto[] = [];
  hideCheckFormControl: FormControl = new FormControl();
  countryFormId: string = "";
  stateFormId: string = "";
  countryOptionList: OptionsModel[] = [];
  stateList: Observable<OptionsModel[]>;

  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
  ) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['propertyList'] && changes['propertyList'].currentValue && changes['module'] && changes['module'].currentValue) {
      this.propertyList = changes['propertyList'].currentValue;
      this.commonService.getAllCountry().subscribe(res => {
        this.countryOptionList = res.map(c => {
          return {
            label: c.name,
            value: c.uid
          }
        });
        this.initProfileFormConfig();
      });
    }
  }

  ngOnInit() {
    this.searchControl.valueChanges.subscribe((value) => {
      this.propertyConfig.forEach(item => {
        item.list.forEach((prop: FormConfig) => {
          document.getElementById(prop.id!)!.style.display = 'none';
          if (prop.label!.toString().toLowerCase().includes(value.toLowerCase())) {
            document.getElementById(prop.id!)!.style.display = 'block';
          }
          if (value.toLowerCase().length === 0) {
            document.getElementById(prop.id!)!.style.display = 'block';
          }
        })
      })
    });

    this.hideCheckFormControl.valueChanges.subscribe(item => {
      if (item[0] === true) {
        this.propertyList.forEach(group => {
          group.propertiesList.forEach(prop => {
            document.getElementById(prop.uid!)!.style.display = 'none';
            if (this.profileFormGroup.controls[prop.propertyCode].value) {
              document.getElementById(prop.uid!)!.style.display = 'block';
            }
          })
        })
      }
      else {
        this.propertyList.forEach(group => {
          group.propertiesList.forEach(prop => {
            document.getElementById(prop.uid!)!.style.display = 'block';
          })
        })
      }
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

          if (prop.propertyType === CONTROL_TYPE_CODE.Textbox || prop.propertyType === CONTROL_TYPE_CODE.Textarea) {
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
          else if (prop.propertyType === CONTROL_TYPE_CODE.Url) {
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
              required: prop.isMandatory,
              mode: 'url'
            }
          }
          else if (prop.propertyType === CONTROL_TYPE_CODE.Phone) {
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
              required: prop.isMandatory,
              mode: 'phone'
            }
          }
          else if (prop.propertyType === CONTROL_TYPE_CODE.Number || prop.propertyType === CONTROL_TYPE_CODE.Year) {
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
              required: prop.isMandatory,
              mode: 'number',
              maxLength: prop.propertyType === CONTROL_TYPE_CODE.Year ? 4 : undefined,
              min: prop.propertyType === CONTROL_TYPE_CODE.Year ? 1000 : undefined,
              useGrouping: prop.propertyType === CONTROL_TYPE_CODE.Year ? false : true
            }
          }
          else if (prop.propertyType === CONTROL_TYPE_CODE.Email) {
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
              required: prop.isMandatory,
              mode: 'email',
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
          else if (prop.propertyType === CONTROL_TYPE_CODE.User) {
            let propertyLookupList: OptionsModel[] = [];
            prop.propertyLookupList.forEach((item) => {
              propertyLookupList.push({ label: `${(item as UserDto).displayName} (${(item as UserDto).email})`, value: item.uid });
            });

            forms = {
              id: prop.uid,
              name: prop.propertyCode,
              type: CONTROL_TYPE.Dropdown,
              label: prop.propertyName,
              fieldControl: this.profileFormGroup.controls[prop.propertyCode],
              layoutDefine: {
                row: propCount,
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
              fieldControl: this.profileFormGroup.controls[prop.propertyCode],
              layoutDefine: {
                row: propCount,
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
              fieldControl: this.profileFormGroup.controls[prop.propertyCode],
              layoutDefine: {
                row: propCount,
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
              fieldControl: this.profileFormGroup.controls[prop.propertyCode],
              layoutDefine: {
                row: propCount,
                column: 0,
              },
              dataSourceDependOn: [this.stateFormId],
              dataSourceAction: () => this.getCityList()
            }
          }

          this.profileFormGroup.controls[prop.propertyCode].valueChanges.pipe(
            debounceTime(2000),
            distinctUntilChanged()
          ).subscribe(value => {
            console.log(prop.propertyName)
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
          });

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
        switch (prop.propertyCode) {
          case 'company_name':
            return this.companyProfile.companyName;
          case 'company_website_url':
            return this.companyProfile.companyWebsite
          case 'company_email':
            return this.companyProfile.companyEmail;
          case 'company_owner':
            return this.companyProfile.companyOwnerUid
          default:
            let companyProp: PropertyDataDto[] = JSON.parse(this.companyProfile.companyProperties);
            if (companyProp.find(item => item.uid === prop.uid) && (prop.propertyType === CONTROL_TYPE_CODE.Date || prop.propertyType === CONTROL_TYPE_CODE.DateTime || prop.propertyType === CONTROL_TYPE_CODE.Time)) {
              return new Date(companyProp.find(item => item.uid === prop.uid)!.value);
            }
            return companyProp.find(item => item.uid === prop.uid)?.value;
        }
      }
    }
    else {
      return;
    }
  }

  returnProfileFormConfig(code: string): FormConfig[] {
    return this.propertyConfig.find(item => item.moduleCode === code).list;
  }

  getStateList(): Observable<any[]> {
    if (!this.profileFormGroup.controls['country'].value.length) {
      return of([]);
    }

    return this.commonService.getStateByCountryId(this.profileFormGroup.controls['country'].value).pipe(
      map(res => {
        return res.map(val => ({
          value: val.uid,
          label: val.name
        }))
      })
    );
  }

  getCityList(): Observable<any[]> {
    if (!this.profileFormGroup.controls['state'].value.length) {
      return of([]);
    }

    return this.commonService.getCityByStateId(this.profileFormGroup.controls['state'].value).pipe(
      map(res => {
        console.log(res)
        return res.map(val => ({
          value: val.uid,
          label: val.name
        }))
      })
    );
  }

  cancelButton() {
    this.showFormUpdateSidebar = false;
  }

  saveButton() {
    // cast property value into contact/company object
    if (this.module === 'CONT') {
      let updateContact: UpdateContactDto = new UpdateContactDto();
      let profileProperty: PropertyDataDto[] = JSON.parse(this.contactProfile.contactProperties);
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
            updateContact.contactLeadStatusUid = prop.value;
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
      });

      this.commonService.updateContact([updateContact]).subscribe(res => {
        this.propUpdateList = [];
        this.showFormUpdateSidebar = false;
      });
    }
    else {
      let updateCompany: UpdateCompanyDto = new UpdateCompanyDto();
      let profileProperty: PropertyDataDto[] = JSON.parse(this.companyProfile.companyProperties);
      updateCompany.uid = this.companyProfile.uid;
      this.propUpdateList.forEach(prop => {
        switch (prop.property.propertyCode) {
          case 'company_name':
            updateCompany.companyName = prop.value;
            break;
          case 'company_website_url':
            updateCompany.companyWebsite = prop.value;
            break;
          case 'company_email':
            updateCompany.companyEmail = prop.value;
            break;
          case 'company_owner':
            updateCompany.companyOwnerUid = prop.value;
            break;
          case 'lead_status':
            updateCompany.companyLeadStatusId = prop.value;
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
            updateCompany.companyProperties = JSON.stringify(profileProperty);
        }
      });

      this.commonService.updateCompany([updateCompany]).subscribe(res => {
        this.propUpdateList = [];
        this.showFormUpdateSidebar = false;
      });
    }
  }
}

class profileUpdateDto {
  property: PropertiesDto;
  value: string;
}