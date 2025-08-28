import { FormGroup, FormControl, FormBuilder } from "@angular/forms";
import { debounceTime, distinctUntilChanged, map, Observable, of } from "rxjs";
import { CommonService, CompanyDto, ContactDto, profileUpdateDto, PropertiesDto, PropertyDataDto, PropertyGroupDto, PropertyLookupDto, UpdateCompanyDto, UpdateContactDto, UserCommonDto } from "../../services/common.service";
import { FormConfig, CONTROL_TYPE, CONTROL_TYPE_CODE, OptionsModel } from "../../services/components.service";
import { BaseCoreAbstract } from "./base-core.abstract";
import { AuthService } from "../../services/auth.service";
import { TranslateService } from "@ngx-translate/core";
import { ToastService } from "../../services/toast.service";
import { CoreHttpService, UserPermissionDto } from "../../services/core-http.service";
import { CoreAuthService } from "../../services/core-auth.service";

export abstract class BasePropertyAbstract extends BaseCoreAbstract {
    profileFormGroup: FormGroup = new FormGroup({});
    initProfileFormGroup: FormGroup = new FormGroup({});
    countryFormId: string = "";
    countryOptionList: OptionsModel[] = [];
    stateFormId: string = "";
    stateList: Observable<OptionsModel[]>;
    showFormUpdateSidebar: boolean = false;
    propUpdateList: profileUpdateDto[] = [];
    propertyConfig: any[] = [];
    tempPropertyConfigNumber: any = {};
    propertyDisplayList: any[] = [];

    constructor(
        protected formBuilder: FormBuilder,
        protected commonService: CommonService,
        protected toastService: ToastService,
        protected authService: AuthService,
        protected translateService: TranslateService,
        protected coreAuthService: CoreAuthService,

    ) {
        super(coreAuthService)
    }

