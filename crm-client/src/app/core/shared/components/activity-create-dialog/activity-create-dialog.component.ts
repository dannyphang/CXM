import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ContactDto, CompanyDto, ModuleDto } from '../../../services/common.service';

@Component({
  selector: 'app-activity-create-dialog',
  templateUrl: './activity-create-dialog.component.html',
  styleUrl: './activity-create-dialog.component.scss'
})
export class ActivityCreateDialogComponent {
  @Input() contactProfile: ContactDto = new ContactDto();
  @Input() companyProfile: CompanyDto = new CompanyDto();
  @Input() module: "CONT" | "COMP" = "CONT";
  @Input() activityModule: ModuleDto = new ModuleDto();
  @Input() visible: boolean = false;
  @Output() close: EventEmitter<any> = new EventEmitter();
  header: string = '';

  constructor(

  ) {

  }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['activityModule'] && changes['activityModule'].currentValue) {
      this.header = this.activityModule.moduleName;
    }
  }

  closeDialog() {
    this.visible = false;
    this.close.emit();
  }
}
