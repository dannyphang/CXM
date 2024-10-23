import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService, PermissionObjDto } from '../services/auth.service';
import { Location } from '@angular/common'
import { BaseCoreAbstract } from '../base/base-core.abstract';
import { MessageService } from 'primeng/api';

@Injectable({
    providedIn: 'root'
})
export class PermissionGuard extends BaseCoreAbstract implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router,
        private _location: Location,
        protected override messageService: MessageService
    ) {
        super(messageService);
    }

    async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
        return new Promise(async (resolve, reject) => {
            if (this.authService.user) {
                let permit: boolean = true;
                if (this.authService.userC.roleId !== 1) {
                    permit = this.checkPermission(route.data['action'], route.data['module'], this.authService.returnPermission(this.authService.userC.permission), this.authService.userC.roleId);

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