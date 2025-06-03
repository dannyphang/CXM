import { Component, NgZone } from '@angular/core';
import { CalendarEventDto, CalendarService } from '../../../services/calendar.service';
import { CoreAuthService } from '../../../services/core-auth.service';
import { Subscription } from 'rxjs';
import { Calendar, CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent {
  fcCalendar: Calendar;
  calendarEvent: EventInput[] = [];
  private eventSub: Subscription;
  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek',
    plugins: [interactionPlugin, timeGridPlugin],
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
    nowIndicator: true,
    slotLaneDidMount: (arg) => this.addHoverListeners(arg),
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
    isAllDay: new FormControl<boolean>(false),
    isRecurring: new FormControl<boolean>(false),
  });
  editSubject: boolean = false;
  editDesc: boolean = false;

  constructor(
    private calendarService: CalendarService,
    private coreAuthService: CoreAuthService,
  ) { }

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
            editable: true,
          } as EventInput;
        });

        this.fcCalendar = new Calendar(document.getElementById('calendar') as HTMLElement, {
          ...this.calendarOptions,
          events: this.calendarEvent,
          slotLabelContent: (arg) => {
            // Optional: Customize time labels
            return arg.text;
          },
          slotLaneContent: (arg) => {
            // This runs per time row per date
            setTimeout(() => this.addCustomHoverEffect(arg), 0);
          },
        });

        this.fcCalendar.render();
      }
    });
  }

  ngOnDestroy() {
    if (this.eventSub) {
      this.eventSub.unsubscribe();
    }
  }

  checkAccessable(id: string): boolean {
    return this.calendarEvent.find(event => event.id === id)?.editable ?? false;
  }

  handleDateClick(arg: any) {
    const start = new Date(arg.date);
    const end = new Date(start);
    end.setMinutes(start.getMinutes() + 60);

    this.selectedEventFormGroup.reset();
    this.selectedEventFormGroup.patchValue({
      id: '',
      start,
      end,
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
    if (!this.checkAccessable(arg.event.id)) return;

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
    if (!this.checkAccessable(arg.event.id)) return;

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

    this.save();
  }

  addHoverListeners(arg: any) {
    const cellEl = arg.el;

    const time = cellEl.getAttribute('data-time');
    const dateCell = cellEl.closest('[data-date]');
    const date = dateCell?.getAttribute('data-date');

    cellEl.addEventListener('mouseenter', () => {
      const hoverBox = document.createElement('div');
      hoverBox.className = 'fc-hover-box';
      hoverBox.innerText = '📅 2:45 – 3:15 PM';
      hoverBox.style.position = 'absolute';
      hoverBox.style.left = '0';
      hoverBox.style.width = '100%';
      hoverBox.style.height = '100%';
      hoverBox.style.backgroundColor = 'rgba(0, 123, 255, 0.15)';
      hoverBox.style.border = '1px dashed #007bff';
      hoverBox.style.pointerEvents = 'none';
      hoverBox.style.display = 'flex';
      hoverBox.style.justifyContent = 'center';
      hoverBox.style.alignItems = 'center';
      hoverBox.style.zIndex = '10';

      cellEl.style.position = 'relative';
      hoverBox.classList.add('hover-box');
      cellEl.appendChild(hoverBox);
    });

    cellEl.addEventListener('mouseleave', () => {
      const existing = cellEl.querySelector('.hover-box');
      if (existing) existing.remove();
    });
  }

  addCustomHoverEffect(arg: any) {
    const cellEl = arg.el;
    const dateAttr = cellEl.getAttribute('data-date'); // ISO Date string
    const timeAttr = cellEl.getAttribute('data-time'); // e.g., "14:30:00"

    if (!dateAttr || !timeAttr) return;

    const matchDate = '2025-05-30'; // Your target date
    const matchTime = '14:45:00';   // Your target time (2:45 PM)

    // Only target specific time+date
    if (dateAttr === matchDate && timeAttr === matchTime) {
      const hoverBox = document.createElement('div');
      hoverBox.className = 'fc-hover-box';
      hoverBox.innerText = '2:45 – 3:15 PM';

      cellEl.addEventListener('mouseenter', () => {
        cellEl.appendChild(hoverBox);
      });

      cellEl.addEventListener('mouseleave', () => {
        if (cellEl.contains(hoverBox)) {
          cellEl.removeChild(hoverBox);
        }
      });
    }
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
    if (this.fcCalendar) this.fcCalendar.next();
  }

  prev() {
    if (this.fcCalendar) this.fcCalendar.prev();
  }

  today() {
    if (this.fcCalendar) this.fcCalendar.today();
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
        editable: true,
      } as EventInput);

      this.showDialog = false;
      this.showEventDialog = false;
    }
  }
}
