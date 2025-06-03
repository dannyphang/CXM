import { Component, NgZone } from '@angular/core';
import { CalendarEventDto, CalendarService } from '../../../services/calendar.service';
import { CoreAuthService } from '../../../services/core-auth.service';
import { Subscription } from 'rxjs';
import { Calendar, CalendarOptions, EventInput, EventSourceInput } from '@fullcalendar/core'; // useful for typechecking
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent {
  fcCalendar: Calendar;
  selectedDate: Date = new Date();
  calendarEvent: EventInput[] = [];
  private eventSub: Subscription;
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [interactionPlugin, dayGridPlugin],
    dateClick: (arg) => this.handleDateClick(arg),
    eventClick: (arg) => this.handleEventClick(arg),
    eventDrop: (arg) => this.handleEventDrop(arg),
    eventResize: (arg) => this.handleEventDrop(arg),
    headerToolbar: {
      start: '',
      center: '',
      end: '',
    },
    fixedWeekCount: false,
  };
  eventsPromise: Promise<EventInput[]>;
  showDialog: boolean = false;
  showEventDialog: boolean = false;
  selectedEventFormGroup: FormGroup = new FormGroup({
    id: new FormControl<string>(''),
    start: new FormControl<Date>(new Date()),
    end: new FormControl<Date>(new Date()),
    subject: new FormControl<string>(''),
    description: new FormControl<string>(''),
    location: new FormControl<string>(''),
    isAllDay: new FormControl<boolean>(true),
    isRecurring: new FormControl<boolean>(false),
  });
  editSubject: boolean = false;
  editDesc: boolean = false;

  constructor(
    private calendarService: CalendarService,
    private coreAuthService: CoreAuthService,
  ) {
  }

  ngOnInit() {
    this.calendarService.event$.subscribe((eventSetting) => {
      if (eventSetting.length > 0) {
        this.calendarEvent = eventSetting.map((event: CalendarEventDto) => {
          return {
            id: event.id,
            title: event.subject,
            allDay: event.isAllDay,
            start: event.startTime,
            end: event.endTime,
            extendedProps: {
              description: event.description,
              location: event.location,
            },
            editable: false,
          } as EventInput;
        });

        this.fcCalendar = new Calendar(document.getElementById('calendar') as HTMLElement, {
          ...this.calendarOptions,
          events: this.calendarEvent,
        });
        this.fcCalendar.render();
      }
    });
  }

  ngOnDestroy() {
    if (this.eventSub) {
      this.eventSub.unsubscribe(); // prevent memory leaks
    }
  }

  checkAccessable(id: string): boolean {
    return this.calendarEvent.find(event => event.id === id).editable ?? false;
  }

  handleDateClick(arg: any) {
    this.selectedDate = new Date(arg.date);
    this.selectedEventFormGroup.reset();
    this.selectedEventFormGroup.patchValue({
      id: '',
      start: arg.date,
      end: arg.date,
      subject: '',
      description: '',
      location: '',
      isAllDay: ['true'],
      isRecurring: false,
    });
    this.editDesc = true;
    this.showEventDialog = true;
  }

  handleEventClick(arg: any) {
    if (!this.checkAccessable(arg.event.id)) {
      return;
    }

    this.selectedEventFormGroup.reset();

    this.selectedEventFormGroup.patchValue({
      id: arg.event.id,
      start: arg.event.start,
      end: arg.event.allDay ? this.subtractOneDay(arg.event.end) : arg.event.end,
      subject: arg.event.title,
      description: arg.event.extendedProps.description || '',
      location: arg.event.extendedProps.location || '',
      isAllDay: arg.event.allDay ? ['true'] : [],
      isRecurring: false,
    });

    this.showEventDialog = true;
  }

  handleEventDrop(arg: any) {
    if (!this.checkAccessable(arg.event.id)) {
      return;
    }
    this.selectedEventFormGroup.patchValue({
      id: arg.event.id,
      start: arg.event.start,
      end: arg.event.allDay ? this.subtractOneDay(arg.event.end) : arg.event.end,
      subject: arg.event.title,
      description: arg.event.extendedProps.description || '',
      location: arg.event.extendedProps.location || '',
      isAllDay: arg.event.allDay ? ['true'] : [],
      isRecurring: false,
    });

    this.save()
  }

  subtractOneDay(date: Date): Date {
    const result = new Date(date);
    result.setDate(result.getDate() - 1);
    return result;
  }

  returnFormControl(name: string): FormControl {
    return this.selectedEventFormGroup.get(name) as FormControl;
  }

  sanitizeDescription(raw: string): string {
    if (!raw) return '';
    return raw
      .replace(/\n/g, '<br>')
      .replace(/\t/g, '&emsp;')
      .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank">$1</a>');
  }

  blurContent() {
    console.log('Blurred content');
    this.editDesc = false;
  }

  cancel() {
    this.showEventDialog = false;
    this.selectedEventFormGroup.reset();
    this.editSubject = false;
    this.editDesc = false;
  }

  save() {
    if (this.selectedEventFormGroup.valid) {
      const eventData: CalendarEventDto = {
        id: this.selectedEventFormGroup.value.id,
        subject: this.selectedEventFormGroup.value.subject,
        description: this.selectedEventFormGroup.value.description,
        location: this.selectedEventFormGroup.value.location,
        startTime: this.selectedEventFormGroup.value.start,
        endTime: this.selectedEventFormGroup.value.end,
        isAllDay: this.selectedEventFormGroup.value.isAllDay[0] ?? false,
      };
      console.log('Saving Event:', eventData);

      this.showDialog = false;
      this.showEventDialog = false;
    }
  }

  next() {
    if (this.fcCalendar) {
      this.fcCalendar.next();
    }
  }

  prev() {
    if (this.fcCalendar) {
      this.fcCalendar.prev();
    }
  }

  today() {
    if (this.fcCalendar) {
      this.fcCalendar.today();
      this.selectedDate = new Date();
    }
  }

  addEvent() {
    if (this.selectedEventFormGroup.valid) {
      const eventData: CalendarEventDto = {
        id: this.selectedEventFormGroup.value.id,
        subject: this.selectedEventFormGroup.value.subject,
        description: this.selectedEventFormGroup.value.description,
        location: this.selectedEventFormGroup.value.location,
        startTime: this.selectedEventFormGroup.value.start,
        endTime: this.selectedEventFormGroup.value.end,
        isAllDay: this.selectedEventFormGroup.value.isAllDay[0] ?? false,
      };
      console.log('Saving Event:', eventData);

      this.fcCalendar.addEvent({
        id: eventData.id,
        title: eventData.subject,
        start: eventData.startTime,
        end: eventData.endTime,
        allDay: eventData.isAllDay,
        extendedProps: {
          description: eventData.description,
          location: eventData.location,
        },
        editable: true, // Allow editing of the newly added event
      } as EventInput)

      this.showDialog = false;
      this.showEventDialog = false;
    }
  }
}
