import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivityModuleDto, CommonService, ModuleDto } from '../../../../services/common.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-middle-panel',
  templateUrl: './middle-panel.component.html',
  styleUrl: './middle-panel.component.scss'
})
export class MiddlePanelComponent implements OnInit, OnChanges {
  @Input() propertiesList: ModuleDto[] = [];
  @Input() module: 'CONT' | 'COMP' = 'CONT';

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

      }
    },
    {
      label: 'Expand all',
      icon: '',
      command: () => {

      }
    }
  ];

  constructor(
    private commonService: CommonService
  ) {

  }

  ngOnInit() {
    this.searchControl.valueChanges.subscribe((value) => {
      console.log(value);
    });

    this.commonService.getAllActivityModule().subscribe((res) => {
      console.log(res);

      this.activityModuleList = res.activityModuleList;
      this.activityControlList = res.activityControlList;
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
}
