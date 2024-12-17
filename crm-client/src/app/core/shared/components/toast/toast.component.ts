import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Message, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit, OnDestroy {
  messageGroups: { [key: string]: Message[] } = {};
  private messageSubscription!: Subscription;

  constructor(
    private messageService: MessageService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // Prevent duplicate subscriptions
    this.messageSubscription = this.messageService.messageObserver.subscribe(
      (value: Message | Message[]) => {
        if (Array.isArray(value)) {
          value.forEach((message) => this.groupMessageByKey(message));
        } else {
          this.groupMessageByKey(value);
        }
        this.cdRef.detectChanges(); // Force UI to update
      }
    );
  }

  private groupMessageByKey(message: Message) {
    const key = message.key || 'defaultKey';

    // Initialize group if it does not exist
    if (!this.messageGroups[key]) {
      this.messageGroups[key] = [];
    }

    this.messageGroups[key].push(message);
  }

  // Clean up subscription when component is destroyed
  ngOnDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  // Helper function to get object keys
  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}
