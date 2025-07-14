import { Injectable } from "@angular/core";
import apiConfig from "../../../environments/apiConfig";
import { HttpClient } from "@angular/common/http";
import { ResponseModel, UserPermissionDto } from "./core-http.service";
import { ToastService } from "./toast.service";
import { Observable } from "rxjs";

@Injectable()
export class CoreAuthService {
    private AUTH_URL = apiConfig.authUrl;
    userC: UserDto;
    JWT_TOKEN: string = '';

    constructor(
        private http: HttpClient,
        private toastService: ToastService
    ) { }

    set jwt_token(token: string) {
        this.JWT_TOKEN = token;
    }

    get jwt_token() {
        return this.JWT_TOKEN || '';
    }

    buildHeader(option?: AuthHttpOption) {
        // Omit empty headers
        return Object.fromEntries(
            Object.entries<string>({ ...option?.headers }).filter(
                ([_, v]) => v,
            ),
        );
    }

    post<ResponseBody = any, Body = any>(url: string, body?: Body, option?: AuthHttpOption) {
        const { headers, reportProgress, responseType } = option || {}; // Destructure the properties

        return this.http.post<ResponseModel<ResponseBody>>(
            `${this.AUTH_URL}/${url}`,
            body,
            {
                headers: this.buildHeader({ headers }),
                reportProgress,
                responseType,
                withCredentials: true
            }
        );
    }

    put<ResponseBody = any, Body = any>(url: string, body?: Body, option?: AuthHttpOption) {
        const { headers, reportProgress, responseType } = option || {}; // Destructure the properties

        return this.http.put<ResponseModel<ResponseBody>>(
            `${this.AUTH_URL}/${url}`,
            body,
            {
                headers: this.buildHeader({ headers }),
                reportProgress,
                responseType,
                withCredentials: true
            }
        );
    }

    get<ResponseBody = any>(url: string, option?: AuthHttpOption) {
        return this.http.get<ResponseModel<ResponseBody>>(
            `${this.AUTH_URL}/${url}`,
            {
                withCredentials: true
            })
    }

    getUserByAuthUid(uid: string, email: string): Observable<ResponseModel<UserDto>> {
        return this.http.get<ResponseModel<UserDto>>(apiConfig.baseUrl + '/auth/authUser/' + uid, {
            headers: {
                email: email
            }
        }).pipe();
    }

    getCurrentAuthUser(): Promise<UserDto> {
        return new Promise(async (resolve, reject) => {
            try {
                this.http.get<any>(`${this.AUTH_URL}/auth/user`, { withCredentials: true }).subscribe({
                    next: res => {
                        let authUid = res.data.uid;
                        let email = res.data.email;
                        this.getUserByAuthUid(authUid, email).subscribe(res2 => {
                            this.userC = res2.data;
                            resolve(res2.data);
                        });
                    },
                    error: err => {
                        reject(err)
                    }
                })
            } catch (error) {
                console.error('Error getting current auth user:', error);

                reject(error);
            }
        })
    }
}

class AuthHttpOption {
    headers?: any;
    reportProgress?: boolean;
    responseType?: any;
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
    authUid: string;
    firstName: string;
    lastName: string;
    nickname: string;
    displayName: string;
    phoneNumber: string;
    profilePhotoUrl: string;
    email: string;
    emailVerified: number;
    roleId: number;
    permission: UserPermissionDto[];
    setting: SettingDto;
    lastActiveDateTime: Date;
}

export class SettingDto {
    darkMode?: boolean;
    defaultTenantId?: string;
    tableFilter: {
        contact: TableFilterDto;
        company: TableFilterDto;
    }
    defaultLanguage?: number;
    calendarEmail?: string;
    calendarId?: string;
}

export class UpdateSettingDto {
    darkMode?: boolean;
    defaultTenantId?: string;
    tableFilter?: {
        contact: TableFilterDto;
        company: TableFilterDto;
    }
    defaultLanguage?: number;
    calendarEmail?: string;
    calendarId?: string;
}

export class TableFilterDto {
    propertyFilter: TableDataFilterDto[];
    columnFilter: TableColumnFilterDto[];
}

export class TableColumnFilterDto {
    tabUid: string;
    propertyUid: string[];
}

export class TableDataFilterDto {
    propertyUid?: string;
    filterFieldControlCode?: string;
    conditionFieldControlCode?: string;
    mode?: string;
    tabUid: string;
    tabLabel: string;
}