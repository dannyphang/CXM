import { Component } from '@angular/core';
import { CalendarService } from '../../../services/calendar.service';
import { CoreAuthService } from '../../../services/core-auth.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent {
  constructor(
    private calendarService: CalendarService,
    private coreAuthService: CoreAuthService
  ) {
  }

  ngOnInit() {
    // this.calendarService.callCalendarApi().subscribe({
    //   next: response => {
    //     window.location.href = response.data;
    //     this.calendarService.fetchCalendar().subscribe(calendar => {
    //       console.log('Fetched Calendar:', calendar);
    //     });
    //   },
    //   error: error => {
    //     console.error('Error calling Calendar API:', error);
    //   }
    // });
  }

  fetchCalendar() {
    this.calendarService.fetchCalendar(this.coreAuthService.userC.setting?.calendarEmail).subscribe({
      next: calendar => {
        console.log('Fetched Calendar:', calendar);
      },
      error: error => {
        console.error('Error fetching Calendar:', error);
      }
    });
  }

  connectCalendar() {
    this.calendarService.callCalendarApi().subscribe({
      next: response => {
        window.location.href = response.data;
      },
    });
  }
}
