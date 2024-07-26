import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-input-switch',
  templateUrl: './input-switch.component.html',
  styleUrl: './input-switch.component.scss'
})
export class InputSwitchComponent {
  @Input() isChecked = false;
  @Input() label: string = '';
  @Output() switchUpdate: EventEmitter<any> = new EventEmitter<any>();

  constructor() {

  }

  inputSwitchOnClick() {
    this.switchUpdate.emit();
  }
}
