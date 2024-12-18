import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AuthService, UpdateUserRoleDto } from '../../../core/services/auth.service';
import { OptionsModel } from '../../../core/services/components.service';
import { CoreHttpService } from '../../../core/services/core-http.service';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss'
})
export class TeamComponent {
  teamFormArr: FormArray = this.formBuilder.array([]);
  roleOptions: OptionsModel[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private coreService: CoreHttpService
  ) {

  }

  ngOnInit() {
    this.authService.getAllRoles().subscribe(res => {
      if (res.isSuccess) {
        this.roleOptions = res.data.map(r => {
          return {
            label: r.roleName,
            value: r.roleId
          }
        })
      }
    })
    this.addTeamFormArr();
  }

  addTeamFormArr() {
    this.teamFormArr.push(this.formBuilder.group({
      email: new FormControl(""),
      role: new FormControl(3),
      check: new FormControl(0)
    }));
  }

  removeTeam(index: number) {
    this.teamFormArr.removeAt(index);
  }

  returnTeamFormControl(name: string, team: any): FormControl {
    ((team as FormGroup).controls['email'] as FormControl).valueChanges.subscribe(val => {
      (team as FormGroup).controls['check'].setValue(0);
    })

    switch (name) {
      case 'email':
        return (team as FormGroup).controls['email'] as FormControl;
      case 'role':
        return (team as FormGroup).controls['role'] as FormControl;
      case 'check':
        return (team as FormGroup).controls['check'] as FormControl;
      default:
        return new FormControl();
    }
  }

  checkUserEmail(team: any) {
    this.authService.getUserByEmail(team.value.email).subscribe(res => {
      if (res.isSuccess) {
        (team as FormGroup).controls['check'].setValue(1);
        (team as FormGroup).controls['role'].setValue(res.data.roleId, { emitEvent: false })
      }
      else {
        // TODO: here not working 
        console.log(team.value);
        (team as FormGroup).controls['check'].setValue(2);
      }
    })
  }

  returnCheckIcon(team: any): string {
    let icon = '';
    if (team.value.email.length === 0) {
      return "pi pi-id-card";
    }

    switch (team.value.check) {
      case 0:
        icon = "pi pi-id-card"
        break;
      case 1:
        icon = "pi pi-check"
        break;
      case 2:
        icon = "pi pi-ban"
        break;
    }

    return icon;
  }

  submitTeam() {
    console.log(this.teamFormArr.value)
    let updateList: UpdateUserRoleDto[] = this.teamFormArr.value.map((i: {
      email: string,
      role: number
    }) => {
      return {
        email: i.email,
        roleId: i.role,
        modifiedBy: this.coreService.userC.uid,
        tenantId: this.coreService.tenant.uid
      }
    });

    this.authService.setUserRoleAndTenant(updateList).subscribe(res => {
      if (res.isSuccess) {
        console.log(res.data);
      }
    })
  }
}