    /**  
      initial property form
    **/
    initProfileFormConfig(propertyList: PropertyGroupDto[], module: 'CONT' | 'COMP', contactProfile: ContactDto, companyProfile: CompanyDto, isLeftPanel: boolean, permission: UserPermissionDto[]) {
        let propCount = 0;

        this.profileFormGroup = this.formBuilder.group({});

        propertyList.forEach(item => {
            let formsConfig: FormConfig[] = [];
            item.propertiesList.forEach(prop => {
                let propProfileValue = this.returnProfileValue(prop, module, contactProfile, companyProfile);
                let control = new FormControl({ value: propProfileValue ? propProfileValue : this.commonService.returnControlTypeEmptyValue(prop), disabled: !this.checkPermission('update', module, permission) || !prop.isEditable });

                this.profileFormGroup.addControl(prop.propertyCode, control);

                let forms: FormConfig = {
                    id: prop.uid,
                    name: prop.propertyCode,
                    type: CONTROL_TYPE.Textbox,
                    label: prop.propertyName,
                    fieldControl: this.profileFormGroup.controls[prop.propertyCode],
                    layoutDefine: {
                        row: propCount,
                        column: 0,
                    },
                    required: prop.isMandatory
                };

                // check if its not left panel (AKA all properties) or its on left panel (then only show the property when isVisible == true)
                if (prop.isVisible || !isLeftPanel) {
                    if (prop.propertyType === CONTROL_TYPE_CODE.Textbox || prop.propertyType === CONTROL_TYPE_CODE.Textarea) {
                        forms = {
                            id: prop.uid,
                            name: prop.propertyCode,
                            type: CONTROL_TYPE.Textbox,
                            label: prop.propertyName,
                            fieldControl: this.profileFormGroup.controls[prop.propertyCode],
                            layoutDefine: {
                                row: propCount,
                                column: 0,
                            },
                            required: prop.isMandatory
                        }
                    }
                    else if (prop.propertyType === CONTROL_TYPE_CODE.Url) {
                        forms = {
                            id: prop.uid,
                            name: prop.propertyCode,
                            type: CONTROL_TYPE.Textbox,
                            label: prop.propertyName,
                            fieldControl: this.profileFormGroup.controls[prop.propertyCode],
                            layoutDefine: {
                                row: propCount,
                                column: 0,
                            },
                            required: prop.isMandatory,
                            mode: 'url'
                        }
                    }
                    else if (prop.propertyType === CONTROL_TYPE_CODE.Phone) {
                        forms = {
                            id: prop.uid,
                            name: prop.propertyCode,
                            type: CONTROL_TYPE.Textbox,
                            label: prop.propertyName,
                            fieldControl: this.profileFormGroup.controls[prop.propertyCode],
                            layoutDefine: {
                                row: propCount,
                                column: 0,
                            },
                            required: prop.isMandatory,
                            mode: 'phone'
                        }
                    }
                    else if (prop.propertyType === CONTROL_TYPE_CODE.Number || prop.propertyType === CONTROL_TYPE_CODE.Year) {
                        forms = {
                            id: prop.uid,
                            name: prop.propertyCode,
                            type: CONTROL_TYPE.Textbox,
                            label: prop.propertyName,
                            fieldControl: this.profileFormGroup.controls[prop.propertyCode],
                            layoutDefine: {
                                row: propCount,
                                column: 0,
                            },
                            required: prop.isMandatory,
                            mode: 'number',
                            maxLength: prop.propertyType === CONTROL_TYPE_CODE.Year ? 4 : undefined,
                            min: prop.propertyType === CONTROL_TYPE_CODE.Year ? 1000 : undefined,
                            useGrouping: prop.propertyType === CONTROL_TYPE_CODE.Year ? false : true
                        }
                    }
                    else if (prop.propertyType === CONTROL_TYPE_CODE.Email) {
                        forms = {
                            id: prop.uid,
                            name: prop.propertyCode,
                            type: CONTROL_TYPE.Textbox,
                            label: prop.propertyName,
                            fieldControl: this.profileFormGroup.controls[prop.propertyCode],
                            layoutDefine: {
                                row: propCount,
                                column: 0,
                            },
                            required: prop.isMandatory,
                            mode: 'email',
                        }
                    }
                    else if (prop.propertyType === CONTROL_TYPE_CODE.Checkbox || prop.propertyType === CONTROL_TYPE_CODE.MultiCheckbox || prop.propertyType === CONTROL_TYPE_CODE.Multiselect || prop.propertyType === CONTROL_TYPE_CODE.Dropdown || prop.propertyType === CONTROL_TYPE_CODE.Radio) {
                        let propertyLookupList: OptionsModel[] = [];
                        prop.propertyLookupList.forEach((item) => {
                            propertyLookupList.push({ label: (item as PropertyLookupDto).propertyLookupLabel, value: item.uid });
                        });

                        forms = {
                            id: prop.uid,
                            name: prop.propertyCode,
                            type: prop.propertyType === CONTROL_TYPE_CODE.Checkbox || prop.propertyType === CONTROL_TYPE_CODE.MultiCheckbox ? CONTROL_TYPE.Checkbox : prop.propertyType === CONTROL_TYPE_CODE.Multiselect ? CONTROL_TYPE.Multiselect : prop.propertyType === CONTROL_TYPE_CODE.Dropdown ? CONTROL_TYPE.Dropdown : CONTROL_TYPE.Radio,
                            label: prop.propertyName,
                            fieldControl: this.profileFormGroup.controls[prop.propertyCode],
                            layoutDefine: {
                                row: propCount,
                                column: 0,
                            },
                            options: propertyLookupList,
                            required: prop.isMandatory,
                            switchInput: prop.propertyType === CONTROL_TYPE_CODE.Checkbox,
                        }
                    }
                    else if (prop.propertyType === CONTROL_TYPE_CODE.DateTime || prop.propertyType === CONTROL_TYPE_CODE.Date || prop.propertyType === CONTROL_TYPE_CODE.Time) {
                        forms = {
                            id: prop.uid,
                            name: prop.propertyCode,
                            type: CONTROL_TYPE.Calendar,
                            label: prop.propertyName,
                            fieldControl: this.profileFormGroup.controls[prop.propertyCode],
                            layoutDefine: {
                                row: propCount,
                                column: 0,
                            },
                            required: prop.isMandatory,
                            timeOnly: prop.propertyType === CONTROL_TYPE_CODE.Time ? true : false,
                            showTime: prop.propertyType !== CONTROL_TYPE_CODE.Date ? true : false
                        }
                    }
                    else if (prop.propertyType === CONTROL_TYPE_CODE.Country) {
                        this.countryFormId = prop.uid;
                        forms = {
                            id: prop.uid,
                            name: prop.propertyCode,
                            type: CONTROL_TYPE.Dropdown,
                            label: prop.propertyName,
                            fieldControl: this.profileFormGroup.controls[prop.propertyCode],
                            layoutDefine: {
                                row: propCount,
                                column: 0,
                            },
                            options: this.countryOptionList
                        }
                    }
                    else if (prop.propertyType === CONTROL_TYPE_CODE.State) {
                        this.stateFormId = prop.uid;
                        forms = {
                            id: prop.uid,
                            name: prop.propertyCode,
                            type: CONTROL_TYPE.Dropdown,
                            label: prop.propertyName,
                            fieldControl: this.profileFormGroup.controls[prop.propertyCode],
                            layoutDefine: {
                                row: propCount,
                                column: 0,
                            },
                            dataSourceDependOn: [this.countryFormId],
                            dataSourceAction: () => this.getStateList()
                        }
                    }
                    else if (prop.propertyType === CONTROL_TYPE_CODE.City) {
                        forms = {
                            id: prop.uid,
                            name: prop.propertyCode,
                            type: CONTROL_TYPE.Dropdown,
                            label: prop.propertyName,
                            fieldControl: this.profileFormGroup.controls[prop.propertyCode],
                            layoutDefine: {
                                row: propCount,
                                column: 0,
                            },
                            dataSourceDependOn: [this.stateFormId],
                            dataSourceAction: () => this.getCityList()
                        }
                    }
                    else if (prop.propertyType === CONTROL_TYPE_CODE.Postcode) {
                        forms = {
                            id: prop.uid,
                            name: prop.propertyCode,
                            type: CONTROL_TYPE.Textbox,
                            label: prop.propertyName,
                            fieldControl: this.profileFormGroup.controls[prop.propertyCode],
                            layoutDefine: {
                                row: propCount,
                                column: 0,
                            }
                        }
                    }
                    else if (prop.propertyType === CONTROL_TYPE_CODE.User) {
                        let propertyLookupList: OptionsModel[] = [];
                        prop.propertyLookupList.forEach((item) => {
                            propertyLookupList.push({ label: `${(item as UserCommonDto).displayName}`, value: item.uid });
                        });

                        forms = {
                            id: prop.uid,
                            name: prop.propertyCode,
                            type: CONTROL_TYPE.Dropdown,
                            label: prop.propertyName,
                            fieldControl: this.profileFormGroup.controls[prop.propertyCode],
                            layoutDefine: {
                                row: propCount,
                                column: 0,
                            },
                            options: propertyLookupList
                        }
                    }

                    this.propertyDisplayList.push({
                        property: prop,
                        isNull: false,
                        isSearch: true
                    })
                    formsConfig.push(forms);
                    propCount++;
                }
            });
            this.propertyConfig.push({
                moduleCode: item.moduleCode,
                list: formsConfig
            });
            this.tempPropertyConfigNumber[item.moduleCode] = 1;
        });

        this.initProfileFormGroup = this.profileFormGroup.value;
    }

