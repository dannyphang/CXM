import { Component, OnChanges, Input, SimpleChanges } from "@angular/core";
import { Router } from "@angular/router";
import { PropertyGroupDto, CompanyDto, CommonService } from "../../../../core/services/common.service";
import { UserPermissionDto } from "../../../../core/services/core-http.service";

@Component({
  selector: 'app-company-all-properties',
  templateUrl: './all-properties.component.html',
  styleUrl: './all-properties.component.scss'
})
export class CompanyAllPropertiesComponent implements OnChanges {
  @Input() module: 'CONT' | 'COMP' = 'COMP';

  propertiesList: PropertyGroupDto[] = [];
  companyProfile: CompanyDto = new CompanyDto();
  permission: UserPermissionDto[] = [];

  constructor(
    private commonService: CommonService,
    private router: Router,
  ) {
    if (window.history.state.permission) {
      this.permission = window.history.state.permission;
    }
  }

  ngOnInit() {
    if (window.history.state.data) {
      this.propertiesList = window.history.state.data;
    }
    if (window.history.state.profile) {
      this.companyProfile = window.history.state.profile;
    }

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['propertiesList'] && changes['propertiesList'].currentValue) {
      this.propertiesList = changes['propertiesList'].currentValue;
    }
  }
}
