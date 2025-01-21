import { Injectable } from "@angular/core";
import apiConfig from "../../../environments/apiConfig";
import { HttpClient } from "@angular/common/http";
import { ResponseModel } from "./core-http.service";
import { ToastService } from "./toast.service";
import { Observable } from "rxjs";

@Injectable()
export class CoreAuthService {
    private AUTH_URL = apiConfig.authUrl;
    userC: UserDto;

    constructor(
        private http: HttpClient,
        private toastService: ToastService
    ) { }

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


    get<ResponseBody = any>(url: string, option?: AuthHttpOption) {
        return this.http.get<ResponseModel<ResponseBody>>(
            `${this.AUTH_URL}/${url}`,
            {
                withCredentials: true
            })
    }

    getUserByAuthUid(uid: string): Observable<ResponseModel<UserDto>> {
        return this.http.get<ResponseModel<UserDto>>(apiConfig.baseUrl + '/auth/authUser/' + uid).pipe();
    }

    getCurrentAuthUser(): Promise<UserDto> {
        return new Promise(async (resolve, reject) => {
            this.http.get<any>(`${this.AUTH_URL}/auth/user`, { withCredentials: true }).subscribe({
                next: res => {
                    let authUid = res.data.uid;
                    this.getUserByAuthUid(authUid).subscribe(res2 => {
                        this.userC = res2.data;
                        resolve(res2.data);
                    });
                },
                error: err => {
                    reject(err)
                }
            })
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
    roleId: number;
    permission: string;
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