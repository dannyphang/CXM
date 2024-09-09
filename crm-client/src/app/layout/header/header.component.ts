import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { User } from 'firebase/auth';
import { MenuItem } from 'primeng/api';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { CommonService } from '../../core/services/common.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  menuItem: MenuItem[] = [];
  searchFormControl: FormControl = new FormControl("");
  userMenuItem: MenuItem[] | undefined;
  languageMenuItem: MenuItem[] | undefined;
  currentUser: User | null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private translateService: TranslateService,
    private commonService: CommonService
  ) {


    this.authService.getCurrentUser().then(res => {
      // if (!res) {
      //   this.router.navigate(["/signin"]);
      // }
      // else {
      //   this.currentUser = res;
      // }

      this.currentUser = res;
      // this.userMenuItem = [
      //   {
      //     separator: true
      //   },
      //   {
      //     label: this.translateService.instant('HEADER.PROFILE'),
      //     items: [
      //       {
      //         label: this.translateService.instant('HEADER.SETTING'),
      //         icon: 'pi pi-cog',
      //       },
      //       {
      //         label: this.translateService.instant('HEADER.LANGUAGE.CHANGE'),
      //         icon: 'pi pi-language',
      //         items: [
      //           {
      //             label: this.translateService.instant('HEADER.LANGUAGE.EN'),
      //           },
      //           {
      //             label: this.translateService.instant('HEADER.LANGUAGE.CN'),
      //           },
      //         ]

      //       }
      //     ]
      //   },
      //   {
      //     separator: true
      //   },
      //   {
      //     items: [
      //       {
      //         label: this.translateService.instant('BUTTON.LOGOUT'),
      //         icon: 'pi pi-sign-out',
      //         command: () => {
      //           this.authService.signOut();
      //           window.location.reload();
      //         },
      //         visible: this.currentUser ? true : false
      //       },
      //       {
      //         label: this.translateService.instant('BUTTON.LOGIN'),
      //         icon: "pi pi-sign-in",
      //         command: () => {
      //           this.redirectToSignIn();
      //         },
      //         visible: this.currentUser ? false : true
      //       },
      //       {
      //         label: 'Check current user',
      //         icon: 'pi pi-sign-out',
      //         command: () => {
      //           console.log(this.authService.getCurrentUser())
      //         },
      //         visible: false
      //       }
      //     ]
      //   }
      // ];

      this.userMenuItem = [
        {
          label: '',
        },
        {
          label: this.translateService.instant('HEADER.SETTING'),
          icon: 'pi pi-cog',
        },
        {
          label: this.translateService.instant('HEADER.LANGUAGE.CHANGE'),
          icon: 'pi pi-language',
          items: [
            {
              label: this.translateService.instant('HEADER.LANGUAGE.EN'),
              command: () => {
                this.translateService.use('en');
                this.commonService.setLanguage('en');
              }
            },
            {
              label: this.translateService.instant('HEADER.LANGUAGE.CN'),
              command: () => {
                this.translateService.use('zh');
                this.commonService.setLanguage('zh');
              }
            },
          ]

        },
        {
          separator: true
        },
        {
          label: this.translateService.instant('BUTTON.LOGOUT'),
          icon: 'pi pi-sign-out',
          command: () => {
            this.authService.signOut();
            window.location.reload();
          },
          visible: this.currentUser ? true : false
        },
        {
          label: this.translateService.instant('BUTTON.LOGIN'),
          icon: "pi pi-sign-in",
          command: () => {
            this.redirectToSignIn();
          },
          visible: this.currentUser ? false : true
        },
        {
          label: 'Check current user',
          icon: 'pi pi-sign-out',
          command: () => {
            console.log(this.authService.getCurrentUser())
          },
          visible: false
        }
      ];
    });
  }

  ngOnInit() {
    this.menuItem = [
      {
        label: 'Contact',
        icon: '',
        tooltip: "COMMON.CONTACT",
        command: () => {
          this.router.navigate(["/contact"]);
        }
      },
      {
        label: 'Company',
        icon: '',
        tooltip: "COMMON.COMPANY",
        command: () => {
          this.router.navigate(["/company"]);
        }
      },
    ];

    this.searchFormControl.valueChanges.pipe(debounceTime(2000),
      distinctUntilChanged()).subscribe(value => {
        console.log(value);
      });


  }

  redirectToSignIn() {
    this.router.navigate(["/signin"]);
  }
}
