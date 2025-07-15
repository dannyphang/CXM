import { CoreAuthService } from "../../services/core-auth.service";
import { UserPermissionDto, PermissionObjDto } from "../../services/core-http.service";

export abstract class BaseCoreAbstract {
    constructor(
        protected authCoreService: CoreAuthService,
    ) {

    }

    checkPermission(action: keyof PermissionObjDto, module: string, permission: UserPermissionDto[]): boolean {
        if (this.authCoreService.userC.roleId === 1) {
            return true;
        }
        return permission?.find(p => p.module === module)?.permission[action] ?? false;
    }
}