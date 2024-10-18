import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { OptionsModel } from '../../../core/services/components.service';

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
    private authService: AuthService
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
      role: new FormControl(""),
    }));
  }

  removeTeam(index: number) {
    this.teamFormArr.removeAt(index);
  }

  returnTeamFormControl(name: string, team: any): FormControl {
    switch (name) {
      case 'email':
        return (team as FormGroup).controls['email'] as FormControl;
      case 'role':
        return (team as FormGroup).controls['role'] as FormControl;
      default:
        return new FormControl();
    }
  }

  getTeamForm() {
    console.log(this.teamFormArr.value)
  }
}
