import { MessageService } from "primeng/api";

export abstract class BaseCoreAbstract {
    constructor(
        protected messageService: MessageService,
    ) {

    }


}