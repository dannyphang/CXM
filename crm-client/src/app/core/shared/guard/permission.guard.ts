import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
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

    async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            if (this.authService.user) {
                this.authService.getUser(this.authService.userC.uid).subscribe(res => {
                    console.log(res.data)
                    console.log(this.authService.returnPermission(res.data.permission));
                    let permit: boolean;
                    // switch (route.data['module']) {
                    //     case 'CONT':
                    //         // this.authService.returnPermission(res.data.permission).find(p => p.module === )
                    //         break;
                    //     case 'COMP':
                    //         break;
                    //     case 'SETTING':
                    //         break;
                    //     default: permit = false;
                    // }

                    permit = this.authService.returnPermission(res.data.permission).find(p => p.module === route.data['module'])!.permission[route.data['action'] as keyof PermissionObjDto];

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