import { MessageService } from "primeng/api";
import { PermissionObjDto, UserPermissionDto } from "../services/auth.service";

export abstract class BaseCoreAbstract {
    constructor(
        protected messageService: MessageService,
    ) {

    }

    popMessage(message: string, title: string = 'success', severity: string = 'success',) {
        this.messageService.add({ severity: severity, summary: title, detail: message });
    }

    checkPermission(action: string, module: string, permission: UserPermissionDto[], roleId: number): boolean {
        if (roleId === 1) {
            return true;
        }
        return permission.find(p => p.module === module)?.permission[action as keyof PermissionObjDto] ?? false;
    }
}