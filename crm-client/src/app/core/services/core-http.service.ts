import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import apiConfig from "../../../environments/apiConfig";
import { AuthService } from "./auth.service";
import { map, Observable } from "rxjs";
import { FirebaseApp, initializeApp } from "firebase/app";
import { Auth, getAuth, onAuthStateChanged, User } from "firebase/auth";

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

    async getCurrentUser(): Promise<User | null> {
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
                                resolve(this.user);
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
        const tenantId = this.userC.defaultTenantId;

        // Omit empty headers
        return Object.fromEntries(
            Object.entries<string>({ ...option?.header, userId: userId, tenantId: tenantId }).filter(
                ([_, v]) => v,
            ),
        );
    }

    post<ResponseBody = any, Body = any>(url: string, body: Body, option?: CoreHttpOption) {
        return this.http.post<ResponseModel<ResponseBody>>(
            `${this.BASE_URL}/${url}`,
            body,
            {
                headers: this.buildHeader(option)
            })
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
    defaultTenantId?: string;
}

export class TenantDto extends BasedDto {
    uid: string;
    tenantName: string;
}