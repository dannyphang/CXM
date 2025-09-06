import { CoreAuthService } from "../../services/core-auth.service";
import { UserPermissionDto, PermissionObjDto, RoleDto } from "../../services/core-http.service";

export abstract class BaseCoreAbstract {
    constructor(
        protected authCoreService: CoreAuthService,
    ) {

    }

    checkPermission(action: keyof PermissionObjDto, module: 'CONT' | 'COMP' | 'SETTING' | 'PROPERTY'): boolean {
        if (this.authCoreService.userC.roleId === 1) {
            return true;
        }
        return this.authCoreService.permission?.find(p => p.module === module)?.permission[action] ?? false;
    }

    checkRolePermission(roleId: number, control: 'platform' | 'per-tenant' | 'user' | 'module-crud'): boolean {
        return this.authCoreService.roleList?.find(r => r.roleId === roleId)?.permissionControl?.find(p => p.control === control)?.permission ?? false;
    }
}