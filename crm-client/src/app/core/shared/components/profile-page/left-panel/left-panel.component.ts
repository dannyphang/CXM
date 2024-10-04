import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CommonService, CompanyDto, ContactDto, PropertiesDto, PropertyDataDto, PropertyGroupDto, PropertyLookupDto, UpdateCompanyDto, UpdateContactDto } from '../../../../services/common.service';
import { CONTROL_TYPE, CONTROL_TYPE_CODE, FormConfig, OptionsModel } from '../../../../services/components.service';
import { debounceTime, distinctUntilChanged, map, Observable, of } from 'rxjs';
import { StorageService } from '../../../../services/storage.service';
import { DEFAULT_PROFILE_PIC_URL } from '../../../constants/common.constants';

@Component({
  selector: 'app-left-panel',
  templateUrl: './left-panel.component.html',
  styleUrl: './left-panel.component.scss'
})
export class LeftPanelComponent implements OnChanges {
  @Input() propertiesList: PropertyGroupDto[] = [];
  @Input() module: 'CONT' | 'COMP' = 'CONT';
  @Input() contactProfile: ContactDto = new ContactDto();
  @Input() companyProfile: CompanyDto = new CompanyDto();
  @Output() profileUpdateEmit: EventEmitter<any> = new EventEmitter<any>();

  actionMenu: any[] = [
    {
      label: 'View all properties',
      icon: '',
      command: () => {
        const navigationExtras: NavigationExtras = {
          state: {
            data: this.propertiesList,
            profile: this.module === 'CONT' ? this.contactProfile : this.companyProfile,
            module: this.module
          }
        };

        // navigate to setting page
        if (this.module === 'CONT') {
          this.router.navigate(['contact/profile/' + this.contactProfile.uid + '/allProperties'], navigationExtras);
        }
        else {
          this.router.navigate(['company/profile/' + this.companyProfile.uid + '/allProperties'], navigationExtras);
        }
      }
    }
  ];
  profileFormGroup: FormGroup;
  profileFormConfig: FormConfig[] = [];
  showFormUpdateSidebar: boolean = false;
  propUpdateList: profileUpdateDto[] = [];
  isAvatarEdit: boolean = false;
  isShowAvatarEditDialog: boolean = false;
  profilePhotoFile: File | null;
  profilePhotoFileBlob: Blob;
  profileImg: string = DEFAULT_PROFILE_PIC_URL;
  countryFormId: string = "";
  stateFormId: string = "";
  countryOptionList: OptionsModel[] = [];
  stateList: Observable<OptionsModel[]>;

