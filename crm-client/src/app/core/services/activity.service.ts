import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AssociationDto, AttachmentDto, ModuleDto } from "./common.service";
import { CoreHttpService, ResponseModel } from "./core-http.service";
import { BasedDto } from "./core-auth.service";

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
        return this.coreService.get<ActivityDto>('activity' + id).pipe();
    }

    createActivity(createdActivitiesList: CreateActivityDto[]): Observable<ResponseModel<ActivityDto[]>> {
        return this.coreService.post<ActivityDto[]>('activity', { createdActivitiesList }).pipe();
    }

    uploadAttachment(attachmentList: AttachmentDto[]): Observable<ResponseModel<AttachmentDto[]>> {
        return this.coreService.post<AttachmentDto[]>('attachment/upload', { attachmentList }).pipe();
    }

    updateActivity(updateActivityList: UpdateActivityDto[]): Observable<ResponseModel<ActivityDto>> {
        return this.coreService.put<ActivityDto>('activity', { updateActivityList }).pipe();
    }

    sendEmail(data: EmailDto, createActivity: CreateActivityDto): Observable<ResponseModel<any>> {
        return this.coreService.post<any>('activity/email', { data, createActivity }).pipe();
    }

    getAttachments(module: 'CONT' | 'COMP', id: string): Observable<ResponseModel<AttachmentDto[]>> {
        let headers = {
            module: module,
            profileUid: id
        }
        return this.coreService.get<AttachmentDto[]>('attachment', { headers: headers }).pipe();
    }

    removeAttachments(attachmentList: AttachmentDto[]): Observable<ResponseModel<AttachmentDto[]>> {
        return this.coreService.put<AttachmentDto[]>('attachment/remove', { attachmentList: attachmentList }).pipe();
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
    activityContentLength: number;
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
    activityType: ActivityTypeDto;
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
    activityContentLength: number;
    associationContactUidList: string[];
    associationCompanyUidList: string[];
    attachmentUid?: string[];
    isPinned?: boolean;
    activityType?: ActivityTypeDto;
}

export class EmailDto extends BasedDto {
    toEmailUid: string[];
    toEmail: string[];
    fromEmail: string;
    toName?: string[];
    fromName?: string;
    subject: string;
    content: string;
    emailDateTime: Date;
    contactAssoList?: string[];
    companyAssoList?: string[];
    textLength: number;
}

export class MeetingDto extends BasedDto {
    subject: string;
    start: Date;
    end: Date;
    location?: string;
    internalNotes?: string;
    reminder?: number;
    reminderType?: number; // 1: Minutes, 2: Hours, 3: Days, 4: Weeks
}

export class ActivityTypeDto {
    email?: EmailDto;
    meeting?: MeetingDto;
}