import {
  Component,
  Input,
  OnChanges,
  OnInit,
  ViewEncapsulation,
  SimpleChanges,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { BaseFieldControlComponent } from '../base-field-control/base-field-control';

// to disable warnings then we have a config in angular.json allowedCommonJsDependencies
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

import { CalendarTypeView } from 'primeng/calendar';
import { combineLatest, startWith, Subject, takeUntil } from 'rxjs';
import { DEFAULT_FORMAT_DATE } from '../../constants/common.constants';

@Component({
  selector: 'app-base-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BaseDatepickerComponent
  extends BaseFieldControlComponent
  implements OnInit, OnChanges {
  @Input() dateFormat!: string;
  @Input() mode: 'range' | 'single' | 'range_2' = 'single';
  @Input() override placeholder: string = DEFAULT_FORMAT_DATE;
  @Input() minDate!: Date;
  @Input() maxDate!: Date;
  @Input() view?: CalendarTypeView = 'date';
  @Input() showTime: boolean = false;
  @Input() showSeconds: boolean = false;
  @Input() timeOnly: boolean = false;

  // teardown
  private destroy$ = new Subject<void>();

  // inner controls (used in range_2)
  date_from = new FormControl<Date | null>(null, { updateOn: 'blur' });
  date_to = new FormControl<Date | null>(null, { updateOn: 'blur' });

  dateToErrorMessage = '';

  // guards
  private initializing = true; // squelch init-time programmatic writes
  private syncing = false;     // prevent feedback loops when mirroring

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.initializing = true;

    if (this.mode === 'range_2') {
      // watch disabled status of parent
      this.fieldControl.statusChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe((status) => {
          if (status === 'DISABLED') this.setDisabledRange(true);
        });

      // init validators for inner controls
      this.date_from.addValidators(this.invalidDateFormat(this.dateFormat));
      this.date_to.addValidators(this.invalidDateFormat(this.dateFormat));

      if (this.required || this.fieldControl.hasValidator(Validators.required)) {
        this.date_from.addValidators(Validators.required);
        this.date_to.addValidators(Validators.required);
      }

      this.date_from.updateValueAndValidity({ emitEvent: false });
      this.date_to.updateValueAndValidity({ emitEvent: false });

      // bootstrap inner controls from parent value
      const v = this.fieldControl.value;

      if (
        v === null ||
        v === '' ||
        (Array.isArray(v) && v.every((e) => e === null || e === ''))
      ) {
        this.date_from.reset(null, { emitEvent: false });
        this.date_to.reset(null, { emitEvent: false });
      } else if (Array.isArray(v)) {
        const [a, b] = v;
        const from = a instanceof Date ? a : (a ? new Date(a) : null);
        const to = b instanceof Date ? b : (b ? new Date(b) : null);
        this.date_from.setValue(from, { emitEvent: false });
        this.date_to.setValue(to, { emitEvent: false });
      } else if (typeof v === 'string') {
        // normalize unexpected string to [date, null] without emitting
        const parsed = dayjs(v, this.dateFormat, true);
        const from = parsed.isValid() ? parsed.toDate() : null;
        this.date_from.setValue(from, { emitEvent: false });
        this.date_to.setValue(null, { emitEvent: false });
        this.fieldControl.setValue([from, null], { emitEvent: false });
      } else if (v instanceof Date) {
        this.date_from.setValue(v, { emitEvent: false });
        this.date_to.setValue(null, { emitEvent: false });
        this.fieldControl.setValue([v, null], { emitEvent: false });
      }

      // validate range + mirror inner -> parent
      combineLatest([
        this.date_from.valueChanges.pipe(startWith(this.date_from.value)),
        this.date_to.valueChanges.pipe(startWith(this.date_to.value)),
      ])
        .pipe(takeUntil(this.destroy$))
        .subscribe(([from, to]) => {
          if (this.initializing || this.syncing) return;

          const hasBoth = !!from && !!to;
          const outOfOrder = hasBoth && dayjs(to!).isBefore(dayjs(from!));

          if (outOfOrder) {
            this.setRangeErrors(true);
          } else {
            this.clearRangeErrorsIfAny();
          }

          const next: [Date | null, Date | null] = [from ?? null, to ?? null];
          const prev = this.fieldControl.value as
            | [Date | null, Date | null]
            | null;

          if (!this.sameRange(prev, next)) {
            this.syncing = true;
            // user-originated change: emit to parent
            this.fieldControl.setValue(next, { emitEvent: true });
            this.syncing = false;
          }
        });

      // mirror parent -> inner (programmatic updates)
      this.fieldControl.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe((val) => {
          if (this.initializing || this.syncing) return;

          if (
            val === null ||
            val === '' ||
            (Array.isArray(val) && val.every((e) => e === null || e === ''))
          ) {
            this.date_from.reset(null, { emitEvent: false });
            this.date_to.reset(null, { emitEvent: false });
            return;
          }

          if (Array.isArray(val)) {
            const [a, b] = val;
            const nextFrom = a instanceof Date ? a : (a ? new Date(a) : null);
            const nextTo = b instanceof Date ? b : (b ? new Date(b) : null);

            if (!this.sameDate(this.date_from.value, nextFrom)) {
              this.date_from.setValue(nextFrom, { emitEvent: false });
            }
            if (!this.sameDate(this.date_to.value, nextTo)) {
              this.date_to.setValue(nextTo, { emitEvent: false });
            }
          }
        });

      this.setDisabledRange(!!this.disabled);
    } else {
      // single/range modes: validators live on parent control
      let validators: ValidatorFn[] = [this.invalidDateFormat(this.dateFormat)];
      if (this.required) validators = [Validators.required, ...validators];
      this.fieldControl.addValidators(validators);
      this.fieldControl.updateValueAndValidity({ emitEvent: false });
    }

    // error messages map
    this.errorMessageList = {
      format: 'ERROR.INVALID_FORMAT',
      invalid_range: 'ERROR.INVALID_DATE_RANGE',
      ...this.errorMessageList,
    };

    // respect disabled at start (don’t emit)
    if (this.disabled) {
      this.fieldControl.disable({ emitEvent: false });
    }

    // end of init (next microtask so all programmatic writes settle)
    queueMicrotask(() => (this.initializing = false));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.mode === 'range_2' && changes['disabled']) {
      this.setDisabledRange(changes['disabled'].currentValue);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ----- helpers -----

  setDisabledRange(disabled: boolean) {
    if (disabled) {
      this.date_from.disable({ emitEvent: false });
      this.date_to.disable({ emitEvent: false });
    } else {
      this.date_from.enable({ emitEvent: false });
      this.date_to.enable({ emitEvent: false });
    }
  }

  invalidDateFormat(format: string = DEFAULT_FORMAT_DATE): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const val = control.value;

      if (val === null || val === '') return null;

      if (typeof val === 'string') {
        // strict parsing with format
        return dayjs(val, format, true).isValid() ? null : { format: true };
      }

      if (val instanceof Date) {
        return dayjs(val).isValid() ? null : { format: true };
      }

      if (Array.isArray(val) && val.length === 2) {
        const [a, b] = val;
        const okA =
          a == null ||
          (a instanceof Date ? dayjs(a).isValid() : dayjs(a, format, true).isValid());
        const okB =
          b == null ||
          (b instanceof Date ? dayjs(b).isValid() : dayjs(b, format, true).isValid());
        return okA && okB ? null : { format: true };
      }

      return null;
    };
  }

  private setRangeErrors(on: boolean) {
    if (on) {
      this.date_from.setErrors({
        ...(this.date_from.errors || {}),
        invalid_range: true,
      });
      this.date_to.setErrors({
        ...(this.date_to.errors || {}),
        invalid_range: true,
      });
      this.fieldControl.setErrors({
        ...(this.fieldControl.errors || {}),
        invalid_range: true,
      });
    } else {
      this.clearRangeErrorsIfAny();
    }
  }

  private clearRangeErrorsIfAny() {
    const clearKey = (ctrl: AbstractControl) => {
      const errs = { ...(ctrl.errors || {}) };
      if ('invalid_range' in errs) {
        delete errs['invalid_range'];
        ctrl.setErrors(Object.keys(errs).length ? errs : null);
      }
    };
    clearKey(this.date_from);
    clearKey(this.date_to);
    clearKey(this.fieldControl);
  }

  private sameDate(a?: Date | null, b?: Date | null): boolean {
    if (!!a !== !!b) return false;
    if (!a && !b) return true;
    return a!.getTime() === b!.getTime();
  }

  private sameRange(
    a?: [Date | null, Date | null] | null,
    b?: [Date | null, Date | null] | null
  ): boolean {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return this.sameDate(a[0], b[0]) && this.sameDate(a[1], b[1]);
  }

  // ----- error helpers (UI) -----

  override checkInvalidField(): boolean {
    if (this.mode !== 'range_2') return super.checkInvalidField();
    const invalid =
      (this.date_from?.dirty || this.date_from?.touched) &&
      this.date_from?.invalid;
    if (invalid && !this.disabled) {
      this.errorMessage = !!this.errorMessageList
        ? this.errorMessageList[Object.keys(this.date_from.errors || [])[0]]
        : '';
    }
    return invalid;
  }

  checkInvalidDateToField(): boolean {
    const invalid =
      (this.date_to?.dirty || this.date_to?.touched) && this.date_to?.invalid;
    if (invalid && !this.disabled) {
      const errKeys = Object.keys(this.date_to.errors || []);
      const firstNonRange = errKeys.find((e) => e !== 'invalid_range');
      this.dateToErrorMessage = !!this.errorMessageList
        ? this.errorMessageList[firstNonRange || 'format'] || ''
        : '';
    }
    return invalid;
  }

  customRequiredValidatorRange2 = (control: AbstractControl) => {
    if (!control.value || (!control.value[0] && !control.value[1]))
      return { required: true };
    return null;
  };

  IsArrayLabel(label: any) {
    return Array.isArray(label) && label.length > 1;
  }
}
