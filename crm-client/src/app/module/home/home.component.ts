import { Component, OnInit } from '@angular/core';
import { CONTROL_TYPE, FormConfig } from '../../core/services/components.service';
import { Observable, of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { FormControl, FormGroup } from '@angular/forms';
import { CommonService } from '../../core/services/common.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  constructor(
    private router: Router,
    private titleService: Title
  ) {
    this.titleService.setTitle('CRM');
  }

  navigateToBingo() {
    this.router.navigate(['/bingo']);
  }

  navigateToShortenerLink() {
    this.router.navigate(['/short/home']);
  }

  navigateToCRM() {
    this.router.navigate(['/crm']);
  }
}