  constructor(
    private commonService: CommonService,
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private storageService: StorageService
  ) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['propertiesList'] && changes['propertiesList'].currentValue) {
      this.propertiesList = changes['propertiesList'].currentValue;

      if (this.contactProfile || this.companyProfile) {
        this.returnProfileFormConfig();

      }

      this.checkFormValueChange();
    }

    if (changes['contactProfile'] && changes['contactProfile'].currentValue) {
      if (this.propertiesList) {
        this.returnProfileFormConfig();
      }
      if (this.contactProfile.contactProfilePhotoUrl) {
        this.profileImg = this.contactProfile.contactProfilePhotoUrl;
      }

      this.checkFormValueChange();
    }

    if (changes['companyProfile'] && changes['companyProfile'].currentValue) {
      if (this.propertiesList) {
        this.returnProfileFormConfig();
      }
      if (this.companyProfile.companyProfilePhotoUrl) {
        this.profileImg = this.companyProfile.companyProfilePhotoUrl;
      }

      this.checkFormValueChange();
    }
  }

  checkFormValueChange() {
    // check fieldcontrol update value
    this.profileFormGroup.valueChanges.pipe(
      debounceTime(2000),
      distinctUntilChanged()
    ).subscribe(changedValue => {
      this.propertiesList.forEach(item => {
        if (item.moduleCode === "CONT_INFO" || item.moduleCode === "COMP_INFO") {
          item.propertiesList.forEach(prop => {
            this.profileFormGroup.controls[prop.propertyCode].valueChanges.pipe(
              debounceTime(2000),
              distinctUntilChanged()
            ).forEach(value => {
              console.log(value)
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
          })
        }
      })
    });
  }

  ngOnInit() {
    this.commonService.getAllCountry().subscribe(res => {
      this.countryOptionList = res.map(c => {
        return {
          label: c.name,
          value: c.uid
        }
      });
    });

  }

  copyEmailToClipboard(copiedText: string) {
    navigator.clipboard.writeText(copiedText);
    this.messageService.add({ severity: 'success', summary: 'Copy text', detail: 'Successful copied text' });
  }

  /**  
    initial property form
  **/
  returnProfileFormConfig() {

    let propCount = 0;
    let formsConfig: FormConfig[] = [];

    this.profileFormGroup = this.formBuilder.group({});

    this.propertiesList.forEach(item => {
      if (item.moduleCode === "CONT_INFO" || item.moduleCode === "COMP_INFO") {
        item.propertiesList.forEach(prop => {
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

          if (prop.isVisible) {
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
            else if (prop.propertyType === CONTROL_TYPE_CODE.Postcode) {
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

            formsConfig.push(forms);
            propCount++;
          }
        });
      }
    });
    this.profileFormConfig = formsConfig;
  }

  /**
   * Bind profile value to form
   * @param prop Property object
   */
  bindProfileValue(prop: PropertiesDto) {
    if (this.module === 'CONT') {
      switch (prop.propertyCode) {
        case 'first_name':
          this.profileFormGroup.controls[prop.propertyCode].setValue(this.contactProfile.contactFirstName);
          break;
        case 'last_name':
          this.profileFormGroup.controls[prop.propertyCode].setValue(this.contactProfile.contactLastName);
          break;
        case 'email':
          this.profileFormGroup.controls[prop.propertyCode].setValue(this.contactProfile.contactEmail);
          break;
        case 'phone_number':
          this.profileFormGroup.controls[prop.propertyCode].setValue(this.contactProfile.contactPhone);
          break;
        case 'contact_owner':
          this.profileFormGroup.controls[prop.propertyCode].setValue(this.contactProfile.contactOwnerUid);
          break;
      }
    }
    else {
      switch (prop.propertyCode) {
        case 'company_name':
          this.profileFormGroup.controls[prop.propertyCode].setValue(this.companyProfile.companyName);
          break;
        case 'company_website_url':
          this.profileFormGroup.controls[prop.propertyCode].setValue(this.companyProfile.companyWebsite);
          break;
        case 'company_email':
          this.profileFormGroup.controls[prop.propertyCode].setValue(this.companyProfile.companyEmail);
          break;
        case 'company_owner':
          this.profileFormGroup.controls[prop.propertyCode].setValue(this.companyProfile.companyOwnerUid);
          break;
      }
    }
  }

  returnProfileValue(prop: PropertiesDto) {
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
          let contactProp: PropertyDataDto[] = JSON.parse(this.contactProfile.contactProperties ?? "[]");
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
          let companyProp: PropertyDataDto[] = JSON.parse(this.companyProfile.companyProperties ?? "[]");
          if (companyProp.find(item => item.uid === prop.uid) && (prop.propertyType === CONTROL_TYPE_CODE.Date || prop.propertyType === CONTROL_TYPE_CODE.DateTime || prop.propertyType === CONTROL_TYPE_CODE.Time)) {
            return new Date(companyProp.find(item => item.uid === prop.uid)!.value);
          }
          return companyProp.find(item => item.uid === prop.uid)?.value;
      }
    }
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
        this.profileUpdateEmit.emit(updateContact);
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
        this.profileUpdateEmit.emit(updateCompany);
      });
    }
  }

  editPic() {
    this.isShowAvatarEditDialog = !this.isShowAvatarEditDialog;
  }

  imageFileUpload(event: any) {
    this.profilePhotoFile = event.target.files[0];
    this.changeFile(event.target.files[0]).then(item => {
      this.profilePhotoFileBlob = item;
      this.profileImg = item;
    });
  }

  changeFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  imageFileUploadBtn() {
    if (this.profileImg !== DEFAULT_PROFILE_PIC_URL && this.profilePhotoFile) {
      this.storageService.uploadImage(this.profilePhotoFile, this.module === 'CONT' ? "Image/Contact/" : "Image/Company/").then(url => {
        this.profileImg = url;
        if (this.module === 'CONT') {
          let updateContact: UpdateContactDto = {
            uid: this.contactProfile.uid,
            contactProfilePhotoUrl: this.profileImg
          }
          this.commonService.updateContact([updateContact]).subscribe(res => {
            console.log(res);
            this.isShowAvatarEditDialog = false;
            this.profileUpdateEmit.emit(updateContact);
          })
        }
        else {
          let updateCompany: UpdateCompanyDto = {
            uid: this.companyProfile.uid,
            companyProfilePhotoUrl: this.profileImg
          }
          this.commonService.updateCompany([updateCompany]).subscribe(res => {
            console.log(res);
            this.isShowAvatarEditDialog = false;
            this.profileUpdateEmit.emit(updateCompany);
          })
        }
      });
    }
  }

  onCloseProfileDialog() {
    this.profileImg = this.contactProfile.contactProfilePhotoUrl ? this.contactProfile.contactProfilePhotoUrl : DEFAULT_PROFILE_PIC_URL;
    this.profilePhotoFile = null;
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
    if (!this.profileFormGroup.controls['state'].value?.length) {
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
}

class profileUpdateDto {
  property: PropertiesDto;
  value: string;
}