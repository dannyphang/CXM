import { MessageService } from "primeng/api";
import { MessageModel } from "../../services/common.service";

export abstract class BaseCoreAbstract {
    constructor(
        protected messageService: MessageService,
    ) {

    }


}