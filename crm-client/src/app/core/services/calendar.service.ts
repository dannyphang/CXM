import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CoreHttpService } from "./core-http.service";
import { BehaviorSubject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class CalendarService {
    calendarEvents: CalendarEventDto = new CalendarEventDto();
    private eventSubject = new BehaviorSubject<CalendarEventDto[]>({} as CalendarEventDto[]);
    public event$ = this.eventSubject.asObservable();

    set calendarSettingEvents(event: CalendarEventDto[]) {
        this.eventSubject.next(event);
    }

    get calendarSettingEvents(): CalendarEventDto[] {
        return this.eventSubject.value;
    }

    constructor(
        private http: HttpClient,
        private coreService: CoreHttpService
    ) {
    }

    callCalendarApi() {
        return this.coreService.get<any>('calendar').pipe();
    }

    getCalendarEvents() {
        return this.coreService.get<any>('calendar/events').pipe();
    }

    fetchCalendar(calendarEmail: string) {
        return this.coreService.get<any>('calendar/fetch', { headers: { calendarEmail: calendarEmail } }).pipe();
    }

}

export class CalendarEventDto {
    id: string;
    subject: string;
    description: string;
    location: string;
    startTime: Date;
    endTime: Date;
    isAllDay: boolean;
    recurrenceRule?: string;
    recurrenceID?: string | null;
    iCalUid?: string;
    eventType?: string;
    organizer?: {
        email: string;
        self: boolean;
    };
    visibility?: string;
}