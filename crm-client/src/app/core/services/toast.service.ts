import { ChangeDetectorRef, Injectable, NgZone, ViewChild, ViewContainerRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { MessageModel } from './core-http.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { Toast } from 'primeng/toast';

@Injectable({
    providedIn: 'root',
})
export class ToastService {
    private toastListSubject = new BehaviorSubject<MessageModel[]>([]);
    toastList$ = this.toastListSubject.asObservable();
    private toasts: MessageModel[] = [];

    constructor(
        private messageService: MessageService,
        private translateService: TranslateService,
    ) { }

    addSingle(toastConfig: MessageModel) {
        // Set default values for severity and icon
        switch (toastConfig.severity) {
            case 'success':
            case undefined:
                toastConfig.severity = 'success';
                toastConfig.icon = 'pi pi-check';
                break;
            case 'error':
                toastConfig.icon = 'pi pi-times-circle';
                break;
            case 'info':
                toastConfig.icon = 'pi pi-info-circle';
                break;
            case 'warn':
                toastConfig.icon = 'pi pi-exclamation-triangle';
                break;
        }

        const messageData = toastConfig.messageData || [];

        this.toasts.push({
            severity: toastConfig.severity ?? 'success',
            message:
                typeof toastConfig.message === 'string'
                    ? this.translateService.instant(
                        toastConfig.message,
                        this.loadMessageData(messageData).reduce((acc, cur) => {
                            acc[cur.label] = this.translateService.instant(cur.value);
                            return acc;
                        }, {})
                    ) || toastConfig.message
                    : '',
            key: toastConfig.key,
            sticky: toastConfig.isLoading || toastConfig.sticky,
            icon: toastConfig.isLoading ? 'pi pi-spin pi-spinner' : toastConfig.icon,
        });
        this.toastListSubject.next([...this.toasts]);

        // Auto-remove if not sticky
        if (!toastConfig.sticky && !toastConfig.isLoading) {
            setTimeout(() => this.clear(toastConfig.key), 3000);
        }

        console.log();
    }

    private loadMessageData(data: any[]) {
        return data.map((i) => {
            return {
                label: this.translateService.instant(i.key),
                value: i.value,
            };
        });
    }

    addMultiple(toastConfig: MessageModel[]) {
        this.messageService.addAll(
            toastConfig.map((i) => {
                switch (i.severity) {
                    case 'success':
                    case undefined:
                        i.severity = 'success';
                        i.icon = 'pi pi-check'
                        break;
                    case 'error':
                        i.icon = 'pi pi-times-circle';
                        break;
                    case 'info':
                        i.icon = 'pi pi-info-circle';
                        break;
                }
                return {
                    severity: i.severity,
                    detail: this.translateService.instant(i.message),
                    key: 'tr',
                    sticky: i.isLoading,
                    icon: i.isLoading ? "pi pi-spin pi-spinner" : undefined,
                };
            }),
        );
    }

    // clear(key?: string | string[]) {
    //     // this.messageService.clear()
    //     // if (key) {
    //     //     if (typeof key === 'string') {
    //     //         this.messageService.clear(key);
    //     //     }
    //     // }
    //     // else {
    //     //     this.messageService.clear()
    //     // }
    // }

    clear(key?: string) {
        // this.toast.messages = this.toast.messages.filter(
        //     (x) => x.key !== key
        // );
        // const changeDetectorRef = this.toastRef.injector.get(ChangeDetectorRef);
        // changeDetectorRef.detectChanges();


        if (key) {
            this.toasts = this.toasts.filter(t => t.key !== key);
        } else {
            this.toasts = [];
        }
        this.toastListSubject.next([...this.toasts]);
    }
}
