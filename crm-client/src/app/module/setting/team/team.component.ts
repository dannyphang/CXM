import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService, UpdateUserRoleDto } from '../../../core/services/auth.service';
import { CONTROL_TYPE, FormConfig, OptionsModel } from '../../../core/services/components.service';
import { CoreHttpService, PermissionObjDto, UserDto, UserPermissionDto } from '../../../core/services/core-http.service';
import { BaseCoreAbstract } from '../../../core/shared/base/base-core.abstract';
import { ROW_PER_PAGE_DEFAULT, ROW_PER_PAGE_DEFAULT_LIST } from '../../../core/shared/constants/common.constants';
import { MessageService } from 'primeng/api';

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss'
})
export class TeamComponent extends BaseCoreAbstract {
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
  updateUserList: UserDto[] = [];
  createTenantFormConfig: FormConfig[] = [];
  createTenantFormGroup: FormGroup = new FormGroup({
    tenantName: new FormControl("", Validators.required),
  });
  isAddRoleDialogVisible: boolean = false;
  roleTableConfig: Column[] = [
    {
      field: 'displayName',
      header: 'Name',
    },
    {
      field: 'email',
      header: 'Email',
    },
    {
      field: 'roleId',
      header: 'Role',
    },
  ];
  selectedUser: UserDto[] = [];
  filterField: string[] = ['displayName', 'email'];
  roleSearchFormControl: FormControl = new FormControl("");
  currentUser: UserDto;
  isAddTenantDialogVisible = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private coreService: CoreHttpService,
    protected override messageService: MessageService,
  ) {
    super(messageService);
  }

  ngOnInit() {
    this.currentUser = this.coreService.userC;

    this.selectedUserFormGroup.controls['user'].valueChanges.subscribe(val => {
      this.initPermissionTable(val);
    });

    this.authService.getAllRoles().subscribe(res => {
      if (res.isSuccess) {
        this.roleOptions = res.data.map(r => {
          return {
            label: r.roleName,
            value: r.roleId
          }
        })

        this.selectedUserFormGroup.controls['user'].setValue(this.coreService.userC.uid);
        this.initPermissionTable(this.coreService.userC.uid);
      }
    })

    if (this.coreService.tenant) {
      this.authService.getAllUserByTenant(this.coreService.tenant.uid).subscribe(res => {
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
    }

    this.initTeamRole();
    this.initCreateTenantForm();
  }

  get permissionArr(): FormArray {
    return this.selectedUserFormGroup.controls['permission'] as FormArray;
  }

  initPermissionTable(user: string, isCancel: boolean = false) {
    let userId = user;
    if (isCancel) {
      userId = this.selectedUserFormGroup.controls['user'].value;
      this.authService.getAllUserByTenant(this.coreService.tenant.uid).subscribe(res => {
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
    }

    this.selectedUserFormGroup.controls['permission'] = this.formBuilder.array([]);
    let permissionObj = this.authService.returnPermission(this.userList.find(u => u.uid === userId)?.permission ?? '[]');

    permissionObj.forEach(p => {
      this.addPermissionArr(p.module, p.permission);
    });
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

  initTeamRole() {
    this.isAddRoleDialogVisible = false;
    this.teamFormArr = this.formBuilder.array([]);
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

  submitPermission() {
    this.authService.updateUserFirestore(this.updateUserList).subscribe(res => {
      if (res.isSuccess) {
        console.log(res)
      }
    })
  }

  returnSelectUserFormControl(): FormControl {
    return this.selectedUserFormGroup.controls['user'] as FormControl;
  }

  permissionSwitchOnChange(rowData: any, field: string, event: any) {
    rowData.permission[field as keyof PermissionObjDto].value = event.checked;

    let pArr: UserPermissionDto[] = [];

    this.permissionArr.value.forEach((p: any) => {
      pArr.push({
        module: p.module,
        permission: {
          create: p.permission.create.value ?? false,
          remove: p.permission.remove.value ?? false,
          update: p.permission.update.value ?? false,
          display: p.permission.display.value ?? false,
          download: p.permission.download.value ?? false,
          export: p.permission.export.value ?? false,
        }
      })
    });

    if (this.updateUserList.find(u => u.uid === this.selectedUserFormGroup.controls['user'].value)) {
      this.updateUserList.find(u => u.uid === this.selectedUserFormGroup.controls['user'].value)!.permission = JSON.stringify(pArr);
    }
    else {
      this.userList.find(u => u.uid === this.selectedUserFormGroup.controls['user'].value)!.permission = JSON.stringify(pArr);
      this.updateUserList.push(this.userList.find(u => u.uid === this.selectedUserFormGroup.controls['user'].value)!);
    }
  }

  initCreateTenantForm() {
    this.createTenantFormConfig = [
      {
        label: 'SETTING.TENANT_NAME',
        type: CONTROL_TYPE.Textbox,
        fieldControl: this.createTenantFormGroup.controls['tenantName'],
        layoutDefine: {
          row: 0,
          column: 0
        }
      }
    ]
  }

  returnRoleById(id: number): string {
    return this.roleOptions.find(r => r.value === id)?.label ?? '';
  }

  closeTenantDialog() {
    this.isAddTenantDialogVisible = false;
  }

  resetTenantForm() {

  }

  createTenant() {

  }
}
