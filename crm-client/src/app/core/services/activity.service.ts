import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import apiConfig from "../../../environments/apiConfig";
import { AssociationDto, AttachmentDto, BasedDto, ModuleDto, ResponseModel } from "./common.service";
import { DateFilterFn } from "@angular/material/datepicker";
import { producerAccessed } from "@angular/core/primitives/signals";

@Injectable({ providedIn: 'root' })
export class ActivityService {
    constructor(
        private http: HttpClient
    ) {
    }

    getAllActivityModule(): Observable<ResponseModel<ActivitiesModuleListDto>> {
        return this.http.get<ResponseModel<ActivitiesModuleListDto>>(apiConfig.baseUrl + '/activity/activityModule').pipe();
    }

    getAllActivities(): Observable<ResponseModel<ActivityDto[]>> {
        return this.http.get<ResponseModel<ActivityDto[]>>(apiConfig.baseUrl + '/activity').pipe();
    }

    getAllActivitiesByProfileId(profileUid: string): Observable<ResponseModel<ActivityDto[]>> {
        return this.http.post<ResponseModel<ActivityDto[]>>(apiConfig.baseUrl + '/activity/getActivitiesByProfileId', { profileUid }).pipe();
    }

    getActivityById(id: string): Observable<ResponseModel<ActivityDto>> {
        return this.http.get<ResponseModel<ActivityDto>>(apiConfig.baseUrl + '/activity/' + id).pipe();
    }

    createActivity(createdActivitiesList: CreateActivityDto[]): Observable<ResponseModel<CreateActivityDto[]>> {
        return this.http.post<ResponseModel<CreateActivityDto[]>>(apiConfig.baseUrl + '/activity', { createdActivitiesList }).pipe();
    }

    uploadAttachment(attachmentList: AttachmentDto[]): Observable<ResponseModel<AttachmentDto>> {
        return this.http.post<ResponseModel<AttachmentDto>>(apiConfig.baseUrl + '/activity/upload', { attachmentList }).pipe();
    }

    deleteActivity(activityUid: string): Observable<ResponseModel<ActivityDto>> {
        return this.http.delete<ResponseModel<ActivityDto>>(apiConfig.baseUrl + '/activity/' + activityUid).pipe();
    }

    updateActivity(updateActivity: UpdateActivityDto): Observable<ResponseModel<ActivityDto>> {
        return this.http.put<ResponseModel<ActivityDto>>(apiConfig.baseUrl + '/activity/' + updateActivity.uid, updateActivity).pipe();
    }
}

export class ActivityModuleDto extends ModuleDto {
    subActivityControl: ModuleDto[];
}

export class ActivitiesModuleListDto {
    activityControlList: ActivityModuleDto[];
    activityModuleList: ModuleDto[];
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
    isPinned: boolean;
    isExpand: boolean;
    associationContactUidList: string[];
    associationCompanyUidList: string[];
    attachmentUid: string;
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
    attachmentUid?: string;
    attachmentList?: AttachmentDto[];
}

export class CreateActivityDto extends BasedDto {
    uid?: string;
    activityModuleCode: string;
    activityModuleId: string;
    activityContactedIdList?: string[];
    activityDatetime?: Date;
    activityOutcomeId?: string;
    activityDirectionId?: string;
    activityDuration?: string;
    activityContent: string;
    associationContactUidList: string[];
    associationCompanyUidList: string[];
    attachmentUid?: string;
    isPinned?: boolean;
}