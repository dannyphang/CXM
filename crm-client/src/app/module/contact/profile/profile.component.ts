import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  constructor(
    private router: Router
  ) {
  }

  goToSetting() {
    // navigate to setting page
    this.router.navigate(['/setting'])
  }
}
