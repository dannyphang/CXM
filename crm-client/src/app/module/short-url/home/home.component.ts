import { Component, HostListener } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';
import { UrlShortenerDto, UrlShortenerService } from '../../../core/services/urlShortener.service';
import { DATE_HOUR_MINUTES_UPPER_MERIDIEM, ROW_PER_PAGE_DEFAULT, ROW_PER_PAGE_DEFAULT_LIST } from '../../../core/shared/constants/common.constants';
import { TableRowSelectEvent } from 'primeng/table';
import { CommonService } from '../../../core/services/common.service';
import { Title } from '@angular/platform-browser';

interface Column {
  field: string;
  header: string;
  width?: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  shortFormControl: FormControl = new FormControl('');
  expirationFormControl: FormControl = new FormControl(false);
  expirationInputFormControl: FormControl = new FormControl(7);
  passwordFormControl: FormControl = new FormControl(false);
  passwordInputFormControl: FormControl = new FormControl('');
  qrData: UrlShortenerDto | null = null;

  //#region chart
  primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
  clickOption: any;
  clickData: any;
  deviceOption: any;
  deviceData: any;
  //#endregion

  //#region recent
  ROW_PER_PAGE_DEFAULT = ROW_PER_PAGE_DEFAULT;
  ROW_PER_PAGE_DEFAULT_LIST = ROW_PER_PAGE_DEFAULT_LIST;
  DATE_HOUR_MINUTES_UPPER_MERIDIEM = DATE_HOUR_MINUTES_UPPER_MERIDIEM;
  recentTableCols: Column[] = [];
  recentData: UrlShortenerDto[] = [];
  qrCodeVisible: boolean = false;
  selectedUrl: UrlShortenerDto | null = null;
  selectedUrlTitle: string = '';
  analyticsCols: Column[] = [];
  //#endregion

  constructor(
    private urlService: UrlShortenerService,
    private toastService: ToastService,
    public commonService: CommonService,
    private titleService: Title
  ) {
    this.titleService.setTitle('Short URL');
  }

  ngOnInit(): void {
    this.initRecentTable();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.initRecentTable();
  }

  initRecentTable() {
    if (this.commonService.windowSize.desktop) {
      this.recentTableCols = [
        {
          header: 'Short Link',
          field: 'shortUrl',
          width: '30%',
        },
        {
          header: 'URL',
          field: 'originalUrl',
          width: '40%',
        },
        {
          header: 'Total Clicks',
          field: 'clicks',
          width: '15%',
        },
        {
          header: 'Actions',
          field: 'actions',
          width: '15%',
        }
      ];

    }
    else {
      this.recentTableCols = [
        {
          header: 'Short Link',
          field: 'shortUrl',
          width: this.commonService.windowSize.desktop ? '30%' : '40%',
        },
        {
          header: 'URL',
          field: 'originalUrl',
          width: this.commonService.windowSize.desktop ? '30%' : '60%',
        },
      ]
    }

    this.urlService.getAllUrl().subscribe({
      next: res => {
        this.recentData = res.data;
        this.initClickChart();
        this.initDeviceChart();
      },
      error: err => {
        console.error('Error fetching recent URLs:', err);
      }
    });
  }

  shortenUrl() {
    if (this.shortFormControl.value) {
      this.toastService.addSingle({
        message: "Shortening URL...",
        isLoading: true,
        severity: 'info',
        key: 'url-shortening-loading'
      })
      this.urlService.urlShortener({
        url: this.shortFormControl.value,
        expiry: this.expirationFormControl.value ? this.expirationInputFormControl.value : 7
      }).subscribe({
        next: res => {
          this.qrData = res.data[0];
          this.qrClick(this.qrData);
          this.copyToClipboard(this.qrData.shortUrl);
        },
        error: err => {
          console.error('Error shortening URL:', err);
        },
        complete: () => {
          this.toastService.clear('url-shortening-loading');
          this.toastService.addSingle({
            message: "URL shortened successfully.",
            severity: 'success',
            key: 'url-shortening-success'
          });
          this.initRecentTable();
        }
      });
    }
  }

  returnClicks(uid: string): number {
    return this.recentData.find(item => item.uid === uid)?.analytics.length ?? 0;
  }

