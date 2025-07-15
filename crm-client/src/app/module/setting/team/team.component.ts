import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService, UpdateUserRoleDto } from '../../../core/services/auth.service';
import { CONTROL_TYPE, FormConfig, OptionsModel } from '../../../core/services/components.service';
import { CoreHttpService, PermissionObjDto, UserPermissionDto } from '../../../core/services/core-http.service';
import { BaseCoreAbstract } from '../../../core/shared/base/base-core.abstract';
import { ROW_PER_PAGE_DEFAULT, ROW_PER_PAGE_DEFAULT_LIST } from '../../../core/shared/constants/common.constants';
import { MessageService } from 'primeng/api';
import { CoreAuthService, UserDto } from '../../../core/services/core-auth.service';
import { CommonService, WindowSizeDto } from '../../../core/services/common.service';
import { ToastService } from '../../../core/services/toast.service';

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss'
})
export class TeamComponent extends BaseCoreAbstract implements OnChanges {
  @Input() permission: UserPermissionDto[] = [];

  windowSize: WindowSizeDto = new WindowSizeDto();

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
  updatePermissionList: UserPermissionDto[] = [];
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
  isCreateUserDialogVisible = false;
  createUserFormConfig: FormConfig[] = [];
  createUserFormGroup: FormGroup = new FormGroup({
    username: new FormControl("", Validators.required),
    email: new FormControl("", Validators.required),
    password: new FormControl("", Validators.required),
  });

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private coreService: CoreHttpService,
    protected coreAuthService: CoreAuthService,
    private commonService: CommonService,
    private toastService: ToastService
  ) {
    super();
    this.windowSize = this.commonService.windowSize;
  }

  ngOnInit() {
    this.currentUser = this.coreAuthService.userC;

    this.selectedUserFormGroup.controls['user'].valueChanges.subscribe(userUid => {
      this.initPermissionTable(userUid);
    });

    this.authService.getAllRoles().subscribe(res => {
      if (res.isSuccess) {
        this.roleOptions = res.data.map(r => {
          return {
            label: r.roleName,
            value: r.roleId
          }
        })

        this.selectedUserFormGroup.controls['user'].setValue(this.coreAuthService.userC.uid);
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
          this.selectedUserFormGroup.controls['user'].setValue(this.coreAuthService.userC.uid)
        }
      });
    }

    this.initTeamRole();
    this.initCreateTenantForm();
    this.initCreateUserForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['permission'] && changes['permission'].currentValue) {
      this.initPermissionTable(this.coreAuthService.userC.uid);
    }
  }

  get permissionArr(): FormArray {
    return this.selectedUserFormGroup.controls['permission'] as FormArray;
  }

  initPermissionTable(userUid: string) {
    this.authService.getUserPermission(userUid ? userUid : this.selectedUserFormGroup.controls['user'].value).then(permission => {
      this.permission = permission;
      this.selectedUserFormGroup.controls['permission'] = this.formBuilder.array([]);
      let permissionObj = this.permission ?? [];

      permissionObj.forEach(p => {
        this.addPermissionArr(p.module, p.permission);
      });
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

  returnTeamPermission(rowData: any, col: Column) {
    return rowData.permission[col.field];
  }

  returnTeamPermissionFormControl(rowData: any, col: Column): FormControl {
    return (rowData.permission as FormGroup).controls[col.field] as FormControl;
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
        modifiedBy: this.coreAuthService.userC.uid,
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
    // this.authService.updateUserFirestore(this.updateUserList).subscribe(res => {
    //   if (res.isSuccess) {
    //     console.log(res)
    //   }
    // })

    this.authService.updateUserPermission(this.selectedUserFormGroup.controls['user'].value, this.updatePermissionList).subscribe({
      next: res => {
        if (res.isSuccess) {
          this.toastService.addSingle({
            message: 'Permission updated successfully',
          });
        }
        else {
          this.toastService.addSingle({
            message: res.responseMessage,
            severity: 'error'
          });
        }
      },
      error: error => {
        this.toastService.addSingle({
          message: error.error.message,
          severity: 'error'
        });
      }
    });
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

    this.updatePermissionList = pArr;
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

  initCreateUserForm() {
    this.createUserFormConfig = [
      {
        label: 'INPUT.USERNAME',
        fieldControl: this.createUserFormGroup.controls['username'],
        type: CONTROL_TYPE.Textbox,
        layoutDefine: {
          row: 0,
          column: 0
        },
      },
      {
        label: 'INPUT.EMAIL',
        fieldControl: this.createUserFormGroup.controls['email'],
        type: CONTROL_TYPE.Textbox,
        layoutDefine: {
          row: 1,
          column: 0
        },
        mode: 'email'
      },
      {
        label: 'INPUT.PASSWORD',
        fieldControl: this.createUserFormGroup.controls['password'],
        type: CONTROL_TYPE.Textbox,
        layoutDefine: {
          row: 2,
          column: 0
        },
        mode: 'password'
      },
    ]
  }

  returnRoleById(id: number): string {
    return this.roleOptions.find(r => r.value === id)?.label ?? '';
  }

  closeTenantDialog() {
    this.isAddTenantDialogVisible = false;
  }

  closeCreateUserDialog() {
    this.isCreateUserDialogVisible = false;
    this.resetCreateUserForm();
  }

  resetCreateUserForm() {
    this.createUserFormGroup.reset({ emitEvent: false });
  }

  createUser() {
    if (this.coreAuthService.userC.roleId === 1) {
      this.createUserFormGroup.markAllAsTouched();
      if (this.createUserFormGroup.valid) {
        this.authService.signUpUserAuth(this.createUserFormGroup.controls['email'].value, this.createUserFormGroup.controls['username'].value, this.createUserFormGroup.controls['password'].value).then(user => {
          console.log(user)
          this.closeCreateUserDialog();
        }).catch(error => {
          this.toastService.addSingle({
            message: error.error.message,
            severity: 'error'
          });
        });
      }
    }
    else {
      // TODO
    }
  }
}
