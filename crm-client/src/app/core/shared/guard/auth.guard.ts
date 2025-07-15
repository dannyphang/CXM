import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CoreHttpService } from '../../services/core-http.service';
import { CoreAuthService, UserDto } from '../../services/core-auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(
        private authService: AuthService,
        private coreService: CoreHttpService,
        private router: Router,
        private coreAuthService: CoreAuthService
    ) {

    }

    getUser(): Promise<UserDto | null> {
        return new Promise((resolve, reject) => {
            this.coreAuthService.getCurrentAuthUser().then(user => {
                this.coreAuthService.user = user;
                this.authService.getUserPermission(user.uid).then(permission => {
                    this.coreAuthService.userPermission = permission;
                }).finally(() => {
                    resolve(user)
                });
            }).catch(err => {
                console.log(err);
                resolve(null);
            })
        })
    }

    async canActivate(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            if (await this.getUser()) {
                return resolve(true); // Allow access to the route
            } else {
                // Redirect to the login page
                this.router.navigate(['/']);
                return resolve(false);
            }
        });
    }
}