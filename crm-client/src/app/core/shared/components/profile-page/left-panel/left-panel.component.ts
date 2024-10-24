import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CommonService, CompanyDto, ContactDto, PropertiesDto, PropertyDataDto, PropertyGroupDto, PropertyLookupDto, UpdateCompanyDto, UpdateContactDto } from '../../../services/common.service';
import { CONTROL_TYPE, CONTROL_TYPE_CODE, FormConfig, OptionsModel } from '../../../services/components.service';
import { debounceTime, distinctUntilChanged, map, Observable, of } from 'rxjs';
import { StorageService } from '../../../services/storage.service';
import { DEFAULT_PROFILE_PIC_URL } from '../../../constants/common.constants';
import { BasePropertyAbstract } from '../../../base/base-property.abstract';
import { AuthService, PermissionObjDto, UserPermissionDto } from '../../../services/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-left-panel',
  templateUrl: './left-panel.component.html',
  styleUrl: './left-panel.component.scss'
})
export class LeftPanelComponent extends BasePropertyAbstract implements OnChanges {
  @Input() propertiesList: PropertyGroupDto[] = [];
  @Input() module: 'CONT' | 'COMP' = 'CONT';
  @Input() contactProfile: ContactDto = new ContactDto();
  @Input() companyProfile: CompanyDto = new CompanyDto();
  @Input() permission: UserPermissionDto[] = [];
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
            module: this.module,
            permission: this.permission
          }
        };

        // navigate to setting page
        if (this.module === 'CONT') {
          this.router.navigate(['contact/' + this.contactProfile.uid + '/allProperties'], navigationExtras);
        }
        else {
          this.router.navigate(['company/' + this.companyProfile.uid + '/allProperties'], navigationExtras);
        }
      }
    }
  ];
  isAvatarEdit: boolean = false;
  isShowAvatarEditDialog: boolean = false;
  profilePhotoFile: File | null;
  profilePhotoFileBlob: Blob;
  profileImg: string = DEFAULT_PROFILE_PIC_URL;
  roleId: number = 0;

  constructor(
    private router: Router,
    protected override formBuilder: FormBuilder,
    protected override commonService: CommonService,
    protected override messageService: MessageService,
    private storageService: StorageService,
    protected override authService: AuthService,
    protected override translateService: TranslateService
  ) {
    super(formBuilder, commonService, messageService, authService, translateService);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['propertiesList'] && changes['propertiesList'].currentValue) {
      this.propertiesList = changes['propertiesList'].currentValue;

      if (this.contactProfile || this.companyProfile) {
        this.initProfileFormConfig(this.propertiesList, this.module, this.contactProfile, this.companyProfile, true, this.permission);
      }

      this.checkFormValueChange(this.propertiesList);
    }

    if (changes['contactProfile'] && changes['contactProfile'].currentValue) {
      if (this.propertiesList) {
        this.initProfileFormConfig(this.propertiesList, this.module, this.contactProfile, this.companyProfile, true, this.permission);
      }
      if (this.contactProfile.contactProfilePhotoUrl) {
        this.profileImg = this.contactProfile.contactProfilePhotoUrl;
      }

      this.checkFormValueChange(this.propertiesList);
    }

    if (changes['companyProfile'] && changes['companyProfile'].currentValue) {
      if (this.propertiesList) {
        this.initProfileFormConfig(this.propertiesList, this.module, this.contactProfile, this.companyProfile, true, this.permission);
      }
      if (this.companyProfile.companyProfilePhotoUrl) {
        this.profileImg = this.companyProfile.companyProfilePhotoUrl;
      }

      this.checkFormValueChange(this.propertiesList);
    }
  }

  ngOnInit() {
    this.commonService.getAllCountry().subscribe(res => {
      if (res.isSuccess) {
        this.countryOptionList = res.data.map(c => {
          return {
            label: c.name,
            value: c.uid
          }
        });
      }
      else {
        this.popMessage(res.responseMessage, "Error", "error");
      }
    });

    this.roleId = this.authService.userC.roleId;
  }

  copyEmailToClipboard(copiedText: string) {
    navigator.clipboard.writeText(copiedText);
    this.messageService.add({ severity: 'success', summary: 'Copy text', detail: 'Successful copied text' });
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
            contactProfilePhotoUrl: this.profileImg,
            modifiedBy: this.authService.user!.uid
          }
          this.commonService.updateContact([updateContact], this.authService.user?.uid ?? 'SYSTEM').subscribe(res => {
            if (res.isSuccess) {
              this.isShowAvatarEditDialog = false;
              this.profileUpdateEmit.emit(updateContact);
            }
            else {
              this.popMessage(res.responseMessage, "Error", "error");
            }
          })
        }
        else {
          let updateCompany: UpdateCompanyDto = {
            uid: this.companyProfile.uid,
            companyProfilePhotoUrl: this.profileImg,
            modifiedBy: this.authService.user!.uid
          }
          this.commonService.updateCompany([updateCompany], this.authService.user?.uid ?? 'SYSTEM').subscribe(res => {
            if (res.isSuccess) {
              this.isShowAvatarEditDialog = false;
              this.profileUpdateEmit.emit(updateCompany);
            }
            else {
              this.popMessage(res.responseMessage, "Error", "error");
            }

          })
        }
      });
    }
  }

  onCloseProfileDialog() {
    this.profileImg = this.contactProfile.contactProfilePhotoUrl ? this.contactProfile.contactProfilePhotoUrl : DEFAULT_PROFILE_PIC_URL;
    this.profilePhotoFile = null;
  }
}