    returnProfileValue(prop: PropertiesDto, module: 'CONT' | 'COMP', contactProfile: ContactDto, companyProfile: CompanyDto): string | Date | null {
        if (contactProfile || companyProfile) {
            if (module === 'CONT') {
                switch (prop.propertyCode) {
                    case 'first_name':
                        return contactProfile.contactFirstName;
                    case 'last_name':
                        return contactProfile.contactLastName
                    case 'email':
                        return contactProfile.contactEmail;
                    case 'phone_number':
                        return contactProfile.contactPhone;
                    case 'contact_owner':
                        return contactProfile.contactOwnerUid ?? null;
                    case 'created_date':
                        return contactProfile.createdDate ? new Date(contactProfile.createdDate) : null;
                    case 'created_by':
                        return contactProfile.createdBy ?? null;
                    case 'last_modified_date':
                        return contactProfile.modifiedDate ? new Date(contactProfile.modifiedDate) : null;
                    case 'last_modified_by':
                        return contactProfile.modifiedBy ?? null;
                    default:
                        let contactProp: PropertyDataDto[] = contactProfile.contactProperties ?? [];
                        if (contactProp.find(item => item.uid === prop.uid) && (prop.propertyType === CONTROL_TYPE_CODE.Date || prop.propertyType === CONTROL_TYPE_CODE.DateTime || prop.propertyType === CONTROL_TYPE_CODE.Time)) {
                            return new Date(contactProp.find(item => item.uid === prop.uid)!.value);
                        }
                        return contactProp.find(item => item.uid === prop.uid) ? contactProp.find(item => item.uid === prop.uid)!.value : null;
                }
            }
            else {
                switch (prop.propertyCode) {
                    case 'company_name':
                        return companyProfile.companyName;
                    case 'company_website_url':
                        return companyProfile.companyWebsite
                    case 'company_email':
                        return companyProfile.companyEmail;
                    case 'company_owner':
                        return companyProfile.companyOwnerUid ?? null;
                    case 'created_date':
                        return companyProfile.modifiedDate ? new Date(companyProfile.modifiedDate) : null;
                    case 'created_by':
                        return companyProfile.createdBy ?? null;
                    case 'last_modified_date':
                        return companyProfile.modifiedDate ? new Date(companyProfile.modifiedDate) : null;
                    case 'last_modified_by':
                        return companyProfile.modifiedBy ?? null;
                    default:
                        let companyProp: PropertyDataDto[] = companyProfile.companyProperties ?? [];
                        if (companyProp.find(item => item.uid === prop.uid) && (prop.propertyType === CONTROL_TYPE_CODE.Date || prop.propertyType === CONTROL_TYPE_CODE.DateTime || prop.propertyType === CONTROL_TYPE_CODE.Time)) {
                            console.log(new Date(companyProp.find(item => item.uid === prop.uid)!.value))
                            return new Date(companyProp.find(item => item.uid === prop.uid)!.value);
                        }
                        return companyProp.find(item => item.uid === prop.uid) ? companyProp.find(item => item.uid === prop.uid)!.value : null;
                }
            }
        }
        else {
            return null;
        }
    }

