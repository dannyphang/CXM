import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FirebaseApp, initializeApp } from "firebase/app";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    signOut,
    Auth,
    User,
    getAuth,
} from "firebase/auth";
import { CommonService } from "./common.service";
import apiConfig from "../../../environments/apiConfig";
import { Observable } from "rxjs";
import { CoreHttpService, PermissionObjDto, ResponseModel, RoleDto, TenantDto, UserPermissionDto } from "./core-http.service";
import { BasedDto, CoreAuthService, SettingDto, UserDto } from "./core-auth.service";
import { PERMISSION_LIST } from "../shared/constants/common.constants";
import { ToastService } from "./toast.service";

@Injectable({ providedIn: 'root' })
export class AuthService {
    PERMISSION_LIST = PERMISSION_LIST;
    SERVICE_PATH = 'auth';
    app: FirebaseApp;
    auth: Auth;

    constructor(
        private coreService: CoreHttpService,
        private coreAuthService: CoreAuthService,
        private toastService: ToastService
    ) {

    }

    initAuth(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.coreService.getEnvToken().subscribe(res => {
                this.app = initializeApp(res);
                resolve(null);
            })
        });
    }

    signInUserAuth(email: string, password: string): Promise<UserDto> {
        return new Promise(async (resolve, reject) => {
            try {
                this.coreAuthService.post<any>('auth/login', { email, password, project: 'CRM' }).pipe().subscribe({
                    next: res => {
                        if (res.isSuccess) {
                            this.coreAuthService.getUserByAuthUid(res.data.uid).subscribe(res2 => {
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
                                    download: false,
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

    getAllUser() {
        return this.coreService.get<any>('auth/allUser').pipe();
    }

    updateUser(updateData: any) {
        if (this.auth.currentUser) {
            updateProfile(this.auth.currentUser, updateData).then(res => {
                console.log(res);
            }).catch(error => {
                console.log(error)
            })
        }

    }

    createUser(user: CreateUserDto[]): Observable<ResponseModel<UserDto>> {
        return this.coreService.post<UserDto>('auth/user', { user }).pipe();
    }

    updateUserFirestore(user: CreateUserDto[]): Observable<ResponseModel<any>> {
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

    returnPermission(pString: string): UserPermissionDto[] {
        return JSON.parse(pString ?? '[]');
    }

    returnPermissionObj(module: string, action: string): boolean {
        if (!this.coreAuthService.userC) {
            return false;
        }
        if (this.coreAuthService.userC.roleId === 1) {
            return true
        }
        let permission: UserPermissionDto[] = JSON.parse(this.coreAuthService.userC.permission);
        return permission.find(p => p.module === module)?.permission[action];
    }

    getAllUserByTenant(tenantId: string): Observable<ResponseModel<UserDto[]>> {
        return this.coreService.get<UserDto[]>('auth/user/tenant/' + tenantId).pipe();
    }

    updateUserLastActiveTime(user: UserDto): Observable<ResponseModel<UserDto>> {
        return this.coreService.put<UserDto>('/auth/user/userLastActive', { user }).pipe();
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
    phoneNumber?: string;
    authUid?: string;
    roleId?: number;
    permission?: string;
    setting?: SettingDto;
}

export class UpdateUserRoleDto {
    modifiedBy: string;
    roleId: number;
    email: string;
    tenantId: string;
}