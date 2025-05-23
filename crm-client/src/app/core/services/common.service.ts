import { Injectable, Injector } from "@angular/core";
import { Observable } from "rxjs"; import apiConfig from "../../../environments/apiConfig";
import { CONTROL_TYPE_CODE } from "./components.service";
import { TranslateService } from "@ngx-translate/core";
import { CoreHttpService, ResponseModel } from "./core-http.service";
import { ToastService } from "./toast.service";
import { HttpClient } from "@angular/common/http";
import { MessageService } from "primeng/api";
import { BasedDto, CoreAuthService } from "./core-auth.service";
import { ActivatedRoute } from "@angular/router";

@Injectable({ providedIn: 'root' })
export class CommonService {
    language: string = 'en';
    windowSize: WindowSizeDto = new WindowSizeDto();
    private paramData = {
        token: null,
        project: null,
        redirect_uri: null,
    };

    constructor(
        private http: HttpClient,
        private messageService: MessageService,
        private coreService: CoreHttpService,
        private toastService: ToastService,
        private translateService: TranslateService,
        private route: ActivatedRoute,
        private authCoreService: CoreAuthService,
    ) {
    }

    set setWindowSize(windowSize: WindowSizeDto) {
        this.windowSize = windowSize;
    }

    set params(params: any) {
        this.paramData = params;
    }

    get params() {
        return this.paramData;
    }

