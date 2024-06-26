import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import apiConfig from "../../../environments/apiConfig";

@Injectable({ providedIn: 'root' })
export class CommonService {
    constructor(
        private http: HttpClient
    ) {
    }

    getAllContact(): Observable<any[]> {
        return this.http.get<any[]>(apiConfig.baseUrl + '/contact').pipe();
    }

    getContactById(id: string): Observable<any> {
        return this.http.get<any>(apiConfig.baseUrl + '/contact/' + id).pipe();
    }

    getAllProperties(): Observable<PropertiesDto[]> {
        return this.http.get<PropertiesDto[]>(apiConfig.baseUrl + '/common/properties').pipe();
    }

    getAllPropertiesByModule(module: string): Observable<PropertiesDto[]> {
        let headers = {
            'moduleCode': module
        }
        return this.http.get<PropertiesDto[]>((apiConfig.baseUrl + '/common/properties'), { headers }).pipe();
    }

    createProperties(properties: PropertiesDto): Observable<PropertiesDto> {
        return this.http.post<PropertiesDto>(apiConfig.baseUrl + '/common/properties', properties).pipe();
    }
}

export class PropertiesDto {
    propertyId: string;
    uid: string;
    name: string;
    code: string;
    type: string;
    isSystem: boolean;
    isMandatory: boolean;
    isEditable: boolean;
    isVisiable: boolean;
    moduleCode: string;
    order: number;
    statusID: number;
    createdDate: Date;
    createdBy: string;
    modifiedDate: Date;
    modifiedBy: string;
}