import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrl: './qr-code.component.scss'
})
export class QrCodeComponent {
  @Input() qrData: string = '';
  @Output() qrCodeUrlEmitter = new EventEmitter<any>();
  @Input() title: string = 'QR Code';
  @Input() scale: number = 4;
  @Input() imageSrc: string | null = null;
  @Input() errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H' = 'M';
  @Input() cssClass: string = '';
  @Input() showButton: boolean = false;
  @Input() buttonText: string = 'Download QR Code';

  qrCodeUrl: any | null = null;

  constructor(

  ) {

  }

  onQrCodeUrl(safeUrl: any): void {
    console.log(safeUrl)
    this.qrCodeUrl = safeUrl;
    this.qrCodeUrlEmitter.emit(safeUrl);
  }

  downloadMyFile(): void {
    const canvas = document.querySelector('qrcode canvas') as HTMLCanvasElement;

    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'qrcode.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error('QR Code canvas not found');
    }
  }
}