  returnTotalClicks(): number {
    return this.recentData.reduce((total, item) => total + item.analytics.length, 0);
  }

  capitalize(word: string): string {
    if (!word) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  initClickChart() {
    const clickCounts: { [key: string]: number } = {};

    let resortDataList = [];
    Object.assign(resortDataList, this.recentData);
    resortDataList.sort((a, b) => {
      const aDate = new Date(a.createdDate).getTime();
      const bDate = new Date(b.createdDate).getTime();
      return aDate - bDate;
    });

    resortDataList.forEach(url => {
      url.analytics.forEach(analytics => {
        // total clicks by date
        const date = new Date(analytics.createdDate).toLocaleDateString();
        clickCounts[date] = (clickCounts[date] || 0) + 1;
      });
    });

    this.clickData = {
      labels: Object.keys(clickCounts),
      datasets: [
        {
          label: 'Total Clicks',
          data: Object.values(clickCounts),
          fill: true,
          borderColor: this.primaryColor,
          tension: 0.4,
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;

            if (!chartArea) {
              // Chart not ready yet
              return null;
            }

            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(66, 165, 245, 0.4)'); // top color
            gradient.addColorStop(1, 'rgba(66, 165, 245, 0)');   // fade out to transparent
            return gradient;
          }
        }
      ]
    };

    this.clickOption = {
      aspectRatio: 1.8,
      responsive: true,
      plugins: {
        legend: {
          display: false // hide legend
        },
        decimation: {
          enabled: false
        }
      },
      scales: {
        x: {
          display: false, // hides x-axis, labels, and grid lines
        },
        y: {
          display: false  // hides y-axis, labels, and grid lines
        }
      },
      elements: {
        point: {
          radius: 0 // hide points if you want only smooth line
        }
      }
    };
  }

  initDeviceChart() {
    const deviceCounts: { [key: string]: number } = {};

    this.recentData.forEach(url => {
      url.analytics.forEach(analytics => {
        // total clicks by device
        const device = analytics.device || 'Unknown';
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
      });
    });

    this.deviceData = {
      labels: Object.keys(deviceCounts).map(this.capitalize),
      datasets: [
        {
          data: Object.values(deviceCounts),
          backgroundColor: [
            getComputedStyle(document.documentElement).getPropertyValue('--primary-200').trim(),
            getComputedStyle(document.documentElement).getPropertyValue('--primary-500').trim(),
            getComputedStyle(document.documentElement).getPropertyValue('--primary-800').trim(),
          ],
        }
      ]
    };

    this.deviceOption = {
      aspectRatio: 1.8,
      responsive: true,
      plugins: {
        legend: {
          position: 'right' as const,
          labels: {
            usePointStyle: true,
            // boxWidth: 10,
            // padding: 20
          }
        },
        datalabels: {
          display: false
        },
        tooltip: {
          boxPadding: 2,
          usePointStyle: true,
        }
      }
    };
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.toastService.addSingle({
        message: "Copied to clipboard",
        severity: 'success',
        key: 'url-copy-success'
      });
    }).catch(err => {
      console.error('Error copying to clipboard:', err);
    });
  }

  onRowSelect(event: TableRowSelectEvent) {
    this.selectedUrl = event.data;
    this.qrCodeVisible = true;
    this.getTitle();
    this.initAnalyticsTable();
  }

  qrClick(rowData: any) {
    this.selectedUrl = rowData;
    this.qrCodeVisible = true;
    this.getTitle();
    this.initAnalyticsTable();
  }

  getTitle() {
    this.urlService.getTitle(this.selectedUrl.originalUrl).subscribe({
      next: res => {
        this.selectedUrlTitle = res.data;
      },
      error: err => {
        console.error('Error fetching title:', err);
      }
    });
  }

  initAnalyticsTable() {
    this.analyticsCols = [
      { field: 'createdDate', header: 'Date', width: '30%' },
      { field: 'ipAddress', header: 'IP Address', width: '40%' },
      { field: 'device', header: 'Device', width: '30%' }
    ];
  }

  returnDate(date: any): Date {
    return new Date(date);
  }

  returnExpiryDate(date: any, expiry: number): Date {
    const expiryDate = new Date(date);
    expiryDate.setDate(expiryDate.getDate() + expiry);
    return expiryDate;
  }
}
