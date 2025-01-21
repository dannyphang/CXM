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
        super();
    }

    async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
        return new Promise(async (resolve, reject) => {
            try {
                let user = this.coreAuthService.userC;
                if (!user) {
                    user = await this.coreAuthService.getCurrentAuthUser();
                }

                let permit: boolean = true;
                if (user?.roleId !== 1) {
                    permit = this.checkPermission(route.data['action'], route.data['module'], this.authService.returnPermission(this.coreAuthService.userC.permission), this.coreAuthService.userC.roleId);
                    console.log("permit: " + permit)
                }
                if (!permit) {
                    this.router.navigate([]);
                }
                return resolve(permit); // Allow access to the route
            }
            catch (error) {
                console.log(error);
                // this._location.back();
                return resolve(false);
            }
        });
    }
}