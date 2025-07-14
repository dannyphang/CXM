import { Component, ElementRef, HostListener, SimpleChanges, ViewChild } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { BaseCoreAbstract } from '../../core/shared/base/base-core.abstract';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { CoreHttpService, PermissionObjDto, UserPermissionDto } from '../../core/services/core-http.service';
import { CommonService, WindowSizeDto } from '../../core/services/common.service';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { CoreAuthService, UserDto } from '../../core/services/core-auth.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.scss'
})
export class SettingComponent extends BaseCoreAbstract {
  @ViewChild('settingContainer', { static: false }) settingContainerRef!: ElementRef;
  permission: UserPermissionDto[] = [];
  module = 'SETTING';
  settingMenuItem: MenuItem[] = [];
  userC: UserDto;
  fragment: string;
  activeSection: string = 'general'; // default section

  windowSize: WindowSizeDto = new WindowSizeDto();

  //#region permission
  settingPermit: PermissionObjDto = new PermissionObjDto();

  //#region 

  constructor(
    private translateService: TranslateService,
    private authService: AuthService,
    private coreService: CoreHttpService,
    private commonService: CommonService,
    private titleService: Title,
    private route: ActivatedRoute,
    private coreAuthService: CoreAuthService,
    private location: Location,
  ) {
    super();
    this.windowSize = this.commonService.windowSize;
  }

  async ngOnInit() {
    this.userC = this.coreAuthService.userC;
    this.settingMenuItem = [
      {
        label: 'SETTING.GENERAL',
        icon: '',
        command: () => {
          const element = document.getElementById('general');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        },
        visible: true,
      },
      {
        label: 'SETTING.TEAM_MANAGEMENT',
        icon: '',
        command: () => {
          const element = document.getElementById('team');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        },
        visible: this.userC?.roleId === 1 || this.returnPermissionObj('TEAM', 'display')
      },
      {
        label: 'SETTING.PROPERTY',
        icon: '',
        command: () => {
          const element = document.getElementById('property');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        },
        visible: this.userC?.roleId === 1 || this.returnPermissionObj('PROPERTY', 'display')
      },
    ];
    this.authService.getUserPermission(this.userC?.uid ?? '').then(permission => {
      this.permission = permission;
    })
    this.titleService.setTitle(this.translateService.instant('COMMON.SETTING'));

    this.route.fragment.subscribe((fragment: string | null) => {
      setTimeout(() => {
        this.fragment = fragment;
        const element = document.getElementById(this.fragment);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 2000);
    });
  }

  @HostListener('window:scroll', ['$event']) // for window scroll events
  onScroll(event: any) {
    if (this.windowSize.desktop) {
      if (window.scrollY > 116) {
        // document.getElementById("setting_left")!.style.width = "280px";
        document.getElementById("setting_menu_panel")!.style.position = "fixed";
        document.getElementById("setting_menu_panel")!.style.top = "10px";
      }
      else {
        // document.getElementById("setting_left")!.style.width = "280px";
        document.getElementById("setting_menu_panel")!.style.position = "relative";
        document.getElementById("setting_menu_panel")!.style.top = "0";
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.commonService.updateWindowSize();
    this.windowSize = this.commonService.windowSize;
  }

  ngAfterViewInit() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            this.activeSection = id;
            this.highlightMenuItem();
            this.location.replaceState(this.location.path().split('#')[0] + `#${id}`);
          }
        });
      },
      {
        root: this.settingContainerRef?.nativeElement,
        threshold: 0.5,
      }
    );

    const sectionIds = ['general', 'team', 'property'];
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
      }
    });
  }

  highlightMenuItem() {
    this.settingMenuItem = this.settingMenuItem.map(item => {
      const idMap = {
        [this.translateService.instant('SETTING.GENERAL')]: 'general',
        [this.translateService.instant('SETTING.TEAM_MANAGEMENT')]: 'team',
        [this.translateService.instant('SETTING.PROPERTY')]: 'property'
      };

      const sectionId = idMap[item.label];
      return {
        ...item,
        styleClass: sectionId === this.activeSection ? 'active-menu-item' : ''
      };
    });
  }

  returnPermissionObj(module: string, action: string): boolean {
    return this.permission?.find(p => p.module === module).permission[action];
  }
}