    getStateList(): Observable<any[]> {
        if (!this.profileFormGroup.controls['country'].value) {
            return of([]);
        }

        return this.commonService.getStateByCountryId(this.profileFormGroup.controls['country'].value).pipe(
            map(res => {
                return res.data.map(val => ({
                    value: val.uid,
                    label: val.name
                }))
            })
        );
    }

    getCityList(): Observable<any[]> {
        if (!this.profileFormGroup.controls['state'].value) {
            return of([]);
        }

        return this.commonService.getCityByStateId(this.profileFormGroup.controls['state'].value).pipe(
            map(res => {
                return res.data.map(val => ({
                    value: val.uid,
                    label: val.name
                }))
            })
        );
    }

    returnProfileFormConfig(code: string): FormConfig[] {
        return this.propertyConfig.find(item => item.moduleCode === code).list;
    }

    checkFormValueChange(propertyList: PropertyGroupDto[]) {
        // check fieldcontrol update value
        this.profileFormGroup.valueChanges.pipe(
            debounceTime(2000),
            distinctUntilChanged()
        ).subscribe(changedValue => {
            console.log(propertyList)
            propertyList.forEach(item => {
                item.propertiesList.forEach(prop => {
                    this.profileFormGroup.controls[prop.propertyCode].valueChanges.pipe(
                        debounceTime(2000),
                        distinctUntilChanged()
                    ).forEach(value => {
                        this.showFormUpdateSidebar = true;

                        let profileUpdateObj: profileUpdateDto = {
                            property: prop,
                            value: value
                        };

                        // add to the list if not exist else replace the value
                        if (!this.propUpdateList.find(item => item.property === prop)) {
                            this.propUpdateList.push(profileUpdateObj);
                        }
                        else {
                            this.propUpdateList.find(item => item.property === prop)!.value = value;
                        }
                    });
                });
            });
        });
    }

    cancelButton() {
        this.profileFormGroup.reset(this.initProfileFormGroup, { emitEvent: false });
        this.showFormUpdateSidebar = false;
    }

