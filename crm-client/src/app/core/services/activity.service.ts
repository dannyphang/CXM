import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import apiConfig from "../../../environments/apiConfig";
import { AssociationDto, AttachmentDto, CompanyDto, ContactDto, ModuleDto } from "./common.service";
import { DateFilterFn } from "@angular/material/datepicker";
import { producerAccessed } from "@angular/core/primitives/signals";
import { BasedDto, CoreHttpService, ResponseModel } from "./core-http.service";

@Injectable({ providedIn: 'root' })
export class ActivityService {
    constructor(
        private http: HttpClient,
        private coreService: CoreHttpService
    ) {
    }

    getAllActivityModule(): Observable<ResponseModel<ActivitiesModuleListDto>> {
        return this.coreService.get<ActivitiesModuleListDto>('activity/activityModule').pipe();
    }

    getAllActivities(): Observable<ResponseModel<ActivityDto[]>> {
        return this.coreService.get<ActivityDto[]>('activity').pipe();
    }

    getAllActivitiesByProfileId(profileUid: string): Observable<ResponseModel<ActivityDto[]>> {
        return this.coreService.post<ActivityDto[]>('activity/getActivitiesByProfileId', { profileUid }).pipe();
    }

    getActivityById(id: string): Observable<ResponseModel<ActivityDto>> {
        return this.coreService.get<ActivityDto>('activity/' + id).pipe();
    }

    createActivity(createdActivitiesList: CreateActivityDto[]): Observable<ResponseModel<ActivityDto[]>> {
        return this.coreService.post<ActivityDto[]>('activity', { createdActivitiesList }).pipe();
    }

    uploadAttachment(attachmentList: AttachmentDto[]): Observable<ResponseModel<AttachmentDto[]>> {
        return this.coreService.post<AttachmentDto[]>('activity/upload', { attachmentList }).pipe();
    }

    updateActivity(updateActivity: UpdateActivityDto): Observable<ResponseModel<ActivityDto>> {
        return this.coreService.put<ActivityDto>('activity/' + updateActivity.uid, { updateActivity }).pipe();
    }

    sendEmail(data: SendEmailDto, activityModule: ModuleDto): Observable<ResponseModel<any>> {
        return this.coreService.post<any>('activity/email', { data, activityModule }).pipe();
    }
}

export class ActivityModuleDto extends ModuleDto {
    subActivityControl: ModuleDto[];
}

export class ActivitiesModuleListDto {
    activityControlList: ActivityModuleDto[];
    activityModuleList: ModuleDto[];
    subActivityModuleList: ModuleDto[];
}

export class ActivityDto extends BasedDto {
    uid: string;
    activityContactedIdList: string[];
    activityDatetime: Date;
    activityOutcomeId: string;
    activityDirectionId: string;
    activityDuration: string;
    activityContent: string;
    activityModuleId: string;
    activityModuleCode: string;
    activityModuleSubCode: string;
    isPinned: boolean;
    isExpand: boolean;
    associationContactUidList: string[];
    associationCompanyUidList: string[];
    attachmentUid: string[];
    attachmentList: AttachmentDto[];
    association: AssociationDto;
}

export class UpdateActivityDto extends BasedDto {
    uid: string;
    activityContactedIdList?: string[];
    activityDatetime?: Date;
    activityOutcomeId?: string;
    activityDirectionId?: string;
    activityDuration?: string;
    activityContent?: string;
    activityModuleId?: string;
    activityModuleCode?: string;
    isPinned?: boolean;
    associationContactUidList?: string[];
    associationCompanyUidList?: string[];
    attachmentUid?: string[];
    attachmentList?: AttachmentDto[];
}

export class CreateActivityDto extends BasedDto {
    uid?: string;
    activityModuleCode: string;
    activityModuleSubCode: string;
    activityModuleId: string;
    activityContactedIdList?: string[];
    activityDatetime?: Date;
    activityOutcomeId?: string;
    activityDirectionId?: string;
    activityDuration?: string;
    activityContent: string;
    associationContactUidList: string[];
    associationCompanyUidList: string[];
    attachmentUid?: string[];
    isPinned?: boolean;
}

export class SendEmailDto extends BasedDto {
    toEmailUid: string[];
    toEmail: string[];
    fromEmail: string;
    toName?: string[];
    fromName?: string;
    subject: string;
    content: string;
    emailDateTime: Date;
}