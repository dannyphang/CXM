import { Component, OnInit } from '@angular/core';
import { MessageModel } from '../../../services/core-http.service';
import { ToastService } from '../../../services/toast.service';
import { trigger, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  animations: [
    trigger('fadeSlide', [
      // appear
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-8px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      // disappear
      transition(':leave', [
        animate('250ms ease-in', style({ opacity: 0, transform: 'translateY(-6px)' }))
      ]),
    ])
  ]
})
export class ToastComponent implements OnInit {
  toastList: MessageModel[] = [];

  constructor(private toastService: ToastService) { }

  ngOnInit() {
    this.toastService.toastList$.subscribe(list => {
      this.toastList = list;
    });
  }

  removeToast(key: string) {
    // Just remove it; the wrapper's :leave animation will run before DOM removal
    this.toastService.clear(key);
  }

  trackByKey = (_: number, t: MessageModel) => t.key;
}
