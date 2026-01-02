import { Component } from '@angular/core';
import { CommonService } from '../../core/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormControl } from '@angular/forms';
import { UrlShortenerDto, UrlShortenerService } from '../../core/services/urlShortener.service';
import { ToastService } from '../../core/services/toast.service';
import { ROW_PER_PAGE_DEFAULT, ROW_PER_PAGE_DEFAULT_LIST } from '../../core/shared/constants/common.constants';
import { Legend } from 'chart.js';
import { Title } from '@angular/platform-browser';

interface Column {
  field: string;
  header: string;
  width?: string;
}

@Component({
  selector: 'app-short-url',
  templateUrl: './short-url.component.html',
  styleUrl: './short-url.component.scss'
})
export class ShortUrlComponent {
  shortCode: string | null = null;
  isPasswordRequired: boolean = false;
  passwordFormControl: FormControl = new FormControl('');
  urlData: UrlShortenerDto;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private urlService: UrlShortenerService,
    private titleService: Title,
    private toastService: ToastService,
  ) {
    this.titleService.setTitle('Short URL');
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.shortCode = params.get('id');
      console.log('Short code from URL:', this.shortCode);
      if (this.shortCode && this.shortCode !== 'home') {
        this.urlService.getUrlShortener(this.shortCode).subscribe({
          next: res => {
            this.urlData = res.data;
            if (res.data.password) {
              this.isPasswordRequired = true;
              return;
            }
            window.location.href = res.data.originalUrl; // Redirect to the original URL
          },
          error: err => {
            console.error('Error fetching short URL:', err);
          }
        });
      }
      if (this.shortCode === 'home') {
        console.log('Navigating to home');
        this.router.navigate(['/short/home']);
      }
    });
  }

  submitPassword() {
    this.urlService.checkUrlPassword(this.urlData.uid, this.passwordFormControl.value).subscribe({
      next: res => {
        if (res.data) {
          window.location.href = this.urlData.originalUrl; // Redirect to the original URL
        } else {
          this.toastService.addSingle({
            severity: 'error',
            message: 'Incorrect password. Please try again.'
          });
        }
      }
    });
  }
}
