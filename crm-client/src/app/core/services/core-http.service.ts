import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import apiConfig from "../../../environments/apiConfig";
import { AuthService } from "./auth.service";
import { map, Observable } from "rxjs";
import { FirebaseApp, initializeApp } from "firebase/app";
import { Auth, getAuth, onAuthStateChanged, User } from "firebase/auth";
import { ToastService } from "./toast.service";
import { UserDto, BasedDto, CoreAuthService } from "./core-auth.service";
import { NumberValueAccessor } from "@angular/forms";

@Injectable()
export class CoreHttpService {
    private BASE_URL = apiConfig.baseUrl;
    app: FirebaseApp;
    auth: Auth;
    tenant: TenantDto;

    constructor(
        private http: HttpClient,
        private toastService: ToastService,
        private coreAuthService: CoreAuthService,
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

    updateUserLastActiveTime(user: UserDto): Observable<ResponseModel<UserDto>> {
        return this.http.put<ResponseModel<UserDto>>(apiConfig.baseUrl + '/auth/user/userLastActive', { user }).pipe();
    }

    getUser(userUid: string): Observable<ResponseModel<UserDto>> {
        return this.http.get<ResponseModel<UserDto>>(apiConfig.baseUrl + '/auth/user/' + userUid).pipe();
    }

    buildHeader(option?: CoreHttpOption) {

        if (!this.coreAuthService.userC?.uid) {
            this.coreAuthService.getCurrentAuthUser();
        }
        const userId = this.coreAuthService.userC?.uid;
        const tenantId = this.coreAuthService.userC?.setting.defaultTenantId;

        // Omit empty headers
        return Object.fromEntries(
            Object.entries<string>({ ...option?.headers, userId: userId ?? null, tenantId: tenantId ?? null }).filter(
                ([_, v]) => v,
            ),
        );
    }

    post<ResponseBody = any, Body = any>(url: string, body: Body, option?: CoreHttpOption) {
        const { headers, reportProgress, responseType } = option || {}; // Destructure the properties

        return this.http.post<ResponseModel<ResponseBody>>(
            `${this.BASE_URL}/${url}`,
            body,
            {
                headers: this.buildHeader({ headers }),
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
    headers?: any;
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
    severity?: 'success' | 'info' | 'error' | 'warn';
    key?: string;
    icon?: string;
    isLoading?: boolean;
    messageData?: any[];
    sticky?: boolean;
}

export class TenantDto extends BasedDto {
    uid: string;
    tenantName: string;
}

export class PermissionObjDto {
    create: boolean;
    remove: boolean;
    update: boolean;
    display: boolean;
    import: boolean;
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

export class LanguageDto extends BasedDto {
    uid: string;
    id: number;
    value: string;
    code: string;

}