import { DatePipe } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Form, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuItem, MessageService, TreeNode } from 'primeng/api';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { AuthService, TenantDto, UserDto } from '../../core/services/auth.service';
import { User } from 'firebase/auth';
import { DEFAULT_PROFILE_PIC_URL } from '../../core/shared/constants/common.constants';
import { OptionsModel } from '../../core/services/components.service';
import { BaseCoreAbstract } from '../../core/shared/base/base-core.abstract';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent extends BaseCoreAbstract implements OnChanges {
  @Input() user: UserDto;
  @Input() tenantList: TenantDto[] = [];
  @Input() tenantOptionsList: OptionsModel[] = [];

  menuItem: MenuItem[] = [];
  searchFormControl: FormControl = new FormControl("");
  userMenuItem: MenuItem[] | undefined;
  isAutoFocus: boolean = false;
  DEFAULT_PROFILE_PIC_URL = DEFAULT_PROFILE_PIC_URL;
  avatarImage: string | null = this.DEFAULT_PROFILE_PIC_URL;
  tenantFormControl: FormControl = new FormControl("");

  constructor(
    private router: Router,
    private authService: AuthService,
    protected override messageService: MessageService
  ) {
    super(messageService);
    this.tenantFormControl.valueChanges.subscribe(val => {
      let selectedTenant = this.tenantList.find(t => t.uid === val)!;
      this.authService.tenant = selectedTenant;
    })
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

    this.initAvatarMenu();

    this.searchFormControl.valueChanges.pipe(debounceTime(2000),
      distinctUntilChanged()).subscribe(value => {
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tenantOptionsList'] && changes['tenantOptionsList'].currentValue) {
      if (this.tenantList.find(t => t.uid === this.user?.defaultTenantId)) {
        this.authService.tenant = this.tenantList.find(t => t.uid === this.user.defaultTenantId)!;
        this.tenantFormControl = new FormControl(this.authService.tenant.uid);
      }
    }

    if (changes['user'] && changes['user'].currentValue) {
      this.avatarImage = this.user.profilePhotoUrl;

      this.initAvatarMenu();
    }
  }

  initAvatarMenu() {
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
            command: () => {
              this.router.navigate(['/setting']);
            }
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
            visible: this.user ? true : false
          },
          {
            label: "Login",
            icon: "pi pi-sign-in",
            command: () => {
              this.redirectToSignIn();
            },
            visible: this.user ? false : true
          }
        ]
      }
    ];
  }

  redirectToSignIn() {
    this.router.navigate(["/signin"]);
  }

  onTenantChange() {
    this.authService.updateUserFirestore([{
      uid: this.authService.user!.uid,
      defaultTenantId: this.tenantFormControl.value,
    }], this.authService.user?.uid ?? "SYSTEM").subscribe(res => {
      if (res.isSuccess) {
        window.location.reload();
      }
      else {
        this.popMessage({
          message: res.responseMessage,
          severity: 'error'
        });
      }
    })

  }
}