    saveButton(module: 'CONT' | 'COMP', contactProfile: ContactDto, companyProfile: CompanyDto) {
        this.toastService.addSingle({
            message: this.translateService.instant('MESSAGE.UPDATING_ACTIVITY'),
            severity: 'info',
            isLoading: true,
            key: 'propertyUpdate'
        })
        if (this.authService.returnPermissionObj(module, 'update')) {
            // cast property value into contact/company object
            if (module === 'CONT') {
                let updateContact: UpdateContactDto = new UpdateContactDto();
                let profileProperty: PropertyDataDto[] = contactProfile.contactProperties;
                let profilePropertyCheckUnique: PropertyDataDto[] = [];
                let updatePropertyList: PropertiesDto[] = [];

                updateContact.uid = contactProfile.uid;

                this.propUpdateList.forEach(prop => {
                    switch (prop.property.propertyCode) {
                        case 'first_name':
                            updateContact.contactFirstName = prop.value;
                            break;
                        case 'last_name':
                            updateContact.contactLastName = prop.value;
                            break;
                        case 'email':
                            updateContact.contactEmail = prop.value;
                            break;
                        case 'phone_number':
                            updateContact.contactPhone = prop.value;
                            break;
                        case 'contact_owner':
                            updateContact.contactOwnerUid = prop.value;
                            break;
                        case 'lead_status':
                            updateContact.contactLeadStatusUid = prop.value;
                            break;
                        default:
                            if (!profileProperty.find(item => item.uid === prop.property.uid)) {
                                profileProperty.push({
                                    uid: prop.property.uid,
                                    propertyCode: prop.property.propertyCode,
                                    value: this.commonService.setPropertyDataValue(prop.property, prop.value)
                                });
                            }
                            else {
                                profileProperty.find(item => item.uid === prop.property.uid)!.value = this.commonService.setPropertyDataValue(prop.property, prop.value);
                            }
                            updateContact.contactProperties = profileProperty;
                    }
                    profilePropertyCheckUnique.push({
                        uid: prop.property.uid,
                        propertyCode: prop.property.propertyCode,
                        value: this.commonService.setPropertyDataValue(prop.property, prop.value)
                    });
                    updatePropertyList.push(prop.property);
                });

                this.commonService.checkPropertyUnique(module, updatePropertyList, profilePropertyCheckUnique).then(isValid => {
                    if (isValid) {
                        this.commonService.updateContact([updateContact]).subscribe(res => {
                            if (res.isSuccess) {
                                this.propUpdateList = [];
                                this.toastService.clear('propertyUpdate');
                                this.toastService.addSingle({
                                    message: 'MESSAGE.UPDATED_SUCCESSFULLY',
                                });
                                this.showFormUpdateSidebar = false;
                            }
                            else {
                                this.toastService.addSingle({
                                    message: res.responseMessage,
                                    severity: 'error'
                                });
                            }
                        });
                    }
                });
            }
            else {
                let updateCompany: UpdateCompanyDto = new UpdateCompanyDto();
                let profileProperty: PropertyDataDto[] = companyProfile.companyProperties;
                let profilePropertyCheckUnique: PropertyDataDto[] = [];
                let updatePropertyList: PropertiesDto[] = [];

                updateCompany.uid = companyProfile.uid;

                this.propUpdateList.forEach(prop => {
                    switch (prop.property.propertyCode) {
                        case 'company_name':
                            updateCompany.companyName = prop.value;
                            break;
                        case 'company_website_url':
                            updateCompany.companyWebsite = prop.value;
                            break;
                        case 'company_email':
                            updateCompany.companyEmail = prop.value;
                            break;
                        case 'company_owner':
                            updateCompany.companyOwnerUid = prop.value;
                            break;
                        case 'lead_status':
                            updateCompany.companyLeadStatusId = prop.value;
                            break;
                        default:
                            if (!profileProperty.find(item => item.uid === prop.property.uid)) {
                                profileProperty.push({
                                    uid: prop.property.uid,
                                    propertyCode: prop.property.propertyCode,
                                    value: this.commonService.setPropertyDataValue(prop.property, prop.value)
                                });
                            }
                            else {
                                profileProperty.find(item => item.uid === prop.property.uid)!.value = this.commonService.setPropertyDataValue(prop.property, prop.value);
                            }
                            updateCompany.companyProperties = profileProperty;
                    }

                    profilePropertyCheckUnique.push({
                        uid: prop.property.uid,
                        propertyCode: prop.property.propertyCode,
                        value: this.commonService.setPropertyDataValue(prop.property, prop.value)
                    });
                    updatePropertyList.push(prop.property);
                });

                this.commonService.checkPropertyUnique(module, updatePropertyList, profilePropertyCheckUnique).then(isValid => {
                    this.commonService.updateCompany([updateCompany]).subscribe(res => {
                        if (res.isSuccess) {
                            this.propUpdateList = [];
                            this.toastService.clear('propertyUpdate');
                            this.toastService.addSingle({
                                message: 'MESSAGE.UPDATED_SUCCESSFULLY',
                            });
                            this.showFormUpdateSidebar = false;
                        }
                        else {
                            this.toastService.addSingle({
                                message: res.responseMessage,
                                severity: 'error'
                            });
                        }
                    });
                });
            }
        }
        else {
            this.toastService.addSingle({
                message: this.translateService.instant('MESSAGE.PERMISSION_DENIED'),
                severity: 'error'
            });
        }
    }
}