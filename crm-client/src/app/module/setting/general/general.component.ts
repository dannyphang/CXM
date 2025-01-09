import { Component, Input } from '@angular/core';
import { UserPermissionDto } from '../../../core/services/core-http.service';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrl: './general.component.scss'
})
export class GeneralComponent {
  @Input() permission: UserPermissionDto[] = [];
  @Input() module: string;

}
