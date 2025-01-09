import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { Location } from '@angular/common'
import { BaseCoreAbstract } from '../base/base-core.abstract';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { CoreHttpService } from '../../services/core-http.service';

@Injectable({
    providedIn: 'root'
})
export class PermissionGuard extends BaseCoreAbstract implements CanActivate {
    constructor(
        private authService: AuthService,
        private coreService: CoreHttpService,
        private router: Router,
        private _location: Location,
        protected override messageService: MessageService
    ) {
        super(messageService);
    }

    async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
        return new Promise(async (resolve, reject) => {
            if (this.coreService.user) {
                let permit: boolean = true;
                if (this.coreService.userC.roleId !== 1) {
                    permit = this.checkPermission(route.data['action'], route.data['module'], this.authService.returnPermission(this.coreService.userC.permission), this.coreService.userC.roleId);

                    console.log(permit ? '' : "no permission")
                }

                return resolve(permit); // Allow access to the route
            } else {
                // back to previsous page
                this._location.back();
                return reject(false);
            }
        });
    }
}