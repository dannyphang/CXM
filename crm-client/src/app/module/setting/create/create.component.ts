import { Component, Input } from '@angular/core';
import { BaseCoreAbstract } from '../../../core/shared/base/base-core.abstract';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { CONTROL_TYPE, FormConfig, OptionsModel } from '../../../core/services/components.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DEFAULT_PROFILE_PIC_URL } from '../../../core/shared/constants/common.constants';
import { StorageService } from '../../../core/services/storage.service';
import { AuthService, CreateUserDto, UpdateUserDto } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { CoreHttpService, UserPermissionDto } from '../../../core/services/core-http.service';
import { CoreAuthService, UserDto } from '../../../core/services/core-auth.service';
import { CommonService } from '../../../core/services/common.service';
import { map } from 'rxjs';
import { VerifiedEnum } from '../../../core/shared/constants/property.constant';
import { CalendarService } from '../../../core/services/calendar.service';

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
  createFormGroup = new FormGroup({
    first_name: new FormControl(""),
    last_name: new FormControl(""),
    nickname: new FormControl(""),
    displayName: new FormControl("", Validators.required),
    email: new FormControl({ value: "", disabled: true }),
    verified_email: new FormControl({ value: 2, disabled: true }),
    phone: new FormControl(""),
    password: new FormControl(""),
    confirm_password: new FormControl(""),
    language: new FormControl(0),
    calendarEmail: new FormControl("", Validators.email),
    calendarId: new FormControl(""),
  });
  // profile pic
  isShowAvatarEditDialog: boolean = false;
  profileImg: string = DEFAULT_PROFILE_PIC_URL;
  profilePhotoFile: File | null;
  profilePhotoFileBlob: Blob;
  isAvatarEdit: boolean = false;
  profilePhotoUrl = '';
  calendarList: OptionsModel[] = [];

  constructor(
    private translateService: TranslateService,
    private storageService: StorageService,
    private authService: AuthService,
    private toastService: ToastService,
    private coreService: CoreHttpService,
    protected coreAuthService: CoreAuthService,
    private commonService: CommonService,
    private calendarService: CalendarService,
  ) {
    super(coreAuthService)
  }

  ngOnInit() {
    this.getCurrentUser();
    this.initCreateForm();
  }

  getCurrentUser() {
    this.userProfile = this.coreAuthService.userC;
    this.createFormGroup.controls['displayName'].setValue(this.userProfile.displayName, { emitEvent: false });
    this.createFormGroup.controls['first_name'].setValue(this.userProfile.firstName, { emitEvent: false });
    this.createFormGroup.controls['last_name'].setValue(this.userProfile.lastName, { emitEvent: false });
    this.createFormGroup.controls['nickname'].setValue(this.userProfile.nickname, { emitEvent: false });
    this.createFormGroup.controls['email'].setValue(this.userProfile.email, { emitEvent: false });
    this.createFormGroup.controls['verified_email'].setValue(this.userProfile.emailVerified ?? 2, { emitEvent: false });
    this.createFormGroup.controls['phone'].setValue(this.userProfile.phoneNumber, { emitEvent: false });
    this.createFormGroup.controls['language'].setValue(this.userProfile.setting?.defaultLanguage, { emitEvent: false });
    this.createFormGroup.controls['calendarEmail'].setValue(this.userProfile.setting?.calendarEmail, { emitEvent: false });
    this.createFormGroup.controls['calendarId'].setValue(this.userProfile.setting?.calendarId ?? this.userProfile.setting?.calendarEmail, { emitEvent: false });

    this.profilePhotoUrl = this.userProfile.profilePhotoUrl;
  }

  initCreateForm() {
    this.calendarService.fetchCalendarList(this.coreAuthService.userC.setting?.calendarEmail).then((res) => {
      if (res.isSuccess) {
        this.calendarList = res.data.map(calendar => ({
          label: calendar.summary,
          value: calendar.id,
          preIcon: {
            icon: 'pi pi-circle-fill',
            style: {
              color: calendar.backgroundColor,
              'font-size': '10px'
            }
          }
        }));
      }
    }).catch(error => {
      console.log(error);
    }).finally(() => {

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
          label: ' ',
          type: CONTROL_TYPE.Dropdown,
          fieldControl: this.createFormGroup.controls['verified_email'],
          layoutDefine: {
            row: 2,
            column: 1,
            colSpan: this.coreAuthService.userC.emailVerified ? undefined : 5
          },
          options: [
            {
              label: 'PROFILE.VERIFIED',
              value: VerifiedEnum.Verified
            },
            {
              label: 'PROFILE.UNVERIFIED',
              value: VerifiedEnum.Unverified
            }
          ],
          cssContainer: '',
          disabled: true,
        },
        {
          label: 'BUTTON.VERIFY_EMAIL',
          type: CONTROL_TYPE.Button,
          layoutDefine: {
            row: 2,
            column: 2,
          },
          onClickFunc: (e: any) => {
            this.authService.sentVerifyEmail(this.userProfile).subscribe({
              next: (res) => {
                if (res.isSuccess) {
                  this.toastService.addSingle({
                    message: res.responseMessage,
                  });
                } else {
                  this.toastService.addSingle({
                    message: res.responseMessage,
                    severity: 'error'
                  });
                }
              },
              error: (err) => {
                this.toastService.addSingle({
                  message: err.error?.responseMessage || 'ERROR.VERIFY_EMAIL_FAILED',
                  severity: 'error'
                });
              }
            });
          },
          cssContainer: 'tw-flex tw-items-end',
          visibility: this.coreAuthService.userC.emailVerified === 1 ? 'hidden' : 'visible',
        },
        {
          label: 'PROFILE.PROFILE_PHONE',
          type: CONTROL_TYPE.Textbox,
          fieldControl: this.createFormGroup.controls['phone'],
          layoutDefine: {
            row: 3,
            column: 0
          },
          mode: 'phone'
        },
        {
          label: 'INPUT.PASSWORD',
          type: CONTROL_TYPE.Textbox,
          fieldControl: this.createFormGroup.controls['password'],
          layoutDefine: {
            row: 3,
            column: 1
          },
          mode: 'password'
        },
        {
          label: 'INPUT.CONFIRM_PASSWORD',
          type: CONTROL_TYPE.Textbox,
          fieldControl: this.createFormGroup.controls['confirm_password'],
          layoutDefine: {
            row: 3,
            column: 2
          },
          mode: 'password'
        },
        {
          label: 'PROFILE.LANGUAGE',
          type: CONTROL_TYPE.Dropdown,
          fieldControl: this.createFormGroup.controls['language'],
          layoutDefine: {
            row: 4,
            column: 0
          },
          dataSourceAction: () => {
            return this.commonService.getLanguageOptions().pipe(
              map(
                (res) => res.data.map(lang => ({
                  label: lang.value,
                  value: lang.id
                }))
              )
            );
          },
          defaultValue: this.coreAuthService.userC.setting?.defaultLanguage ?? 1,
          showClear: false,
        },
        {
          label: 'PROFILE.CALENDAR_EMAIL',
          type: CONTROL_TYPE.Textbox,
          fieldControl: this.createFormGroup.controls['calendarEmail'],
          layoutDefine: {
            row: 5,
            column: 0
          },
          mode: 'email',
          disabled: true,
        },
        {
          label: 'PROFILE.CALENDAR',
          type: CONTROL_TYPE.Dropdown,
          fieldControl: this.createFormGroup.controls.calendarId,
          layoutDefine: {
            row: 5,
            column: 1
          },
          options: this.calendarList,
          searchable: true,
        },
        {
          label: 'BUTTON.CONNECT_EMAIL',
          type: CONTROL_TYPE.Button,
          layoutDefine: {
            row: 5,
            column: 2,
          },
          onClickFunc: (e: any) => {
            this.calendarService.callCalendarApi().subscribe({
              next: (res) => {
                if (res.isSuccess) {
                  window.location.href = res.data;
                } else {
                  this.toastService.addSingle({
                    message: res.responseMessage,
                    severity: 'error'
                  });
                }
              },
              error: (err) => {
                this.toastService.addSingle({
                  message: err.error?.responseMessage || 'ERROR.CONNECT_EMAIL_FAILED',
                  severity: 'error'
                });
              }
            });
          },
          cssContainer: 'tw-flex tw-items-end',
        },
      ];
    });
  }

  imageFileUploadBtn() {
    if (this.checkPermission('update', this.module, this.permission)) {
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
    if (this.checkPermission('update', this.module, this.permission)) {
      if (this.createFormGroup.controls['password'].value && this.createFormGroup.controls['confirm_password'].value) {
        if (this.createFormGroup.controls['password'].value === this.createFormGroup.controls['confirm_password'].value) {
          this.authService.updateUserAuthPassword(this.createFormGroup.controls['password'].value, this.userProfile.authUid).subscribe(res => {
            console.log(res.data);
          })
        }
        else {
          this.toastService.addSingle({
            message: 'ERROR.PASSWORD_NOT_MATCH',
            severity: 'error'
          });
        }
      }
      else {
        let updateUser: UpdateUserDto = {
          uid: this.userProfile.uid,
          firstName: this.createFormGroup.controls['first_name'].value,
          lastName: this.createFormGroup.controls['last_name'].value,
          nickname: this.createFormGroup.controls['nickname'].value,
          displayName: this.createFormGroup.controls['displayName'].value,
          email: this.createFormGroup.controls['email'].value,
          phoneNumber: this.createFormGroup.controls['phone'].value,
          profilePhotoUrl: this.profilePhotoUrl ?? '',
          setting: {
            tableFilter: this.userProfile.setting?.tableFilter,
            defaultLanguage: this.createFormGroup.controls['language'].value,
            calendarEmail: this.createFormGroup.controls['calendarEmail'].value,
            calendarId: this.createFormGroup.controls['calendarId'].value,
          }
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
    }
    else {
      this.toastService.addSingle({
        message: 'MESSAGE.PERMISSION_DENIED',
        severity: 'error'
      });
    }
  }
}
