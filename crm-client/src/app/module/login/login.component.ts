import { Component } from '@angular/core';
import { AuthService, CreateUserDto } from '../../core/services/auth.service';
import { CONTROL_TYPE, FormConfig } from '../../core/services/components.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common'
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginFormConfig: FormConfig[] = [];
  loginFormGroup: FormGroup = new FormGroup({
    email: new FormControl("", Validators.required),
    password: new FormControl("", Validators.required),
  });
  signupFormConfig: FormConfig[] = [];
  signupFormGroup: FormGroup = new FormGroup({
    username: new FormControl("", Validators.required),
    email: new FormControl("", Validators.required),
    password: new FormControl("", Validators.required),
    confirmPassword: new FormControl("", Validators.required),
  });
  isLoginMode: boolean = true;

  constructor(
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private _location: Location,
    private translateService: TranslateService
  ) {
    if (this.router.url === '/signin') {
      this.isLoginMode = true;
    }
    else if (this.router.url === '/signup') {
      this.isLoginMode = false;
    }
  }

  ngOnInit() {
    this.initLoginForm();
    this.initSignupForm();
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

  initSignupForm() {
    this.signupFormConfig = [
      {
        label: 'Username',
        type: CONTROL_TYPE.Textbox,
        layoutDefine: {
          row: 0,
          column: 0
        },
        fieldControl: this.signupFormGroup.controls['username'],
        required: true,
        autoFocus: true,
      },
      {
        label: 'Email',
        type: CONTROL_TYPE.Textbox,
        layoutDefine: {
          row: 1,
          column: 0
        },
        fieldControl: this.signupFormGroup.controls['email'],
        required: true,
        mode: 'email'
      },
      {
        label: 'Password',
        type: CONTROL_TYPE.Textbox,
        layoutDefine: {
          row: 2,
          column: 0
        },
        fieldControl: this.signupFormGroup.controls['password'],
        required: true,
        mode: 'password'
      },
      {
        label: 'Confirm Password',
        type: CONTROL_TYPE.Textbox,
        layoutDefine: {
          row: 2,
          column: 1
        },
        fieldControl: this.signupFormGroup.controls['confirmPassword'],
        required: true,
        mode: 'password'
      },
    ]
  }

  cancel() {
    this._location.back();
  }

  submit() {
    if (this.isLoginMode) {
      this.authService.signIn(this.loginFormGroup.controls['email'].value, this.loginFormGroup.controls['password'].value).then(res => {
        console.log(res)
        if (res.status) {
          this.authService.updateCurrentUserInfo();
          this.router.navigate(["/"])
          // console.log(res.user);
        }
        else {
          console.log('wrong username/password')
        }
      });

    }
    else {
      this.authService.signUp(this.signupFormGroup.controls['email'].value, this.signupFormGroup.controls['password'].value).then((userCredential) => {
        // Signed up 
        const user = userCredential.user;

        let createUser: CreateUserDto = {
          uid: user.uid,
          displayName: this.signupFormGroup.controls['username'].value,
          email: user.email ?? ''
        }

        this.authService.createUser([createUser], user.uid).subscribe(res => {
          console.log(res)
        });
      })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(`${errorCode}: ${errorMessage}`)
        });
    }
  }

  toSignUp() {
    this.router.navigate(["/signup"]);
  }

  toSignIn() {
    this.router.navigate(["/signin"]);
  }

  toCreate() {
    this.router.navigate(["/setting/create"]);
  }
}
