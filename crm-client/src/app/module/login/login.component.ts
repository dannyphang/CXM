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

  constructor(
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private _location: Location,
    private translateService: TranslateService,
    private coreService: CoreHttpService,
    private coreAuthService: CoreAuthService,
  ) {
  }

  ngOnInit() {
    this.authService.initAuth();
    this.initLoginForm();
  }

  initLoginForm() {
    this.loginFormConfig = [
      {
        label: 'Email',
        type: CONTROL_TYPE.Textbox,
        layoutDefine: {
          row: 0,
          column: 0
        },
        fieldControl: this.loginFormGroup.controls['email'],
        required: true,
        autoFocus: true,
        mode: 'email'
      },
      {
        label: 'Password',
        type: CONTROL_TYPE.Textbox,
        layoutDefine: {
          row: 1,
          column: 0
        },
        fieldControl: this.loginFormGroup.controls['password'],
        required: true,
        mode: 'password'
      }
    ];
  }

  cancel() {
    this._location.back();
  }

  async submit() {
    this.coreAuthService.userC = await this.authService.signInUserAuth(this.loginFormGroup.controls['email'].value, this.loginFormGroup.controls['password'].value);
    this.coreAuthService.getCurrentAuthUser().then(res => {
      this.coreAuthService.userC = res;
      this.router.navigate(["/"]);
    })
  }
}
