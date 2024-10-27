import { ChangeDetectorRef, Component, ElementRef } from '@angular/core';
import { AuthService, CreateUserDto } from '../../core/services/auth.service';
import { CONTROL_TYPE, FormConfig } from '../../core/services/components.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common'
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, finalize, map, Observable, Subject, switchMap, takeWhile, timer } from 'rxjs';

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
  forgotFormConfig: FormConfig[] = [];
  signupFormGroup: FormGroup = new FormGroup({
    username: new FormControl("", Validators.required),
    email: new FormControl("", Validators.required),
    password: new FormControl("", Validators.required),
    confirmPassword: new FormControl("", Validators.required),
  });
  forgotEmailFormControl: FormControl = new FormControl("", Validators.required);
  isLoginMode: boolean = true;
  forgotMode: boolean = false;
  seconds: number = 10;
  private startCountdown$ = new BehaviorSubject<boolean>(false);
  timeRemaining$ = this.startCountdown$.pipe(
    switchMap((start) => {
      // If countdown is started, initiate the timer
      return start
        ? timer(0, 1000).pipe(
          map((n) => (this.seconds - n) * 1000),
          takeWhile((n) => n >= 0),
          finalize(() => {
            // Trigger this function when the countdown completes
            this.countingDown = false;
          })
        )
        : [null]; // If not started, emit null
    })
  );
  countingDown: boolean = false;
  sentOtp: boolean = false;
  emailOtpFormControl: FormControl = new FormControl(null, Validators.required);
  resetPassword: boolean = false;
  passwordFormConfig: FormConfig[] = [];
  passwordFormGroup: FormGroup = new FormGroup({
    password: new FormControl("", Validators.required),
    confirmPassword: new FormControl("", Validators.required),
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    private _location: Location) {
    if (this.router.url === '/signin') {
      this.isLoginMode = true;
    }
    else if (this.router.url === '/signup') {
      this.isLoginMode = false;
    }
  }

  ngOnInit() {
    this.authService.initAuth();
    this.initLoginForm();
    this.initSignupForm();
    this.initForgotForm();
    this.initPasswordForm();
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
        required: true,
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
        required: true,
        mode: 'password'
      }
    ];
  }

  initSignupForm() {
    this.signupFormConfig = [
      {
        label: 'INPUT.USERNAME',
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
        label: 'INPUT.EMAIL',
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
        label: 'INPUT.PASSWORD',
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
        label: 'INPUT.CONFIRM_PASSWORD',
        type: CONTROL_TYPE.Textbox,
        layoutDefine: {
          row: 2,
          column: 1
        },
        fieldControl: this.signupFormGroup.controls['confirmPassword'],
        required: true,
        mode: 'password'
      },
    ];
  }

  initForgotForm() {
    this.forgotFormConfig = [
      {
        label: 'INPUT.EMAIL',
        fieldControl: this.forgotEmailFormControl,
        type: CONTROL_TYPE.Textbox,
        layoutDefine: {
          row: 0,
          column: 0,
        }
      }
    ]
  }

  initPasswordForm() {
    this.passwordFormConfig = [
      {
        label: 'INPUT.NEW_PASSWORD',
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
        label: 'INPUT.CONFIRM_PASSWORD',
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
          this.router.navigate(["/"]);
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
          email: user.email ?? '',
          roleId: 3
        }

        this.authService.createUser([createUser], user.uid).subscribe(res => {
          if (res.isSuccess) {
            this.router.navigate(["/signin"])
          }
        });
      })
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

  forgotpassword() {
    this.forgotMode = true;
  }

  getOTP() {
    if (!this.sentOtp) {
      this.resendEmailOtp();
    }
    this.sentOtp = true;
    this.authService.getEmailOTP(this.forgotEmailFormControl.value).subscribe(res => {
      if (res.isSuccess) {
        console.log(res);
      }
    });
  }

  sendEmail() {
    this.authService.submitEmailOtp(this.emailOtpFormControl.value, this.forgotEmailFormControl.value).subscribe(res => {
      if (res.isSuccess) {
        this.resetPassword = true;
      }
    });
    // this.authService.sendPasswordResetEmail(this.forgotEmailFormControl.value).then(res => {
    //   console.log(res)
    // })
  }

  submitReset() {

  }

  resendEmailOtp() {
    this.startCountdown$.next(true);
    this.countingDown = true;
  }
}
