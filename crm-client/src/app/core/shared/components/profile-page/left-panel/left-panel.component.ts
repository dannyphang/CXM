import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CommonService, ContactDto, PropertiesDto, PropertyDataDto, PropertyGroupDto, UpdateContactDto } from '../../../../services/common.service';
import { CONTROL_TYPE, CONTROL_TYPE_CODE, FormConfig, OptionsModel } from '../../../../services/components.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-left-panel',
  templateUrl: './left-panel.component.html',
  styleUrl: './left-panel.component.scss'
})
export class LeftPanelComponent implements OnChanges {
  @Input() propertiesList: PropertyGroupDto[] = [];
  @Input() module: 'CONT' | 'COMP' = 'CONT';
  @Input() contactProfile: ContactDto = new ContactDto();
  @Output() contactProfileUpdateEmit: EventEmitter<any> = new EventEmitter<any>();

  actionMenu: any[] = [
    {
      label: 'View all properties',
      icon: '',
      command: () => {
        const navigationExtras: NavigationExtras = {
          state: {
            data: this.propertiesList,
            profile: this.contactProfile
          }
        };

        // navigate to setting page
        this.router.navigate(['contact/profile/' + this.contactProfile.uid + '/allProperties'], navigationExtras);
      }
    }
  ];
  profileFormGroup: FormGroup;
  profileFormConfig: FormConfig[] = [];
  showFormUpdateSidebar: boolean = false;
  propUpdateList: profileUpdateDto[] = [];
  isAvatarEdit: boolean = false;
  isShowAvatarEditDialog: boolean = true;
  profilePhotoFile: File;
  profilePhotoFileBlob: Blob;
  profileImg: string = 'https://firebasestorage.googleapis.com/v0/b/crm-project-9b8c9.appspot.com/o/Image/Contact/img1.png?alt=media';

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

      this.returnProfileFormConfig();

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
  }

  ngOnInit() {

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

            // insert profile value into form
            // this.bindProfileValue(prop);

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
          let contactProp: PropertyDataDto[] = JSON.parse(this.contactProfile.contactProperties);
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

    this.commonService.updateContact([updateContact]).subscribe(res => {
      this.contactProfileUpdateEmit.emit(updateContact);
    });
  }

  editPic() {
    this.isShowAvatarEditDialog = !this.isShowAvatarEditDialog;
  }

  imageFileUpload(event: any) {
    this.profilePhotoFile = event.target.files[0];
    this.changeFile(event.target.files[0]).then(item => {
      this.profilePhotoFileBlob = new Blob([item]);
      this.profileImg = item;
    });
  }

  changeFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  imageFileUploadBtn() {
    console.log(this.profilePhotoFile)
    this.commonService.uploadProfileImage(this.profilePhotoFile, this.profilePhotoFileBlob, this.module === 'CONT' ? "Image/Contact/" : "Image/Company/").subscribe(res => {
      console.log(res)
      this.profileImg = res.downloadUrl;
    })
  }
}

class profileUpdateDto {
  property: PropertiesDto;
  value: string;
}