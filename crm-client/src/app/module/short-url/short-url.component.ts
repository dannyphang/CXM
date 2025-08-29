import { Component } from '@angular/core';
import { CommonService } from '../../core/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormControl } from '@angular/forms';
import { UrlShortenerDto, UrlShortenerService } from '../../core/services/urlShortener.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-short-url',
  templateUrl: './short-url.component.html',
  styleUrl: './short-url.component.scss'
})
export class ShortUrlComponent {
  shortCode: string | null = null;
  shortFormControl: FormControl = new FormControl('');
  qrData: UrlShortenerDto | null = null;

  constructor(
    private route: ActivatedRoute,
    private urlService: UrlShortenerService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.shortCode = params.get('id');
      if (this.shortCode) {
        console.log('Short code:', this.shortCode);
        this.urlService.getUrlShortener(this.shortCode).subscribe({
          next: res => {
            window.location.href = res.data.originalUrl; // Redirect to the original URL
          },
          error: err => {
            console.error('Error fetching short URL:', err);
          }
        });
      }
    });
  }

  shortenUrl() {
    this.toastService.addSingle({
      message: "Shortening URL...",
      isLoading: true,
      severity: 'info',
      key: 'url-shortening-loading'
    })
    this.urlService.urlShortener(this.shortFormControl.value).subscribe({
      next: res => {
        this.qrData = res.data[0];
        console.log('Shortened URL:', this.qrData);
      },
      error: err => {
        console.error('Error shortening URL:', err);
      },
      complete: () => {
        this.toastService.clear('url-shortening-loading');
      }
    });
  }
}
