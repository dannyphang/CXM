import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import apiConfig from "../../../environments/apiConfig";
import { CONTROL_TYPE_CODE } from "./components.service";
import { MessageService } from "primeng/api";

@Injectable({ providedIn: 'root' })
export class CommonService {
    constructor(
        private http: HttpClient,
        private messageService: MessageService
    ) {
    }

    popMessage(message: string, title: string, severity: string = 'success',) {
        this.messageService.add({ severity: severity, summary: title, detail: message });
    }

    getAllContact(): Observable<ContactDto[]> {
        return this.http.get<ContactDto[]>(apiConfig.baseUrl + '/contact').pipe();
    }

    getContactById(id: string): Observable<ContactDto> {
        return this.http.get<ContactDto>(apiConfig.baseUrl + '/contact/' + id).pipe();
    }

    createContact(contactList: ContactDto[]): Observable<ContactDto[]> {
        return this.http.post<ContactDto[]>(apiConfig.baseUrl + '/contact', { contactList }).pipe();
    }

    updateContact(contactList: UpdateContactDto[]): Observable<UpdateContactDto[]> {
        return this.http.put<UpdateContactDto[]>(apiConfig.baseUrl + '/contact', { contactList }).pipe();
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

    uploadFile(file: File, folderName: string): Observable<any> {
        const formData: FormData = new FormData();

        formData.append('file', file);
        formData.append('folderName', folderName);

        return this.http.post<any>(apiConfig.baseUrl + '/storage/file', formData, {
            reportProgress: true,
            responseType: 'json'
        }).pipe();
    }

    /**
     * set form control init value
     * @param prop properties 
     * @returns 
     */
    returnControlTypeEmptyValue(prop: PropertiesDto): any {
        let type = prop.propertyType;

        if (type === CONTROL_TYPE_CODE.Textbox || type === CONTROL_TYPE_CODE.Textarea || type === CONTROL_TYPE_CODE.Email || type === CONTROL_TYPE_CODE.Phone || type === CONTROL_TYPE_CODE.Url) {
            return '';
        }
        else if (type === CONTROL_TYPE_CODE.Checkbox || type === CONTROL_TYPE_CODE.Multiselect) {
            return null;
        }
        else if (type === CONTROL_TYPE_CODE.Date || type === CONTROL_TYPE_CODE.DateTime || type === CONTROL_TYPE_CODE.Time) {
            return new Date();
        }
        else if (type === CONTROL_TYPE_CODE.Number) {
            return 0;
        }
        else if (type === CONTROL_TYPE_CODE.Dropdown) {
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

    setPropertyDataValue(prop: PropertiesDto, value: any): string {
        if (prop.propertyType === CONTROL_TYPE_CODE.Checkbox || prop.propertyType === CONTROL_TYPE_CODE.MultiCheckbox || prop.propertyType === CONTROL_TYPE_CODE.Multiselect) {
            return value.filter((item: any) => item.length > 0).toString();
        }
        return value.toString();
    }
}

export class BasedDto {
    createdDate?: Date;
    createdBy?: string;
    modifiedDate?: Date;
    modifiedBy?: string;
    statusId?: number;
}

export class ModuleDto extends BasedDto {
    uid: string;
    moduleId: string;
    moduleName: string;
    moduleNumber: string;
    moduleSubCode: string;
    moduleType: string;
    moduleValue: string;
    moduleCode: string;
}

export class PropertyGroupDto extends ModuleDto {
    propertiesList: PropertiesDto[];
    isHide: boolean;
}

export class PropertiesDto extends BasedDto {
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
    moduleCat: string;
    moduleCode: string;
    order: number;
    propertyLookupList: PropertyLookupDto[];
    isHide: boolean;
}

export class PropertyLookupDto extends BasedDto {
    uid: string;
    propertyLookupId: string;
    propertyId: string;
    propertyLookupLabel: string;
    propertyLookupCode: string;
    moduleCode: string;
    isDefault: boolean;
    isSystem: boolean;
    isVisiable: boolean;
}

export class ContactDto extends BasedDto {
    uid: string;
    contactId?: string;
    contactFirstName: string;
    contactLastName: string;
    contactEmail: string;
    contactPhone: string;
    contactOwnerUid?: string;
    contactLeadStatusId?: string;
    contactProperties: string;
}

export class UpdateContactDto {
    uid: string;
    contactFirstName?: string;
    contactLastName?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactOwnerUid?: string;
    contactLeadStatusId?: string;
    contactProperties?: string;
}

export class PropertyDataDto {
    uid: string;
    propertyCode: string;
    value: string;
}

export class AttachmentDto extends BasedDto {
    uid?: string;
    folderName: string;
    fullPath: string;
    fileName: string;
    activityUid: string;
    fileSize: number;
}