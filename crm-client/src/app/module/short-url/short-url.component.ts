import { Component } from '@angular/core';
import { CommonService } from '../../core/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-short-url',
  templateUrl: './short-url.component.html',
  styleUrl: './short-url.component.scss'
})
export class ShortUrlComponent {
  shortCode: string | null = null;
  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.shortCode = params.get('id');
      if (this.shortCode) {
        console.log('Short code:', this.shortCode);
        this.commonService.getUrlShortener(this.shortCode).subscribe({
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
}
