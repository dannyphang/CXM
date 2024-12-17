import { Injectable, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { MessageModel } from './common.service';

@Injectable({
    providedIn: 'root',
})
export class ToastService {
    constructor(
        private messageService: MessageService,
        private translateService: TranslateService,
    ) { }

    addSingle(toastConfig: MessageModel) {
        console.log(toastConfig)
        this.messageService.add({
            severity: toastConfig.severity ?? 'success',
            detail:
                typeof toastConfig.message === 'string'
                    ? this.translateService.instant(
                        toastConfig.message,
                    ) || toastConfig.message
                    : '',
            key: 'tr',
            sticky: toastConfig.isLoading,
            icon: toastConfig.isLoading ? "pi pi-spin pi-spinner" : undefined,
        });
    }

    addMultiple(toastConfig: MessageModel[]) {
        this.messageService.addAll(
            toastConfig.map((i) => {
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

    clear(key?: string | string[]) {
        this.messageService.clear()
        // if (key) {
        //     if (typeof key === 'string') {
        //         this.messageService.clear(key);
        //     }
        // }
        // else {
        //     this.messageService.clear()
        // }
    }
}
