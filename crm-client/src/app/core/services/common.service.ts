import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import apiConfig from "../../../environments/apiConfig";
import { CONTROL_TYPE_CODE } from "./components.service";
import { MessageService } from "primeng/api";
import { TranslateService } from "@ngx-translate/core";

@Injectable({ providedIn: 'root' })
export class CommonService {
    constructor(
        private http: HttpClient,
        private messageService: MessageService,
        private translateService: TranslateService
    ) {
    }

    getEnvToken(): Observable<any> {
        return this.http.get<any>(apiConfig.baseUrl + '/token').pipe();
    }

    generateGUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    popMessage(message: string, title: string, severity: string = 'success',) {
        this.messageService.add({ severity: severity, summary: title, detail: message });
    }

    getAllContact(): Observable<ResponseModel<ContactDto[]>> {
        return this.http.get<ResponseModel<ContactDto[]>>(apiConfig.baseUrl + '/contact').pipe();
    }

    getContactById(id: string): Observable<ResponseModel<ContactDto>> {
        return this.http.get<ResponseModel<ContactDto>>(apiConfig.baseUrl + '/contact/' + id).pipe();
    }

    createContact(contactList: ContactDto[]): Observable<ResponseModel<ContactDto[]>> {
        return this.http.post<ResponseModel<ContactDto[]>>(apiConfig.baseUrl + '/contact', { contactList }).pipe();
    }

    updateContact(contactList: UpdateContactDto[]): Observable<ResponseModel<UpdateContactDto[]>> {
        return this.http.put<ResponseModel<UpdateContactDto[]>>(apiConfig.baseUrl + '/contact', { contactList }).pipe();
    }

    deleteContact(contactList: ContactDto[]): Observable<ResponseModel<ContactDto>> {
        return this.http.put<ResponseModel<ContactDto>>(apiConfig.baseUrl + '/contact/delete', { contactList }).pipe();
    }

    getAllProperties(): Observable<ResponseModel<PropertiesDto[]>> {
        return this.http.get<ResponseModel<PropertiesDto[]>>(apiConfig.baseUrl + '/common/properties').pipe();
    }

    getAllPropertiesByModule(module: string): Observable<ResponseModel<PropertyGroupDto[]>> {
        let headers = {
            'moduleCode': module
        }
        return this.http.get<ResponseModel<PropertyGroupDto[]>>((apiConfig.baseUrl + '/common/properties/module'), { headers }).pipe();
    }

    getAllCreateFormPropertiesByModule(module: string): Observable<ResponseModel<PropertyGroupDto[]>> {
        let headers = {
            'moduleCode': module
        }
        return this.http.get<ResponseModel<PropertyGroupDto[]>>((apiConfig.baseUrl + '/common/properties/module/create'), { headers }).pipe();
    }

    createProperties(properties: PropertiesDto): Observable<ResponseModel<PropertyGroupDto>> {
        return this.http.post<ResponseModel<PropertyGroupDto>>(apiConfig.baseUrl + '/common/properties', properties).pipe();
    }