    returnParamDataUrl(): string {
        const params: Record<string, string | undefined | null> = {
            redirect_uri: this.paramData.redirect_uri,
            project: this.paramData.project,
            token: this.paramData.token,
        };

        const query = Object.entries(params)
            .filter(([_, value]) => value !== undefined && value !== null)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value!)}`)
            .join("&");

        return query ? `?${query}` : "";
    }

    getParamsUrl(): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                this.route.queryParams.subscribe(params => {
                    const redirectUri = params['redirect_uri'];
                    const project = params['project'];
                    const token = params['token'];
                    this.params = {
                        redirect_uri: redirectUri,
                        project: project,
                        token: token,
                    }
                    this.authCoreService.jwt_token = token;
                    console.log(this.params);

                    resolve(this.params);
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }

    updateWindowSize() {
        if (window.innerWidth <= 640) {
            this.setWindowSize = {
                mobile: true,
                tablet: false,
                desktop: false
            };
        }
        else if (window.innerWidth > 640 && window.innerWidth <= 768) {
            this.setWindowSize = {
                mobile: false,
                tablet: true,
                desktop: false
            };
        }
        else {
            this.setWindowSize = {
                mobile: false,
                tablet: false,
                desktop: true
            };
        }
    }

    returnFileSize(bytes: number = 0, decimals: number = 2) {
        if (!+bytes) return '0 Bytes'

        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

        const i = Math.floor(Math.log(bytes) / Math.log(k))

        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
    }

    getEnvToken(): Observable<any> {
        return this.http.get<any>(apiConfig.baseUrl + '/token').pipe();
    }

    setLanguage(lang: string) {
        this.language = lang;
    }

    getLanguage(): string {
        return this.language;
    }

    generateGUID(stringLength: number) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < stringLength; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    popMessage(message: string, title: string, severity: string = 'success',) {
        this.messageService.add({ severity: severity, summary: title, detail: message });
    }

    getAllContact(): Observable<ResponseModel<ContactDto[]>> {
        return this.coreService.get<ContactDto[]>('contact').pipe();
    }

    getContactById(id: string): Observable<ResponseModel<ContactDto>> {
        return this.coreService.get<ContactDto>('contact/' + id).pipe();
    }

    createContact(contactList: ContactDto[]): Observable<ResponseModel<ContactDto[]>> {
        return this.coreService.post<ContactDto[]>('contact', { contactList }).pipe();
    }

    updateContact(contactList: UpdateContactDto[]): Observable<ResponseModel<UpdateContactDto[]>> {
        return this.coreService.put<UpdateContactDto[]>('contact', { contactList }).pipe();
    }

    deleteContact(contactList: ContactDto[]): Observable<ResponseModel<ContactDto>> {
        return this.coreService.put<ContactDto>('contact/delete', { contactList }).pipe();
    }

    getAllModuleByModuleType(moduleType: string): Observable<ResponseModel<ModuleDto[]>> {
        let headers = {
            'moduleType': moduleType,
        }
        return this.coreService.get<ModuleDto[]>('property/moduleCode/moduleType', {
            headers: headers
        }).pipe();
    }

    getSubModuleByModule(submoduleCode: string): Observable<ResponseModel<ModuleDto[]>> {
        let headers = {
            'submoduleCode': submoduleCode ?? '',
        }
        return this.coreService.get<ModuleDto[]>('property/moduleCode/subModule/code', {
            headers: headers
        }).pipe();
    }

    getAllPropertiesByModule(module: string): Observable<ResponseModel<PropertyGroupDto[]>> {
        let headers = {
            'moduleCode': module,
        }
        return this.coreService.get<PropertyGroupDto[]>('property/properties/module', {
            headers: headers
        }).pipe();
    }

    createProperties(properties: CreatePropertyDto[]): Observable<ResponseModel<PropertiesDto[]>> {
        return this.coreService.post<PropertiesDto[]>('property/properties', properties).pipe();
    }

    createPropertyLookup(lookup: CreatePropertyLookupDto[]): Observable<ResponseModel<PropertyLookupDto[]>> {
        return this.coreService.post<PropertyLookupDto[]>('property/propertiesLookup', lookup).pipe();
    }

    updateProperties(properties: UpdatePropertyDto[], userUid: string): Observable<ResponseModel<any[]>> {
        return this.coreService.put<any[]>('property/properties/update', { properties, user: userUid }).pipe();
    }

    updatePropertiesLookup(lookup: UpdatePropertyLookupDto[], userUid: string): Observable<ResponseModel<any[]>> {
        return this.coreService.put<any[]>('property/propertiesLookup/update', { lookup, user: userUid }).pipe();
    }

    deleteProperty(propertyList: PropertiesDto[], userUid: string): Observable<ResponseModel<any>> {
        return this.coreService.put<any>('property/properties/delete', { propertyList, user: userUid }).pipe();
    }

    uploadFile(file: File, folderName: string): Observable<ResponseModel<any>> {
        const formData: FormData = new FormData();

        formData.append('file', file);
        formData.append('folderName', folderName);

        return this.coreService.post<any, FormData>('attachment/file', formData, {
            reportProgress: true,
            responseType: 'json',
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
        else if (type === CONTROL_TYPE_CODE.MultiCheckbox || type === CONTROL_TYPE_CODE.Multiselect || type === CONTROL_TYPE_CODE.Dropdown) {
            return null;
        }
        else if (type === CONTROL_TYPE_CODE.Date || type === CONTROL_TYPE_CODE.DateTime || type === CONTROL_TYPE_CODE.Time) {
            return null;
        }
        else if (type === CONTROL_TYPE_CODE.Number) {
            return 0;
        }
        else if (type === CONTROL_TYPE_CODE.MultiCheckbox || type === CONTROL_TYPE_CODE.Dropdown || type === CONTROL_TYPE_CODE.Multiselect) {
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
        if (prop.propertyType === CONTROL_TYPE_CODE.MultiCheckbox || prop.propertyType === CONTROL_TYPE_CODE.Multiselect) {
            return value.filter((item: any) => item.length > 0).toString();
        }
        return value;
    }

    getAllCompany(): Observable<ResponseModel<CompanyDto[]>> {
        return this.coreService.get<CompanyDto[]>('company').pipe();
    }

    getCompanyById(id: string): Observable<ResponseModel<CompanyDto>> {
        return this.coreService.get<CompanyDto>('company/' + id).pipe();
    }

    createCompany(companyList: CompanyDto[]): Observable<ResponseModel<CompanyDto[]>> {
        return this.coreService.post<CompanyDto[]>('company', { companyList }).pipe();
    }

    updateCompany(companyList: UpdateCompanyDto[]): Observable<ResponseModel<UpdateCompanyDto[]>> {
        return this.coreService.put<UpdateCompanyDto[]>('company', { companyList }).pipe();
    }

    deleteCompany(companyList: CompanyDto[]): Observable<ResponseModel<CompanyDto[]>> {
        return this.coreService.put<CompanyDto[]>('company/delete', { companyList }).pipe();
    }

    createAssociation(asso: CreateAssociationDto): Observable<ResponseModel<any>> {
        return this.coreService.post<any>('association/add', { asso }).pipe();
    }

    translate(text: string): string {
        return this.translateService.instant(text);
    }

    getAllCountry(): Observable<ResponseModel<CountryDto[]>> {
        return this.coreService.get<CountryDto[]>('location/country').pipe();
    }

    getAllState(): Observable<ResponseModel<StateDto[]>> {
        return this.coreService.get<StateDto[]>('location/state').pipe();
    }

    getStateByCountryId(countryId: string): Observable<ResponseModel<StateDto[]>> {
        return this.coreService.get<StateDto[]>('location/state/' + countryId);
    }

    getCityByStateId(stateId: string): Observable<ResponseModel<CityDto[]>> {
        return this.coreService.get<CityDto[]>('location/city/' + stateId);
    }

    getStateByStateName(stateName: string): Observable<ResponseModel<StateDto[]>> {
        return this.coreService.get<StateDto[]>('location/state/name/' + stateName);
    }

    getCityByCityName(cityName: string): Observable<ResponseModel<CityDto[]>> {
        return this.coreService.get<CityDto[]>('location/city/name/' + cityName);
    }

    removeAsso(module: 'CONT' | 'COMP', uid: string, assoUid: string): Observable<ResponseModel<any[]>> {
        let data = {
            module: module,
            uid: uid,
            assoUid: assoUid
        }
        return this.coreService.put<any>('association/removeAsso', { data }).pipe();
    }

    checkPropertyUnique(module: 'CONT' | 'COMP', propertyList: PropertiesDto[], propertyDataList: PropertyDataDto[]): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let data = {
                module: module,
                propertyList: propertyList,
                propertyDataList: propertyDataList
            }
            this.coreService.post<PropertyDataDto[]>('property/checkUnique', { data }).pipe().subscribe(res => {
                if (res.isSuccess) {
                    resolve(true);
                }
                else {
                    this.toastService.clear();
                    res.data.forEach(pd => {
                        this.toastService.addSingle({
                            message: this.translateService.instant('ERROR.NOT_UNIQUE', {
                                property: propertyList.find(p => p.uid === pd.uid).propertyName
                            }),
                            severity: 'error'
                        })
                    })

                }
            });
        });
    }
}

export class WindowSizeDto {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
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
    propertyId: number;
    uid: string;
    propertyName: string;
    propertyCode: string;
    propertyType: string;
    isDefaultProperty: boolean;
    isSystem: boolean;
    isMandatory: boolean;
    isEditable: boolean;
    isVisible: boolean;
    isUnique: boolean;
    moduleCat: string;
    moduleCode: string;
    order: number;
    propertyLookupList: PropertyLookupDto[] | UserCommonDto[];
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
    maxDecimal?: number;
    numberOnly?: boolean;
    noSpecialChar?: boolean;
    futureDateOnly?: boolean;
    pastDateOnly?: boolean;
    dateRangeStart?: Date;
    dateRangeEnd?: Date;
    weekdayOnly?: boolean;
    weekendOnly?: boolean;
    regaxFormat?: string;
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
    isVisible: boolean;
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
    association?: AssociationDto;
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
    modifiedBy: string;
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
    fileType: string;
    activityUid: string;
    fileSize: number;
    contactUid: string[];
    companyUid: string[];
    url?: string;
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
    association?: AssociationDto;
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
    modifiedBy: string;
}

export class AssociationDto {
    companyList: CompanyDto[];
    contactList: ContactDto[];
}

export class CreateAssociationDto {
    contactAssoList?: ContactDto[];
    companyAssoList?: CompanyDto[];
    module: 'CONT' | 'COMP';
    profileUid: string;
}

export class UserCommonDto {
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

export class CreatePropertyDto extends BasedDto {
    propertyName: string;
    propertyCode: string;
    moduleCode: string;
    moduleCat: string;
    propertyType: string;
    isDefaultProperty: boolean;
    isMandatory: boolean;
    isEditable: boolean;
    isVisible: boolean;
    isUnique: boolean;
    regaxFormat?: string;
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
    maxDecimal?: number;
    numberOnly?: boolean;
    noSpecialChar?: boolean;
    futureDateOnly?: boolean;
    pastDateOnly?: boolean;
    dateRangeStart?: Date;
    dateRangeEnd?: Date;
    weekdayOnly?: boolean;
    weekendOnly?: boolean;
    dealOwner: string;
    // propertyLookupList: CreatePropertyLookupDto[];
}

export class CreatePropertyLookupDto extends BasedDto {
    propertyId: number;
    propertyLookupLabel: string;
    propertyLookupCode: string;
    moduleCode: string;
    isDefault: boolean;
    isSystem: boolean;
    isVisible: boolean;
}

export class UpdatePropertyDto extends BasedDto {
    propertyName: string;
    propertyCode: string;
    moduleCode: string;
    moduleCat: string;
    propertyType: string;
    isMandatory: boolean;
    isEditable: boolean;
    isVisible: boolean;
    isUnique: boolean;
    regaxFormat: string;
    minLength: number;
    maxLength: number;
    minValue: number;
    maxValue: number;
    maxDecimal: number;
    numberOnly: boolean;
    noSpecialChar: boolean;
    futureDateOnly: boolean;
    pastDateOnly: boolean;
    dateRangeStart: Date;
    dateRangeEnd: Date;
    weekdayOnly: boolean;
    weekendOnly: boolean;
}

export class UpdatePropertyLookupDto extends BasedDto {
    propertyLookupLabel: string;
    propertyLookupCode: string;
    isDefault: boolean;
    isVisible: boolean;
}