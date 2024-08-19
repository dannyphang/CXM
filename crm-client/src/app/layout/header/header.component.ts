import { DatePipe } from '@angular/common';
import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  menuItem: MenuItem[] = [];
  searchFormControl: FormControl = new FormControl("");
  userMenuItem: MenuItem[] | undefined;
  currentUser: User | null;
  isAutoFocus: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.authService.getCurrentUser().then(res => {
      // if (!res) {
      //   this.router.navigate(["/signin"]);
      // }
      // else {
      //   this.currentUser = res;
      // }

      this.currentUser = res;
      this.userMenuItem = [
        {
          separator: true
        },
        {
          label: 'Profile',
          items: [
            {
              label: 'Settings',
              icon: 'pi pi-cog',
            }
          ]
        },
        {
          separator: true
        },
        {
          items: [
            {
              label: 'Logout',
              icon: 'pi pi-sign-out',
              command: () => {
                this.authService.signOut();
                window.location.reload();
              },
              visible: this.currentUser ? true : false
            },
            {
              label: "Login",
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
          ]
        }
      ]
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