    uploadFile(file: File, folderName: string): Observable<ResponseModel<any>> {
        const formData: FormData = new FormData();

        formData.append('file', file);
        formData.append('folderName', folderName);

        return this.http.post<ResponseModel<any>>(apiConfig.baseUrl + '/storage/file', formData, {
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
            return null;
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
                if ((item as PropertyLookupDto).isDefault) {
                    lookup = {
                        label: (item as PropertyLookupDto).propertyLookupLabel,
                        value: item.uid
                    }
                }
            });
            return lookup.value;
        }
        else if (type === CONTROL_TYPE_CODE.Radio) {
            return false;
        }
        return null;
    }

    setPropertyDataValue(prop: PropertiesDto, value: any): string {
        if (prop.propertyType === CONTROL_TYPE_CODE.Checkbox || prop.propertyType === CONTROL_TYPE_CODE.MultiCheckbox || prop.propertyType === CONTROL_TYPE_CODE.Multiselect) {
            return value.filter((item: any) => item.length > 0).toString();
        }
        return value.toString();
    }

    getAllCompany(): Observable<ResponseModel<CompanyDto[]>> {
        return this.http.get<ResponseModel<CompanyDto[]>>(apiConfig.baseUrl + '/company').pipe();
    }

    getCompanyById(id: string): Observable<ResponseModel<CompanyDto>> {
        return this.http.get<ResponseModel<CompanyDto>>(apiConfig.baseUrl + '/company/' + id).pipe();
    }

    createCompany(companyList: CompanyDto[]): Observable<ResponseModel<CompanyDto[]>> {
        return this.http.post<ResponseModel<CompanyDto[]>>(apiConfig.baseUrl + '/company', { companyList }).pipe();
    }

    updateCompany(companyList: UpdateCompanyDto[]): Observable<ResponseModel<UpdateCompanyDto[]>> {
        return this.http.put<ResponseModel<UpdateCompanyDto[]>>(apiConfig.baseUrl + '/company', { companyList }).pipe();
    }

    deleteCompany(companyList: CompanyDto[]): Observable<ResponseModel<CompanyDto[]>> {
        return this.http.put<ResponseModel<CompanyDto[]>>(apiConfig.baseUrl + '/company/delete', { companyList }).pipe();
    }

    createAssociation(asso: CreateAssociationDto): Observable<ResponseModel<any>> {
        return this.http.post<ResponseModel<any>>(apiConfig.baseUrl + '/common/asso', { asso }).pipe();
    }

    translate(text: string): string {
        return this.translateService.instant(text);
    }

    getAllCountry(): Observable<ResponseModel<CountryDto[]>> {
        return this.http.get<ResponseModel<CountryDto[]>>(apiConfig.baseUrl + '/location/country').pipe();
    }

    getAllState(): Observable<ResponseModel<StateDto[]>> {
        return this.http.get<ResponseModel<StateDto[]>>(apiConfig.baseUrl + '/location/state').pipe();
    }

    getStateByCountryId(countryId: string): Observable<ResponseModel<StateDto[]>> {
        return this.http.get<ResponseModel<StateDto[]>>(apiConfig.baseUrl + '/location/state/' + countryId);
    }

    getCityByStateId(stateId: string): Observable<ResponseModel<CityDto[]>> {
        return this.http.get<ResponseModel<CityDto[]>>(apiConfig.baseUrl + '/location/city/' + stateId);
    }

    getStateByStateName(stateName: string): Observable<ResponseModel<StateDto[]>> {
        return this.http.get<ResponseModel<StateDto[]>>(apiConfig.baseUrl + '/location/state/name/' + stateName);
    }

    getCityByCityName(cityName: string): Observable<ResponseModel<CityDto[]>> {
        return this.http.get<ResponseModel<CityDto[]>>(apiConfig.baseUrl + '/location/city/name/' + cityName);
    }
}

export class ResponseModel<T> {
    data: T;
    isSuccess: boolean;
    responseMessage: string;
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
    propertyLookupList: PropertyLookupDto[] | UserDto[];
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
    contactId?: number;
    contactFirstName: string;
    contactLastName: string;
    contactEmail: string;
    contactPhone: string;
    contactOwnerUid?: string;
    contactLeadStatusUid?: string;
    contactProperties: string;
    contactProfilePhotoUrl?: string;
    associationList: CompanyDto[];
    [key: string]: any;
}

export class UpdateContactDto {
    uid: string;
    contactFirstName?: string;
    contactLastName?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactOwnerUid?: string;
    contactLeadStatusUid?: string;
    contactProperties?: string;
    contactProfilePhotoUrl?: string;
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

export class CompanyDto extends BasedDto {
    uid: string;
    companyId?: number;
    companyName: string;
    companyEmail: string;
    companyWebsite: string;
    companyOwnerUid?: string;
    companyLeadStatusId?: string;
    companyProperties: string;
    companyProfilePhotoUrl?: string;
    associationList: ContactDto[];
    [key: string]: any;
}

export class UpdateCompanyDto {
    uid: string;
    companyName?: string;
    companyEmail?: string;
    companyWebsite?: string;
    companyOwnerUid?: string;
    companyLeadStatusId?: string;
    companyProperties?: string;
    companyProfilePhotoUrl?: string;
}

export class AssociationDto {
    uid: string;
    contactAssoList: ContactDto[];
    companyAssoList: CompanyDto[];
    module: string;
    profileUid: string;
}

export class CreateAssociationDto {
    contactAssoList?: ContactDto[];
    companyAssoList?: CompanyDto[];
    module: 'CONT' | 'COMP';
    profileUid: string;
}

export class UserDto {
    uid: string;
    displayName: string;
    email: string;
    emailVerified: boolean;
}

export class CountryDto extends BasedDto {
    uid: string;
    countryId: number;
    name: string;
    iso3: string;
    numericCode: number;
    iso2: string;
    phoneCode: number;
    capital: string;
    currency: string;
    currencyName: string;
    currencySymbol: string;
    tld: string;
    native: string;
    region: string;
    regionId: number;
    subregion: string;
    subregionId: number;
    nationality: string;
    timezones: string;
    translations: string;
    latitude: number;
    longtitude: number;
}

export class StateDto extends BasedDto {
    uid: string;
    countryId: number;
    stateId: number;
    name: string;
    countryCode: string;
    fipsCode: number;
    iso2: string;
    type: string;
    latitude: number;
    longtitude: number;
}

export class CityDto extends BasedDto {
    uid: string;
    cityId: number;
    countryId: number;
    stateId: number;
    name: string;
    countryCode: string;
    stateCode: string;
    latitude: number;
    longtitude: number;
}

export class profileUpdateDto {
    property: PropertiesDto;
    value: string;
}