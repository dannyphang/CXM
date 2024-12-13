import { MessageService } from "primeng/api";
import { MessageModel } from "../../services/common.service";

export abstract class BaseCoreAbstract {
    constructor(
        protected messageService: MessageService,
    ) {

    }

    popMessage(messageModel: MessageModel) {
        this.messageService.add({
            // key: messageModel.key,
            severity: messageModel.severity ?? 'success',
            detail: messageModel.message,
            icon: messageModel.isLoading ? "pi pi-spin pi-spinner" : undefined,
            sticky: messageModel.isLoading
        });
    }

    clearMessage(key?: string) {
        this.messageService.clear();
    }
}