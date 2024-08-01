import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import apiConfig from "../../../environments/apiConfig";
import { AttachmentDto, BasedDto, ModuleDto } from "./common.service";
import { DateFilterFn } from "@angular/material/datepicker";
import { producerAccessed } from "@angular/core/primitives/signals";

@Injectable({ providedIn: 'root' })
export class ActivityService {
    constructor(
        private http: HttpClient
    ) {
    }

    getAllActivityModule(): Observable<ActivitiesModuleListDto> {
        return this.http.get<ActivitiesModuleListDto>(apiConfig.baseUrl + '/activity/activityModule').pipe();
    }

    getAllActivities(): Observable<ActivityDto[]> {
        return this.http.get<ActivityDto[]>(apiConfig.baseUrl + '/activity').pipe();
    }

    getAllActivitiesByProfileId(profile: {
        contactId?: string,
        companyId?: string
    }): Observable<ActivityDto> {
        return this.http.post<ActivityDto>(apiConfig.baseUrl + '/activity/getActivitiesByProfileId', { profile }).pipe();
    }

    getActivityById(id: string): Observable<ActivityDto> {
        return this.http.get<ActivityDto>(apiConfig.baseUrl + '/activity/' + id).pipe();
    }

    createActivity(createdActivitiesList: CreateActivityDto[]): Observable<CreateActivityDto[]> {
        return this.http.post<CreateActivityDto[]>(apiConfig.baseUrl + '/activity', { createdActivitiesList }).pipe();
    }

    uploadAttachment(attachmentList: AttachmentDto[]): Observable<AttachmentDto> {
        return this.http.post<AttachmentDto>(apiConfig.baseUrl + '/activity/upload', { attachmentList }).pipe();
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
    associationId: string;
    attachmentUid: string;
    attachmentList: AttachmentDto[];
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
    associationId?: string;
    attachmentUid?: string;
}