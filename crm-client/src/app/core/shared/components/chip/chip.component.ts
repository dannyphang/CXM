import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-chip',
  templateUrl: './chip.component.html',
  styleUrl: './chip.component.scss'
})
export class ChipComponent {
  @Input() label: string = '';
  @Input() removable: boolean = true;
  @Output() remove = new EventEmitter();

  constructor() {
  }

  onRemove() {
    this.remove.emit();
  }
}
