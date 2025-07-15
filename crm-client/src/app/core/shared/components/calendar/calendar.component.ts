import { ChangeDetectorRef, Component, EventEmitter, Input, NgZone, Output, SimpleChanges } from '@angular/core';
import { CalendarEventDto, CalendarService } from '../../../services/calendar.service';
import { CoreAuthService } from '../../../services/core-auth.service';
import { Subscription } from 'rxjs';
import { Calendar, CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent {
  @Input() newEvent: {
    startTime: Date;
    endTime: Date;
    subject?: string;
  };
  @Output() formEmit: EventEmitter<any> = new EventEmitter<any>();
  fcCalendar: Calendar;
  calendarEvent: EventInput[] = [];
  private eventSub: Subscription;
  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek',
    plugins: [timeGridPlugin, interactionPlugin],
    dateClick: (arg) => this.handleDateClick(arg),
    eventClick: (arg) => this.handleEventClick(arg),
    eventDrop: (arg) => this.handleEventDrop(arg),
    eventResize: (arg) => this.handleEventDrop(arg),
    select: (arg) => this.handleSelect(arg),
    fixedWeekCount: false,
    nowIndicator: true,
    slotLaneDidMount: (arg) => this.addHoverListeners(arg),
    allDayClassNames: ['fc-all-day-div'],
    allDayText: '',
    selectable: true,
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
    private translateService: TranslateService,
    private toastService: ToastService,
    private cd: ChangeDetectorRef,
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
            editable: false,
            backgroundColor: event.endTime < new Date() ? 'var(--text-color-secondary)' : 'var(--primary-400)',
          } as EventInput;
        });
        // calendar.setOption('height', 700);
      }
      this.fcCalendar = new Calendar(document.getElementById('calendar') as HTMLElement, {
        ...this.calendarOptions,
        events: this.calendarEvent,
      });

      this.fcCalendar.render();
      setTimeout(() => {
        this.fcCalendar.today();
      }, 300);
    });
  }

  ngOnDestroy() {
    if (this.eventSub) {
      this.eventSub.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['newEvent'] && changes['newEvent'].currentValue) {
      this.cd.detectChanges();
      this.insertOnlyOneNewEvent();
    }
  }

  insertOnlyOneNewEvent() {
    this.fcCalendar?.getEventById('new-event')?.remove();
    this.fcCalendar?.addEvent({
      id: 'new-event',
      start: this.newEvent.startTime,
      end: this.newEvent.endTime,
      title: this.newEvent.subject || '',
      backgroundColor: 'var(--surface-300)',
      textColor: 'var(--text-color)',
      editable: true,
    });
  }

  checkAccessable(id: string): boolean {
    return this.calendarEvent.find(event => event.id === id)?.editable ?? false;
  }

  handleDateClick(arg: any) {
    if (new Date(arg.date) < new Date()) {
      return;
    }
    else {
      const start = new Date(arg.date);
      const end = new Date(start);
      end.setMinutes(start.getMinutes() + 30);

      this.selectedEventFormGroup.reset({ emitEvent: false });
      this.selectedEventFormGroup.patchValue({
        id: '',
        start,
        end,
        subject: '',
        description: '',
        location: '',
        isAllDay: [],
        isRecurring: false,
      });

      this.formEmit.emit({
        startTime: start,
        endTime: end,
      });
    }
  }

  handleEventClick(arg: any) {
    if (!this.checkAccessable(arg.event.id)) return;

    this.selectedEventFormGroup.reset({ emitEvent: false });
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
    // if (!this.checkAccessable(arg.event.id)) return;

    // this.selectedEventFormGroup.patchValue({
    //   id: arg.event.id,
    //   start: arg.event.start,
    //   end: arg.event.allDay ? this.subtractOneDay(arg.event.end) : arg.event.end,
    //   subject: arg.event.title,
    //   description: arg.event.extendedProps.description || '',
    //   location: arg.event.extendedProps.location || '',
    //   isAllDay: arg.event.allDay ? ['true'] : [],
    //   isRecurring: false,
    // });

    // this.save();

    if (arg.event.start < new Date()) {
      this.toastService.addSingle({
        message: 'ERROR.ONLY_CAN_SELECT_FUTURE_DATE',
        severity: 'error',
      })
      this.insertOnlyOneNewEvent();
    }
    else {
      const start = new Date(arg.event.start);
      const end = new Date(arg.event.end);

      this.newEvent = {
        startTime: start,
        endTime: end,
      }
      this.insertOnlyOneNewEvent();

      this.formEmit.emit({
        startTime: start,
        endTime: end,
      });
    }
  }

  handleSelect(arg: any) {
    if (arg.start < new Date()) {
      this.toastService.addSingle({
        message: 'ERROR.ONLY_CAN_SELECT_FUTURE_DATE',
        severity: 'error',
      });
      this.fcCalendar.unselect();
      this.insertOnlyOneNewEvent();
      return;
    }

    const start = new Date(arg.start);
    const end = new Date(arg.end);

    this.newEvent = {
      startTime: start,
      endTime: end,
    }
    this.insertOnlyOneNewEvent();

    this.formEmit.emit({
      startTime: start,
      endTime: end,
    });
  }

  addHoverListeners(arg: any) {
    const rowEl = arg.el;
    let currentHoverBox: HTMLElement | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      const colContainer = document.querySelector('.fc-timegrid-cols');
      if (!colContainer) return;

      const columns = colContainer.querySelectorAll<HTMLElement>('.fc-timegrid-col');
      let targetCol: HTMLElement | null = null;

      columns.forEach((col) => {
        const rect = col.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right) {
          targetCol = col;
        }
      });

      if (!targetCol) return;

      // Determine the column index from FullCalendar's data-date attribute
      const dateAttr = targetCol.getAttribute('data-date');
      const colDate = dateAttr ? new Date(dateAttr) : null;
      if (!colDate || isNaN(colDate.getTime())) return;

      // Use the column's date combined with the row time
      const baseTime = new Date(arg.date);
      colDate.setHours(baseTime.getHours(), baseTime.getMinutes(), 0, 0);

      const hoverDate = new Date(colDate);
      const timeString = hoverDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      const isFuture = hoverDate > new Date();

      if (currentHoverBox?.parentElement === targetCol) return;

      if (currentHoverBox && currentHoverBox.parentElement) {
        currentHoverBox.parentElement.removeChild(currentHoverBox);
        currentHoverBox = null;
      }

      const hoverBox = document.createElement('div');
      hoverBox.className = 'hover-box';
      hoverBox.innerText = isFuture
        ? ""
        : this.translateService.instant('BUTTON.UNAVAILABLE');

      hoverBox.style.position = 'absolute';
      hoverBox.style.top = rowEl.offsetTop + 'px';
      hoverBox.style.left = '0';
      hoverBox.style.width = 'calc(100% - 4px)';
      hoverBox.style.height = rowEl.offsetHeight - 4 + 'px';
      hoverBox.style.color = isFuture ? 'var(--primary-color)' : 'var(--primary-color-text)';
      hoverBox.style.backgroundColor = isFuture ? 'var(--primary-50)' : 'var(--text-color-secondary)';
      hoverBox.style.border = isFuture ? '1px solid var(--primary-color)' : 'var(--text-color)';
      hoverBox.style.borderRadius = '3px';
      hoverBox.style.pointerEvents = 'none';
      hoverBox.style.display = 'flex';
      hoverBox.style.justifyContent = 'center';
      hoverBox.style.alignItems = 'center';
      hoverBox.style.zIndex = '5';
      hoverBox.style.margin = '2px';
      hoverBox.style.cursor = isFuture ? 'pointer' : 'not-allowed';
      hoverBox.onclick = (e) => e.preventDefault();

      targetCol.style.position = 'relative';
      targetCol.appendChild(hoverBox);
      currentHoverBox = hoverBox;
    };

    const handleMouseLeave = () => {
      if (currentHoverBox && currentHoverBox.parentElement) {
        currentHoverBox.parentElement.removeChild(currentHoverBox);
        currentHoverBox = null;
      }
    };

    rowEl.addEventListener('mousemove', handleMouseMove);
    rowEl.addEventListener('mouseleave', handleMouseLeave);
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
    this.selectedEventFormGroup.reset({ emitEvent: false });
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

  refreshCalendar() {
    this.toastService.addSingle({
      key: 'calendar',
      message: this.translateService.instant('COMMON.LOADING', {
        module: this.translateService.instant('COMMON.CALENDAR'),
      }),
      severity: 'info',
      isLoading: true,
    });
    this.calendarService.getCalendarEvent(this.coreAuthService.userC.setting?.calendarEmail, this.coreAuthService.userC.setting?.calendarId).then(() => {
      this.toastService.clear('calendar');
    });
  }

  next() {
    if (this.fcCalendar) this.fcCalendar.next();
  }

  prev() {
    if (this.fcCalendar && this.fcCalendar.getDate() > new Date()) this.fcCalendar.prev();
  }

  today() {
    if (this.fcCalendar) this.fcCalendar.today();
  }

  returnDateNow(): Date {
    return new Date();
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
