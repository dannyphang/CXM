import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import apiConfig from "../../../environments/apiConfig";
import { AuthService } from "./auth.service";
import { map, Observable } from "rxjs";
import { FirebaseApp, initializeApp } from "firebase/app";
import { Auth, getAuth, onAuthStateChanged, User } from "firebase/auth";
import { ToastService } from "./toast.service";

@Injectable()
export class CoreHttpService {
    private BASE_URL = apiConfig.baseUrl;
    app: FirebaseApp;
    auth: Auth;
    user: User | null;
    userC: UserDto;
    tenant: TenantDto;

    constructor(
        private http: HttpClient,
        private toastService: ToastService
    ) { }

    getTenantsByUserId(userId: string): Observable<ResponseModel<TenantDto[]>> {
        return this.http.get<ResponseModel<TenantDto[]>>(apiConfig.baseUrl + '/auth/tenant/' + userId).pipe();
    }

    getEnvToken(): Observable<any> {
        return this.http.get<any>(`${apiConfig.baseUrl}/token`).pipe();
    }

    set setCurrentTenant(tenant: TenantDto) {
        this.tenant = tenant;
    }

    currentUser(): User | null {
        return this.user;
    }

    async getCurrentUser(): Promise<UserDto> {
        return new Promise((resolve, reject) => {
            this.getEnvToken().subscribe(res => {
                this.app = initializeApp(res);
                this.auth = getAuth(this.app);
                this.auth ? onAuthStateChanged(this.auth, (user) => {
                    if (user) {
                        this.user = user;
                        this.getUser(this.user.uid).subscribe(res => {
                            if (res.isSuccess) {
                                this.userC = res.data;

                                resolve(this.userC);
                            }
                        })
                    } else {
                        resolve(null);
                    }
                }) : resolve(null);
            });
        });
    }

    getUser(userUid: string): Observable<ResponseModel<UserDto>> {
        return this.http.get<ResponseModel<UserDto>>(apiConfig.baseUrl + '/auth/user/' + userUid).pipe();
    }

    buildHeader(option?: CoreHttpOption) {

        if (!this.userC?.uid) {
            this.getCurrentUser();
        }
        const userId = this.userC.uid;
        const tenantId = this.userC.setting.defaultTenantId;

        // Omit empty headers
        return Object.fromEntries(
            Object.entries<string>({ ...option?.header, userId: userId, tenantId: tenantId }).filter(
                ([_, v]) => v,
            ),
        );
    }

    post<ResponseBody = any, Body = any>(url: string, body: Body, option?: CoreHttpOption) {
        const { header, reportProgress, responseType } = option || {}; // Destructure the properties

        return this.http.post<ResponseModel<ResponseBody>>(
            `${this.BASE_URL}/${url}`,
            body,
            {
                headers: this.buildHeader({ header }),
                reportProgress,
                responseType
            }
        );
    }


    put<ResponseBody = any, Body = any>(url: string, body: Body, option?: CoreHttpOption) {
        return this.http.put<ResponseModel<ResponseBody>>(
            `${this.BASE_URL}/${url}`,
            body,
            {
                headers: this.buildHeader(option)
            })
    }

    get<ResponseBody = any>(url: string, option?: CoreHttpOption) {
        return this.http.get<ResponseModel<ResponseBody>>(
            `${this.BASE_URL}/${url}`,
            {
                headers: this.buildHeader(option)
            })
    }
}

class CoreHttpOption {
    header?: any;
    tenantId?: string;
    userId?: string;
    reportProgress?: boolean;
    responseType?: any;
}

export class ResponseModel<T> {
    data: T;
    isSuccess: boolean;
    responseMessage: string;
}

export class MessageModel {
    message: string;
    severity?: 'success' | 'info' | 'error';
    key?: string;
    icon?: string;
    isLoading?: boolean;
}

export class BasedDto {
    tenantId?: string;
    createdDate?: Date;
    createdBy?: string;
    modifiedDate?: Date;
    modifiedBy?: string;
    statusId?: number;
}

export class UserDto extends BasedDto {
    uid: string;
    firstName: string;
    lastName: string;
    nickname: string;
    displayName: string;
    phoneNumber: string;
    profilePhotoUrl: string;
    email: string;
    roleId: number;
    permission: string;
    setting: SettingDto;
}

export class TenantDto extends BasedDto {
    uid: string;
    tenantName: string;
}

export class SettingDto {
    darkMode?: boolean;
    defaultTenantId?: string;
    contactTab?: any;
    companyTab?: any;
    tableFilter?: {
        contact: TableFilterDto[];
        company: TableFilterDto[];
    }
}

export class TableFilterDto {
    propertyUid: string;
    filterFieldControlCode: string;
    conditionFieldControlCode: string;
}

export class PermissionObjDto {
    create: boolean;
    remove: boolean;
    update: boolean;
    display: boolean;
    download: boolean;
    export: boolean;
}

export class UserPermissionDto {
    module: string;
    permission: PermissionObjDto;
}

export class RoleDto extends BasedDto {
    uid: string;
    roleId: number;
    roleName: string;
    roleCode: string;
    permission: string;
}