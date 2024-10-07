import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonService, CompanyDto, ContactDto, ModuleDto } from '../../../../services/common.service';
import { FormControl } from '@angular/forms';
import { ActivityDto, ActivityModuleDto, ActivityService } from '../../../../services/activity.service';

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
  activityModuleList: ModuleDto[] = [];
  activityControlList: ActivityModuleDto[] = [];
  searchControl: FormControl = new FormControl();
  searchIcon: string = "pi pi-search";

  actionMenu: any[] = [
    {
      label: 'Collapse all',
      icon: '',
      command: () => {
        this.activitiesList.forEach(act => {
          act.isExpand = act.isExpand ? false : act.isExpand;
        });
      }
    },
    {
      label: 'Expand all',
      icon: '',
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
    private activityService: ActivityService
  ) {

  }

  ngOnInit() {
    this.searchControl.valueChanges.subscribe((value) => {
      console.log(value);
    });

    this.activityService.getAllActivityModule().subscribe((res) => {
      this.activityModuleList = res.data.activityModuleList;
      this.activityControlList = res.data.activityControlList;
    });


  }

  ngOnChanges(changes: SimpleChanges): void {

  }

  returnActivityLable(moduleCode: string) {
    switch (moduleCode) {
      case 'NOTE':
        return 'Log Note';
      case 'EMAIL':
        return 'Log Email';
      case 'CALL':
        return 'Log Call';
      case 'MEET':
        return 'Log Meeting';
      default:
        return '';
    }
  }

  getActivityControlList(activity: ModuleDto): any {
    return this.activityControlList;
  }

  activityButtonOnClick(activityTab: ModuleDto) {
    this.isOpenDialog = true;
    this.dialogActivityTab = activityTab;
  }

  activityDialogCloseEmit() {
    this.isOpenDialog = false;
    this.activityListEmit.emit();
  }

  returnUpComingActivityList(code: string): ActivityDto[] {
    if (code === 'ALL') {
      return this.activitiesList.filter(act => !act.isPinned);
    }
    return this.activitiesList.filter(act => act.activityModuleCode === code && !act.isPinned);
  }

  returnIsPinnedActivityList(code: string): ActivityDto[] {
    if (code === 'ALL') {
      return this.activitiesList.filter(act => act.isPinned);
    }
    return this.activitiesList.filter(act => act.activityModuleCode === code && act.isPinned);
  }
}
