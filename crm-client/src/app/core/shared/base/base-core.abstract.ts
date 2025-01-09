import { MessageService } from "primeng/api";
import { UserPermissionDto, PermissionObjDto } from "../../services/core-http.service";

export abstract class BaseCoreAbstract {
    constructor(
        protected messageService: MessageService,
    ) {

    }

    checkPermission(action: string, module: string, permission: UserPermissionDto[], roleId: number): boolean {
        if (roleId === 1) {
            return true;
        }
        return permission.find(p => p.module === module)?.permission[action as keyof PermissionObjDto] ?? false;
    }


}