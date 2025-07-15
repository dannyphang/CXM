import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivityDto, ActivityService } from '../../../../services/activity.service';
import { PropertyGroupDto, ContactDto, CompanyDto, CommonService } from '../../../../services/common.service';
import { AuthService } from '../../../../services/auth.service';
import { ToastService } from '../../../../services/toast.service';
import { UserPermissionDto } from '../../../../services/core-http.service';

@Component({
  selector: 'app-right-panel',
  templateUrl: './right-panel.component.html',
  styleUrl: './right-panel.component.scss'
})
export class RightPanelComponent {
  @Input() propertiesList: PropertyGroupDto[] = [];
  @Input() module: 'CONT' | 'COMP' = 'CONT';
  @Input() contactProfile: ContactDto = null;
  @Input() companyProfile: CompanyDto = null;
  @Input() activitiesList: ActivityDto[] = [];
  @Input() permission: UserPermissionDto[] = [];
  @Output() getProfileEmit: EventEmitter<any> = new EventEmitter();
  @Output() getActivityEmit: EventEmitter<any> = new EventEmitter();

  constructor(
    private commonService: CommonService,
    private activityService: ActivityService,
    private authService: AuthService,
    private toastService: ToastService
  ) {

  }

  ngOnInit() {

  }
}
