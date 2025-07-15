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

    fetchCalendar(calendarEmail: string, calendarId?: string) {
        return this.coreService.get<any>('calendar/fetch', { headers: { calendarEmail: calendarEmail, calendarId: calendarId } }).pipe();
    }

    fetchCalendarList(calendarEmail: string) {
        return this.coreService.get<any>('calendar/list', { headers: { calendarEmail: calendarEmail } }).pipe();
    }

    getCalendarEvent(calendarEmail: string, calendarId?: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.fetchCalendar(calendarEmail, calendarId).subscribe({
                    next: calendar => {
                        let events: CalendarEventDto[] = calendar.data.map(event => ({
                            id: event.id,
                            subject: event.summary,
                            isAllDay: event.start.dateTime ? false : true,
                            startTime: new Date(event.start.dateTime || event.start.date),
                            endTime: new Date(event.end.dateTime || event.end.date),
                            location: event.location || '',
                            description: event.description || '',
                            recurrenceRule: event.recurrence ? event.recurrence.rule : '',
                            recurrenceID: event.recurrence ? event.recurrence.id : null,
                            iCalUid: event.iCalUid || '',
                        }));
                        this.calendarSettingEvents = events;
                        resolve();
                    },
                    error: error => {
                        console.error('Error fetching Calendar:', error);
                    }
                });
            }
            catch (error) {
                console.error('Error in fetchCalendar:', error);
                reject();
            }
        })
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