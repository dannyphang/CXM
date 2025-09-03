import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BaseFieldControlComponent } from '../base-field-control/base-field-control';

@Component({
  selector: 'app-input-switch',
  templateUrl: './input-switch.component.html',
  styleUrl: './input-switch.component.scss'
})
export class InputSwitchComponent extends BaseFieldControlComponent {
  @Output() switchUpdate: EventEmitter<any> = new EventEmitter<any>();

  constructor() {
    super();
  }

  inputSwitchOnClick() {
    this.switchUpdate.emit();
  }
}
