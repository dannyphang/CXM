import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  menuItem: MenuItem[] = [];
  searchFormControl: FormControl = new FormControl("");
  userMenuItem: MenuItem[] | undefined;

  constructor(
    private router: Router,
  ) {

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

    this.userMenuItem = [
      {
        separator: true
      },
      // {
      //   label: 'Documents',
      //   items: [
      //     {
      //       label: 'New',
      //       icon: 'pi pi-plus',
      //     },
      //     {
      //       label: 'Search',
      //       icon: 'pi pi-search',
      //     }
      //   ]
      // },
      {
        label: 'Profile',
        items: [
          {
            label: 'Settings',
            icon: 'pi pi-cog',
          },
          {
            label: 'Messages',
            icon: 'pi pi-inbox',
          },
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
          }
        ]
      }
    ]
  }
}
