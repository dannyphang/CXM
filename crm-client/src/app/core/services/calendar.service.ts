import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CoreHttpService } from "./core-http.service";

@Injectable({ providedIn: 'root' })
export class CalendarService {
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
