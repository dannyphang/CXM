import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import apiConfig from "../../../environments/apiConfig";
import { CONTROL_TYPE_CODE } from "./components.service";

@Injectable({ providedIn: 'root' })
export class CommonService {
    constructor(
        private http: HttpClient
    ) {
    }

    getAllContact(): Observable<ContactDto[]> {
        return this.http.get<ContactDto[]>(apiConfig.baseUrl + '/contact').pipe();
    }

    getContactById(id: string): Observable<ContactDto> {
        return this.http.get<ContactDto>(apiConfig.baseUrl + '/contact/' + id).pipe();
    }

    createContact(contactList: ContactDto[]): Observable<ContactDto[]> {
        let headers = {
            'contactList': contactList
        }
        return this.http.post<ContactDto[]>(apiConfig.baseUrl + '/contact', { contactList }).pipe();
    }

    getAllProperties(): Observable<PropertiesDto[]> {
        return this.http.get<PropertiesDto[]>(apiConfig.baseUrl + '/common/properties').pipe();
    }

    getAllPropertiesByModule(module: string): Observable<PropertyGroupDto[]> {
        let headers = {
            'moduleCode': module
        }
        return this.http.get<PropertyGroupDto[]>((apiConfig.baseUrl + '/common/properties/module'), { headers }).pipe();
    }

    getAllCreateFormPropertiesByModule(module: string): Observable<PropertyGroupDto[]> {
        let headers = {
            'moduleCode': module
        }
        return this.http.get<PropertyGroupDto[]>((apiConfig.baseUrl + '/common/properties/module/create'), { headers }).pipe();
    }

    createProperties(properties: PropertiesDto): Observable<PropertiesDto> {
        return this.http.post<PropertiesDto>(apiConfig.baseUrl + '/common/properties', properties).pipe();
    }

    getAllActivityModule(): Observable<ActivitiesListDto> {
        return this.http.get<ActivitiesListDto>((apiConfig.baseUrl + '/common/activityModule')).pipe();
    }

    returnControlTypeEmptyValue(prop: PropertiesDto): any {
        let type = prop.propertyType;

        if (type === CONTROL_TYPE_CODE.Textbox || type === CONTROL_TYPE_CODE.Textarea || type === CONTROL_TYPE_CODE.Email || type === CONTROL_TYPE_CODE.Phone || type === CONTROL_TYPE_CODE.Url) {
            return '';
        }
        else if (type === CONTROL_TYPE_CODE.Checkbox) {
            return false;
        }
        else if (type === CONTROL_TYPE_CODE.Date) {
            return new Date();
        }
        else if (type === CONTROL_TYPE_CODE.Number) {
            return 0;
        }
        else if (type === CONTROL_TYPE_CODE.Dropdown || type === CONTROL_TYPE_CODE.Multiselect) {
            let lookup = {
                label: '',
                value: ''
            };
            prop.propertyLookupList.forEach((item) => {
                if (item.isDefault) {
                    lookup = {
                        label: item.propertyLookupLabel,
                        value: item.uid
                    }
                }
            });
            return lookup.value;
        }
        else if (type === CONTROL_TYPE_CODE.Radio) {
            return false;
        }
        return {};
    }
}
export class ModuleDto {
    uid: string;
    moduleId: string;
    moduleName: string;
    moduleNumber: string;
    moduleSubCode: string;
    moduleType: string;
    moduleValue: string;
    moduleCode: string;
    statusId: number;
    createdDate: Date;
    createdBy: string;
    modifiedDate: Date;
    modifiedBy: string;
}

export class PropertyGroupDto extends ModuleDto {
    propertiesList: PropertiesDto[];
    isHide: boolean;
}

export class PropertiesDto {
    propertyId: string;
    uid: string;
    propertyName: string;
    propertyCode: string;
    propertyType: string;
    isDefaultProperty: boolean;
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

export class ContactDto {
    uid?: string;
    contactId?: string;
    contactFirstName: string;
    contactLastName: string;
    contactEmail: string;
    contactPhone: string;
    contactOwnerUid?: string;
    contactLeadStatusId?: string;
    contactProperties?: string;
    statusId: number;
    createdDate: Date;
    createdBy?: string;
    modifiedDate: Date;
    modifiedBy?: string;
}

export class PropertyDataDto {
    uid: string;
    propertyCode: string;
    value: string;
}

export class ActivityModuleDto extends ModuleDto {
    subActivityControl: ModuleDto[];
}

export class ActivitiesListDto {
    activityControlList: ActivityModuleDto[];
    activityModuleList: ModuleDto[];
}