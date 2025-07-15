import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { Location } from '@angular/common'
import { BaseCoreAbstract } from '../base/base-core.abstract';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { CoreHttpService } from '../../services/core-http.service';
import { CoreAuthService } from '../../services/core-auth.service';

@Injectable({
    providedIn: 'root'
})
export class PermissionGuard extends BaseCoreAbstract implements CanActivate {
    constructor(
        private authService: AuthService,
        private coreService: CoreHttpService,
        private router: Router,
        private _location: Location,
        private coreAuthService: CoreAuthService

    ) {
        super(coreAuthService);
    }

    async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
        return new Promise(async (resolve, reject) => {
            try {
                let user = await this.coreAuthService.getCurrentAuthUser();
                this.authCoreService.user = user;

                this.authService.getUserPermission(user.uid).then(permission => {
                    this.coreAuthService.userPermission = permission;
                    let permit: boolean = true;
                    if (user?.roleId !== 1) {
                        permit = this.checkPermission(route.data['action'], route.data['module'], permission);
                    }
                    if (!permit) {
                        this.router.navigate([]);
                    }
                    resolve(permit);
                });
            }
            catch (error) {
                // Redirect to the login page
                this.router.navigate(['/signin']);
                return resolve(false);
            }
        });
    }
}