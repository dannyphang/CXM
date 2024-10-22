import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService, PermissionObjDto } from '../services/auth.service';
import { Location } from '@angular/common'

@Injectable({
    providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router,
        private _location: Location,
    ) {

    }

    async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
        return new Promise(async (resolve, reject) => {
            if (this.authService.user) {
                this.authService.getUser(this.authService.userC.uid).subscribe(res => {
                    let permit: boolean;
                    permit = this.authService.checkPermission(route.data['module'], route.data['action'], this.authService.returnPermission(res.data.permission));

                    console.log(permit ? '' : "no permission")
                    return resolve(permit); // Allow access to the route
                });
            } else {
                // back to previsous page
                this._location.back();
                return reject(false);
            }
        });
    }
}