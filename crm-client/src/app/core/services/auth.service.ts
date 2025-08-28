import { Injectable } from "@angular/core";
import apiConfig from "../../../environments/apiConfig";
import { Observable } from "rxjs";
import { CoreHttpService, PermissionObjDto, ResponseModel, RoleDto, UserPermissionDto } from "./core-http.service";
import { BasedDto, CoreAuthService, SettingDto, UpdateSettingDto, UserDto } from "./core-auth.service";
import { PERMISSION_LIST, PermissionTypeList } from "../shared/constants/common.constants";
import { ToastService } from "./toast.service";

@Injectable({ providedIn: 'root' })
export class AuthService {
    JWT_BASE_URL = apiConfig.authClient;
    PERMISSION_LIST = PERMISSION_LIST;
    SERVICE_PATH = 'auth';

    constructor(
        private coreService: CoreHttpService,
        private coreAuthService: CoreAuthService,
        private toastService: ToastService
    ) {

    }

    callJWT() {
        let redirectUri = apiConfig.clientUrl + "/callback";
        window.location.href = `${this.JWT_BASE_URL}?redirect_uri=${redirectUri}&project=CRM&isRememberMeShow=false`;
    }

    signInUserAuth(email: string, password: string): Promise<UserDto> {
        return new Promise(async (resolve, reject) => {
            try {
                this.coreAuthService.post<any>('auth/login', { email, password, project: 'CRM' }).pipe().subscribe({
                    next: res => {
                        if (res.isSuccess) {
                            this.coreAuthService.getUserByAuthUid(res.data.uid, res.data.email).subscribe(res2 => {
                                resolve(res2.data);
                            })
                        }
                        else {
                            resolve(null);
                        }
                    },
                    error: error => {
                        reject(error)
                    }
                });
            }
            catch (error) {
                reject(error);
            }
        })
    }

    signOutUserAuth() {
        return this.coreAuthService.post<any>("auth/logout").pipe();
    }

    signUpUserAuth(email: string, name: string, password: string): Promise<UserDto> {
        return new Promise(async (resolve, reject) => {
            this.coreAuthService.post<any>("auth/register", { name, email, password, project: 'CRM' }).subscribe({
                next: res => {
                    if (res.isSuccess) {
                        let permissionList: UserPermissionDto[] = [];
                        this.PERMISSION_LIST.forEach(str => {
                            permissionList.push({
                                module: str,
                                permission: {
                                    create: false,
                                    remove: false,
                                    update: false,
                                    display: false,
                                    import: false,
                                    export: false
                                }
                            })
                        })

                        let newUser: CreateUserDto = {
                            authUid: res.data.uid,
                            email: email,
                            displayName: name,
                            roleId: 3,
                            permission: JSON.stringify(permissionList),
                            setting: {
                                defaultTenantId: this.coreService.tenant.uid,
                                tableFilter: {
                                    contact: {
                                        propertyFilter: [],
                                        columnFilter: []
                                    },
                                    company: {
                                        propertyFilter: [],
                                        columnFilter: []
                                    }
                                }
                            }
                        }

                        this.createUser([newUser]).subscribe({
                            next: res => {
                                if (res.isSuccess) {
                                    resolve(res.data)
                                }
                                else {
                                    reject()
                                }
                            },
                            error: error => {
                                reject(error)
                            }
                        })
                    }
                },
                error: error => {
                    reject(error);
                }
            })
        });
    }

    updateUserAuthPassword(password: string, uid: string) {
        return this.coreAuthService.put<any>("auth/updatePassword", { password, uid }).pipe();
    }

    getAllUser() {
        return this.coreService.get<any>('auth/allUser').pipe();
    }

    createUser(user: CreateUserDto[]): Observable<ResponseModel<UserDto>> {
        return this.coreService.post<UserDto>('auth/user', { user }).pipe();
    }

    updateUserFirestore(user: UpdateUserDto[]): Observable<ResponseModel<any>> {
        return this.coreService.put<any>('auth/user/update', { user }).pipe();
    }

    getAllRoles(): Observable<ResponseModel<RoleDto[]>> {
        return this.coreService.get<RoleDto[]>('auth/role').pipe();
    }

    getUserByEmail(email: string): Observable<ResponseModel<UserDto>> {
        let headers = {
            'email': email
        }
        return this.coreService.get<UserDto>('auth/user/email', {
            headers: headers
        }).pipe();
    }

    setUserRoleAndTenant(updateList: UpdateUserRoleDto[]): Observable<ResponseModel<any>> {
        return this.coreService.put<any>('auth/userRole/update', { updateList }).pipe();
    }

    getUserPermission(uid: string): Promise<UserPermissionDto[]> {
        return new Promise((resolve, reject) => {
            this.coreService.get<UserPermissionDto[]>('auth/permission/' + uid, {
                headers: {
                    'tenantId': this.coreService.tenant?.uid,
                }
            }).pipe().subscribe({
                next: res => {
                    if (res.isSuccess) {
                        resolve(res.data);
                    }
                },
                error: error => {
                    reject(error);
                }
            });
        })
    }

    returnPermission(pString: string): UserPermissionDto[] {
        return JSON.parse(pString ?? '[]');
    }

    returnPermissionObj(module: PermissionTypeList, action: keyof PermissionObjDto): boolean {
        if (!this.coreAuthService.userC) {
            return false;
        }
        if (this.coreAuthService.userC.roleId === 1) {
            return true
        }

        return this.coreAuthService.permission?.find(p => p.module === module)?.permission[action];
    }

    getAllUserByTenant(tenantId: string): Observable<ResponseModel<UserDto[]>> {
        return this.coreService.get<UserDto[]>('auth/user/tenant/' + tenantId).pipe();
    }

    getAllUserPermissionByTenant(tenantId: string): Observable<ResponseModel<UserPermissionDto[]>> {
        return this.coreService.get<UserPermissionDto[]>('auth/permission/tenant/' + tenantId).pipe();
    }

    updateUserLastActiveTime(user: UserDto): Observable<ResponseModel<UserDto>> {
        return this.coreService.put<UserDto>('/auth/user/userLastActive', { user }).pipe();
    }

    sentVerifyEmail(user: UserDto): Observable<ResponseModel<any>> {
        return this.coreService.post<any>('auth/user/sentVerifyEmail', { user }).pipe();
    }

    updateUserPermission(uid: string, permission: UserPermissionDto[]): Observable<ResponseModel<any>> {
        return this.coreService.put<any>('auth/permission', { userUid: uid, permission: permission }).pipe();
    }
}

export class CreateUserDto extends BasedDto {
    uid?: string;
    firstName?: string;
    lastName?: string;
    nickname?: string;
    displayName?: string;
    profilePhotoUrl?: string;
    email?: string;
    emailVerified?: number;
    phoneNumber?: string;
    authUid?: string;
    roleId?: number;
    permission?: string;
    setting?: SettingDto;
}

export class UpdateUserDto extends BasedDto {
    uid: string;
    firstName?: string;
    lastName?: string;
    nickname?: string;
    displayName?: string;
    profilePhotoUrl?: string;
    email?: string;
    emailVerified?: number;
    phoneNumber?: string;
    authUid?: string;
    roleId?: number;
    setting?: UpdateSettingDto;
}

export class UpdateUserRoleDto {
    modifiedBy: string;
    roleId: number;
    email: string;
    tenantId: string;
}