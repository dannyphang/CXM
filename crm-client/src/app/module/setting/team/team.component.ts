import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AuthService, PermissionObjDto, UpdateUserRoleDto, UserDto, UserPermissionDto } from '../../../core/shared/services/auth.service';
import { OptionsModel } from '../../../core/shared/services/components.service';
import { ROW_PER_PAGE_DEFAULT, ROW_PER_PAGE_DEFAULT_LIST } from '../../../core/shared/constants/common.constants';

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss'
})
export class TeamComponent {
  @Input() permission: UserPermissionDto[] = [];
  ROW_PER_PAGE_DEFAULT = ROW_PER_PAGE_DEFAULT;
  ROW_PER_PAGE_DEFAULT_LIST = ROW_PER_PAGE_DEFAULT_LIST;
  teamFormArr: FormArray = this.formBuilder.array([]);
  roleOptions: OptionsModel[] = [];
  tableConfig: Column[] = [
    {
      field: 'module',
      header: 'Module'
    },
    {
      field: 'create',
      header: 'Create'
    },
    {
      field: 'remove',
      header: 'Remove'
    },
    {
      field: 'update',
      header: 'Update'
    },
    {
      field: 'display',
      header: 'Display'
    },
    {
      field: 'download',
      header: 'Download'
    },
    {
      field: 'export',
      header: 'Export'
    },
  ];
  userList: UserDto[] = [];
  userListOptions: OptionsModel[] = [];
  selectedUserFormGroup: FormGroup = new FormGroup({
    user: new FormControl(""),
    permission: this.formBuilder.array([]),
  });

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

    this.authService.getAllUserByTenant(this.authService.tenant.uid).subscribe(res => {
      if (res.isSuccess) {
        this.userList = res.data;
        this.userListOptions = res.data.map(d => {
          return {
            label: `${d.displayName} (${d.email})`,
            value: d.uid
          }
        });
      }
    });

    this.selectedUserFormGroup.controls['user'].valueChanges.subscribe(val => {
      this.selectedUserFormGroup.controls['permission'] = this.formBuilder.array([]);
      let permissionObj = this.authService.returnPermission(this.userList.find(u => u.uid === val)?.permission ?? '[]');

      permissionObj.forEach(p => {
        this.addPermissionArr(p.module, p.permission);
      });

      console.log(this.permissionArr.value);
    });

    this.initTable();
    this.addTeamFormArr();
  }

  get permissionArr(): FormArray {
    return this.selectedUserFormGroup.controls['permission'] as FormArray;
  }

  initTable() {

  }

  addPermissionArr(module: string, permi: PermissionObjDto) {
    if (permi) {
      let permissionForm = this.formBuilder.group({
        module: new FormControl(module),
        permission: {
          create: new FormControl(permi.create),
          remove: new FormControl(permi.remove),
          update: new FormControl(permi.update),
          display: new FormControl(permi.display),
          download: new FormControl(permi.download),
          export: new FormControl(permi.export),
        }
      });
      this.permissionArr.push(permissionForm);
    }
    else {
      console.log(permi)
    }
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
        modifiedBy: this.authService.userC.uid,
        tenantId: this.authService.tenant.uid
      }
    });

    this.authService.setUserRoleAndTenant(updateList).subscribe(res => {
      if (res.isSuccess) {
        console.log(res.data);
      }
    })
  }

  returnColumnData(rowData: any, data: any): boolean {
    // console.log(rowData)
    // console.log(data.value)
    // return new FormControl(data ?? false)
    return data?.value ?? false;
  }

  submitPermission() {
    console.log(this.permission);
  }

  returnSelectUserFormControl(): FormControl {
    return this.selectedUserFormGroup.controls['user'] as FormControl;
  }

  permissionSwitchOnChange(rowData: any, field: string, event: any) {
    rowData.permission[field as keyof PermissionObjDto].value = event.checked;
    console.log(this.permissionArr.value);
  }
}
