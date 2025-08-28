import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CompanyDto, ContactDto, ModuleDto } from '../../../../services/common.service';
import { FormControl } from '@angular/forms';
import { ActivityDto, ActivityModuleDto, ActivityService } from '../../../../services/activity.service';
import { ToastService } from '../../../../services/toast.service';
import { UserPermissionDto } from '../../../../services/core-http.service';
import { TranslateService } from '@ngx-translate/core';
import { debounce, debounceTime } from 'rxjs';
import { BaseCoreAbstract } from '../../../base/base-core.abstract';
import { CoreAuthService } from '../../../../services/core-auth.service';

@Component({
  selector: 'app-middle-panel',
  templateUrl: './middle-panel.component.html',
  styleUrl: './middle-panel.component.scss'
})
export class MiddlePanelComponent extends BaseCoreAbstract implements OnInit, OnChanges {
  @Input() propertiesList: ModuleDto[] = [];
  @Input() module: 'CONT' | 'COMP' = 'CONT';
  @Input() contactProfile: ContactDto = new ContactDto();
  @Input() companyProfile: CompanyDto = new CompanyDto();
  @Input() activitiesList: ActivityDto[] = [];
  @Input() permission: UserPermissionDto[] = [];
  @Output() activityListEmit: EventEmitter<any> = new EventEmitter<any>();

  isOpenDialog: boolean = false;
  isOpenCreateDialog: boolean = false;
  activityModuleList: ModuleDto[] = [];
  activityControlList: ActivityModuleDto[] = [];
  subActivityModuleList: ModuleDto[] = [];
  searchControl: FormControl = new FormControl();
  searchIcon: string = "pi pi-search";
  searchFields: string[] = [];
  filteredActivities: ActivityDto[] = [];

  actionMenu: any[] = [
    {
      label: 'Collapse all',
      icon: 'pi pi-arrow-down-left-and-arrow-up-right-to-center',
      command: () => {
        this.activitiesList.forEach(act => {
          act.isExpand = act.isExpand ? false : act.isExpand;
        });
      }
    },
    {
      label: 'Expand all',
      icon: 'pi pi-arrow-up-right-and-arrow-down-left-from-center',
      command: () => {
        this.activitiesList.forEach(act => {
          act.isExpand = true;
        });
      }
    }
  ];

  dialogActivityTab: ModuleDto = new ModuleDto();

  constructor(
    private activityService: ActivityService,
    private toastService: ToastService,
    private translateService: TranslateService,
    protected override authCoreService: CoreAuthService
  ) {
    super(authCoreService);
  }

  ngOnInit() {
    this.activityService.getAllActivityModule().subscribe((res) => {
      if (res.isSuccess) {
        this.activityModuleList = res.data.activityModuleList;
        this.activityControlList = res.data.activityControlList;
        this.subActivityModuleList = res.data.subActivityModuleList;
      }
      else {
        this.toastService.addSingle({
          message: res.responseMessage,
          severity: 'error'
        });
      }
    });

    this.searchFields = [
      this.translateService.instant('ACTIVITY.EMAIL_SUBJECT'),
      this.translateService.instant('ACTIVITY.NOTE_BODY'),
      this.translateService.instant('ACTIVITY.CALL_BODY'),
      this.translateService.instant('ACTIVITY.MEETING_BODY'),
    ];

    this.searchControl.valueChanges.pipe(
      debounceTime(500)
    ).subscribe((value) => {
      this.filterActivitiesBySearchTerm(value);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activitiesList'] && changes['activitiesList'].currentValue) {
      this.filteredActivities = this.activitiesList;
    }
  }

  returnLogActivityLable(module: ModuleDto) {
    return this.subActivityModuleList.find(sam => sam.moduleCode === 'LOG' && sam.moduleSubCode === module.moduleCode)?.moduleName;
  }

  returnCreateActivityLable(module: ModuleDto) {
    return this.subActivityModuleList.find(sam => sam.moduleCode === 'CREATE' && sam.moduleSubCode === module.moduleCode)?.moduleName;
  }

  getActivityControlList(activity: ModuleDto): any {
    return this.activityControlList;
  }

  activityButtonOnClick(activityTab: ModuleDto) {
    this.isOpenDialog = true;
    this.dialogActivityTab = this.subActivityModuleList.find(sam => sam.moduleSubCode === activityTab.moduleCode);
  }

  activityCreateButtonOnClick(activityTab: ModuleDto) {
    this.isOpenCreateDialog = true;
    this.dialogActivityTab = this.subActivityModuleList.find(sam => sam.moduleSubCode === activityTab.moduleCode && sam.moduleCode === 'CREATE');
  }

  activityDialogCloseEmit() {
    this.isOpenDialog = false;
    this.activityListEmit.emit();
  }

  activityCreateDialogCloseEmit() {
    this.isOpenCreateDialog = false;
    this.activityListEmit.emit();
  }

  returnUpComingActivityList(code: string): ActivityDto[] {
    if (code === 'ALL') {
      return this.filteredActivities.filter(act => !act.isPinned && new Date(act.activityDatetime) >= new Date());
    }
    return this.filteredActivities.filter(act => act.activityModuleSubCode === code && !act.isPinned && new Date(act.activityDatetime) >= new Date());
  }

  returnPastActivityList(code: string): ActivityDto[] {
    if (code === 'ALL') {
      return this.filteredActivities.filter(act => !act.isPinned && new Date(act.activityDatetime) < new Date());
    }
    return this.filteredActivities.filter(act => act.activityModuleSubCode === code && !act.isPinned && new Date(act.activityDatetime) < new Date());
  }

  returnIsPinnedActivityList(code: string): ActivityDto[] {
    if (code === 'ALL') {
      return this.filteredActivities.filter(act => act.isPinned);
    }
    return this.filteredActivities.filter(act => act.activityModuleSubCode === code && act.isPinned);
  }

  returnModule(activity: ActivityDto) {
    return this.activityModuleList.find(a => a.moduleCode === activity.activityModuleSubCode);
  }

  returnSubModuleList(activityTab: ModuleDto): ModuleDto[] {
    return this.subActivityModuleList.filter(a => a.moduleSubCode === activityTab.moduleCode);
  }

  isIncludedActivity(activityTab: ModuleDto, type: string): boolean {
    return this.subActivityModuleList.some(sam => sam.moduleCode === type && sam.moduleSubCode === activityTab.moduleCode);
  }

  filterActivitiesBySearchTerm(searchTerm: string) {
    let filteredActivities: ActivityDto[] = [];
    this.activitiesList.forEach(activity => {
      // email subject
      if (activity.activityType?.email && activity.activityType?.email?.subject && activity.activityType?.email?.subject.toLowerCase().includes(searchTerm.toLowerCase())) {
        filteredActivities.push(activity);
      }

      // note body
      if (activity.activityModuleSubCode === "NOTE" && activity.activityContent.toLowerCase().includes(searchTerm.toLowerCase())) {
        filteredActivities.push(activity);
      }

      // call body
      if (activity.activityModuleSubCode === "CALL" && activity.activityContent.toLowerCase().includes(searchTerm.toLowerCase())) {
        filteredActivities.push(activity);
      }

      // meeting body
      if (activity.activityModuleSubCode === "MEET") {
        if (activity.activityContent.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (activity.activityType?.meeting && activity.activityType?.meeting?.subject && activity.activityType?.meeting?.subject.toLowerCase().includes(searchTerm.toLowerCase()))) {
          filteredActivities.push(activity);
        }
      }
    });

    this.filteredActivities = filteredActivities;
  }
}
