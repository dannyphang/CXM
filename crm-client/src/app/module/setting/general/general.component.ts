import { Component, Input } from '@angular/core';
import { UserPermissionDto } from '../../../core/shared/services/auth.service';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrl: './general.component.scss'
})
export class GeneralComponent {
  @Input() permission: UserPermissionDto[] = [];
  @Input() module: string;
}
