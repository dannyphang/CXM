import { MessageService } from "primeng/api";

export abstract class BaseCoreAbstract {
    constructor(
        protected messageService: MessageService,
    ) {

    }

    popMessage(message: string, severity: string = 'success', isLoading = false) {
        this.messageService.add({ severity: severity, detail: message, icon: isLoading ? "pi pi-spin pi-spinner" : undefined, sticky: isLoading });
    }

    clearMessage() {
        this.messageService.clear();
    }
}