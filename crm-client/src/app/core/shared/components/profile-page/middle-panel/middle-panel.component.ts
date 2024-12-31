import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonService, CompanyDto, ContactDto, ModuleDto } from '../../../../services/common.service';
import { FormControl } from '@angular/forms';
import { ActivityDto, ActivityModuleDto, ActivityService } from '../../../../services/activity.service';
import { MessageService } from 'primeng/api';
import { BaseCoreAbstract } from '../../../base/base-core.abstract';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-middle-panel',
  templateUrl: './middle-panel.component.html',
  styleUrl: './middle-panel.component.scss'
})
export class MiddlePanelComponent implements OnInit, OnChanges {
  @Input() propertiesList: ModuleDto[] = [];
  @Input() module: 'CONT' | 'COMP' = 'CONT';
  @Input() contactProfile: ContactDto = new ContactDto();
  @Input() companyProfile: CompanyDto = new CompanyDto(); // TODO: company profile
  @Input() activitiesList: ActivityDto[] = [];
  @Output() activityListEmit: EventEmitter<any> = new EventEmitter<any>();

  isOpenDialog: boolean = false;
  isOpenCreateDialog: boolean = false;
  activityModuleList: ModuleDto[] = [];
  activityControlList: ActivityModuleDto[] = [];
  subActivityModuleList: ModuleDto[] = [];
  searchControl: FormControl = new FormControl();
  searchIcon: string = "pi pi-search";

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
    private commonService: CommonService,
    private activityService: ActivityService,
    private toastService: ToastService
  ) {


  }

  ngOnInit() {
    this.searchControl.valueChanges.subscribe((value) => {
      console.log(value);
    });

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


  }

  ngOnChanges(changes: SimpleChanges): void {

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
      return this.activitiesList.filter(act => !act.isPinned && new Date(act.activityDatetime) >= new Date());
    }
    return this.activitiesList.filter(act => act.activityModuleSubCode === code && !act.isPinned && new Date(act.activityDatetime) >= new Date());
  }

  returnPastActivityList(code: string): ActivityDto[] {
    if (code === 'ALL') {
      return this.activitiesList.filter(act => !act.isPinned && new Date(act.activityDatetime) < new Date());
    }
    return this.activitiesList.filter(act => act.activityModuleSubCode === code && !act.isPinned && new Date(act.activityDatetime) < new Date());
  }

  returnIsPinnedActivityList(code: string): ActivityDto[] {
    if (code === 'ALL') {
      return this.activitiesList.filter(act => act.isPinned);
    }
    return this.activitiesList.filter(act => act.activityModuleSubCode === code && act.isPinned);
  }

  returnModule(activity: ActivityDto) {
    return this.activityModuleList.find(a => a.moduleCode === activity.activityModuleSubCode);
  }

  returnSubModuleList(activityTab: ModuleDto): ModuleDto[] {
    return this.subActivityModuleList.filter(a => a.moduleSubCode === activityTab.moduleCode);
  }
}
