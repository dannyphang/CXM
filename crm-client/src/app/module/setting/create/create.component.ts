import { Component, Input } from '@angular/core';
import { BaseCoreAbstract } from '../../../core/shared/base/base-core.abstract';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { CONTROL_TYPE, FormConfig } from '../../../core/services/components.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DEFAULT_PROFILE_PIC_URL } from '../../../core/shared/constants/common.constants';
import { StorageService } from '../../../core/services/storage.service';
import { AuthService, CreateUserDto } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { CoreHttpService, UserDto, UserPermissionDto } from '../../../core/services/core-http.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent extends BaseCoreAbstract {
  @Input() permission: UserPermissionDto[] = [];
  @Input() module: string;
  userProfile: UserDto;
  createFormConfig: FormConfig[] = [];
  createFormGroup: FormGroup = new FormGroup({
    first_name: new FormControl(""),
    last_name: new FormControl(""),
    nickname: new FormControl(""),
    displayName: new FormControl("", Validators.required),
    email: new FormControl({ value: "", disabled: true }),
    phone: new FormControl(""),
  });
  // profile pic
  isShowAvatarEditDialog: boolean = false;
  profileImg: string = DEFAULT_PROFILE_PIC_URL;
  profilePhotoFile: File | null;
  profilePhotoFileBlob: Blob;
  isAvatarEdit: boolean = false;
  profilePhotoUrl = '';

  constructor(
    private translateService: TranslateService,
    private storageService: StorageService,
    private authService: AuthService,
    private toastService: ToastService,
    private coreService: CoreHttpService,
  ) {
    super()
  }

  ngOnInit() {
    this.getCurrentUser();
    this.initCreateForm();
  }

  getCurrentUser() {
    this.userProfile = this.coreService.userC;
    this.createFormGroup.controls['displayName'].setValue(this.userProfile.displayName, { emitEvent: false });
    this.createFormGroup.controls['first_name'].setValue(this.userProfile.firstName, { emitEvent: false });
    this.createFormGroup.controls['last_name'].setValue(this.userProfile.lastName, { emitEvent: false });
    this.createFormGroup.controls['nickname'].setValue(this.userProfile.nickname, { emitEvent: false });
    this.createFormGroup.controls['email'].setValue(this.userProfile.email, { emitEvent: false });
    this.createFormGroup.controls['phone'].setValue(this.userProfile.phoneNumber, { emitEvent: false });

    this.profilePhotoUrl = this.userProfile.profilePhotoUrl;
  }

  initCreateForm() {
    this.createFormConfig = [
      {
        label: 'PROFILE.PROFILE_FIRST_NAME',
        type: CONTROL_TYPE.Textbox,
        fieldControl: this.createFormGroup.controls['first_name'],
        layoutDefine: {
          row: 0,
          column: 0
        }
      },
      {
        label: 'PROFILE.PROFILE_LAST_NAME',
        type: CONTROL_TYPE.Textbox,
        fieldControl: this.createFormGroup.controls['last_name'],
        layoutDefine: {
          row: 0,
          column: 1
        }
      },
      {
        label: 'PROFILE.PROFILE_NICKNAME',
        type: CONTROL_TYPE.Textbox,
        fieldControl: this.createFormGroup.controls['nickname'],
        layoutDefine: {
          row: 1,
          column: 0
        }
      },
      {
        label: 'PROFILE.PROFILE_DISPLAYNAME',
        type: CONTROL_TYPE.Textbox,
        fieldControl: this.createFormGroup.controls['displayName'],
        layoutDefine: {
          row: 1,
          column: 1
        }
      },
      {
        label: 'PROFILE.PROFILE_EMAIL',
        type: CONTROL_TYPE.Textbox,
        fieldControl: this.createFormGroup.controls['email'],
        layoutDefine: {
          row: 2,
          column: 0
        },
        mode: 'email'
      },
      {
        label: 'PROFILE.PROFILE_PHONE',
        type: CONTROL_TYPE.Textbox,
        fieldControl: this.createFormGroup.controls['phone'],
        layoutDefine: {
          row: 2,
          column: 1
        },
        mode: 'phone'
      },
    ]
  }

  imageFileUploadBtn() {
    if (this.checkPermission('update', this.module, this.permission, this.coreService.userC.roleId)) {
      if (this.profileImg !== DEFAULT_PROFILE_PIC_URL && this.profilePhotoFile) {
        this.storageService.uploadImage(this.profilePhotoFile, "Image/User/").then(url => {
          this.profileImg = url;
          this.profilePhotoUrl = url;
          if (this.profilePhotoUrl) {
            this.authService.updateUserFirestore([{ profilePhotoUrl: this.profilePhotoUrl, uid: this.userProfile.uid }]).subscribe(res => {
              if (res.isSuccess) {
                this.toastService.addSingle({
                  message: res.responseMessage,
                });
              }
              else {
                this.toastService.addSingle({
                  message: res.responseMessage,
                  severity: 'error'
                });
              }
            })
          }
        });
      }
    }
    else {
      this.toastService.addSingle({
        message: 'MESSAGE.PROPERTY_NOT_EDITABLE',
        severity: 'error'
      });
    }
  }

  onCloseProfileDialog() {
    this.profileImg = this.profilePhotoUrl ?? DEFAULT_PROFILE_PIC_URL;
    this.profilePhotoFile = null;
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

  update() {
    if (this.checkPermission('update', this.module, this.permission, this.coreService.userC.roleId)) {
      let updateUser: CreateUserDto = {
        uid: this.userProfile.uid,
        firstName: this.createFormGroup.controls['first_name'].value,
        lastName: this.createFormGroup.controls['last_name'].value,
        nickname: this.createFormGroup.controls['nickname'].value,
        displayName: this.createFormGroup.controls['displayName'].value,
        email: this.createFormGroup.controls['email'].value,
        phoneNumber: this.createFormGroup.controls['phone'].value,
        profilePhotoUrl: this.profilePhotoUrl ?? ''
      }

      this.authService.updateUserFirestore([updateUser]).subscribe(res => {
        if (res.isSuccess) {
          this.toastService.addSingle({
            message: res.responseMessage,
          });
        }
        else {
          this.toastService.addSingle({
            message: res.responseMessage,
            severity: 'error'
          });
        }
      })
    }
    else {
      this.toastService.addSingle({
        message: 'MESSAGE.NO_PERMISSION_UPDATE',
        severity: 'error'
      });
    }
  }
}
