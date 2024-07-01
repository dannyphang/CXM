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

    getAllPropertiesByModule(module: string): Observable<any[]> {
        let headers = {
            'moduleCode': module
        }
        return this.http.get<any[]>((apiConfig.baseUrl + '/common/properties/module'), { headers }).pipe();
    }

    createProperties(properties: PropertiesDto): Observable<PropertiesDto> {
        return this.http.post<PropertiesDto>(apiConfig.baseUrl + '/common/properties', properties).pipe();
    }
}
export class ModulePropertiesDto {
    uid: string;
    moduleId: string;
    moduleName: string;
    moduleNumber: string;
    moduleSubCode: string;
    moduleType: string;
    moduleValue: string;
    moduleCode: string;
    statusId: number;
    propertiesList: PropertiesDto[];
    createdDate: Date;
    createdBy: string;
    modifiedDate: Date;
    modifiedBy: string;
    isHide: boolean;
}

export class PropertiesDto {
    propertyId: string;
    uid: string;
    propertyName: string;
    propertyCode: string;
    propertyType: string;
    isSystem: boolean;
    isMandatory: boolean;
    isEditable: boolean;
    isVisible: boolean;
    moduleCode: string;
    order: number;
    statusID: number;
    createdDate: Date;
    createdBy: string;
    modifiedDate: Date;
    modifiedBy: string;
    propertyLookupList: PropertyLookupDto[];
    isHide: boolean;
}

export class PropertyLookupDto {
    uid: string;
    propertyLookupId: string;
    propertyId: string;
    propertyLookupLabel: string;
    propertyLookupCode: string;
    moduleCode: string;
    isDefault: boolean;
    isSystem: boolean;
    isVisiable: boolean;
    statusId: number;
    createdDate: Date;
    createdBy: string;
    modifiedDate: Date;
    modifiedBy: string;

}