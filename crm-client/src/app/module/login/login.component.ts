import { Component } from '@angular/core';
import { AuthService, CreateUserDto } from '../../core/services/auth.service';
import { CONTROL_TYPE, FormConfig } from '../../core/services/components.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common'
import { TranslateService } from '@ngx-translate/core';
import { PERMISSION_LIST } from '../../core/shared/constants/common.constants';
import { CoreHttpService, UserPermissionDto } from '../../core/services/core-http.service';
import { CoreAuthService } from '../../core/services/core-auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  PERMISSION_LIST = PERMISSION_LIST;
  loginFormConfig: FormConfig[] = [];
  loginFormGroup: FormGroup = new FormGroup({
    email: new FormControl("", Validators.required),
    password: new FormControl("", Validators.required),
  });
  errorMessage: string | null = null;
  isSpin: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private _location: Location,
    private coreAuthService: CoreAuthService,
    private toastService: ToastService
  ) {
  }

  ngOnInit() {
    this.authService.initAuth();
    this.initLoginForm();
  }

  initLoginForm() {
    this.loginFormConfig = [
      {
        label: 'INPUT.EMAIL',
        type: CONTROL_TYPE.Textbox,
        layoutDefine: {
          row: 0,
          column: 0
        },
        fieldControl: this.loginFormGroup.controls['email'],
        autoFocus: true,
        mode: 'email'
      },
      {
        label: 'INPUT.PASSWORD',
        type: CONTROL_TYPE.Textbox,
        layoutDefine: {
          row: 1,
          column: 0
        },
        fieldControl: this.loginFormGroup.controls['password'],
        mode: 'password',
        isValidPassword: false,
      }
    ];
  }

  cancel() {
    this._location.back();
  }

  async submit() {
    this.isSpin = true;
    await this.authService.signInUserAuth(this.loginFormGroup.controls['email'].value, this.loginFormGroup.controls['password'].value).then(user => {
      this.coreAuthService.userC = user;
      this.coreAuthService.getCurrentAuthUser().then(res => {
        this.coreAuthService.userC = res;
        this.router.navigate(["/"]);
      }).catch((error) => {
        this.errorMessage = error.error.message;
      })
    }).catch(error => {
      this.isSpin = false;
      this.errorMessage = error.error.message;
    });

  }
}
