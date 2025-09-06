import { Injectable } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CoreAuthService, UserDto } from '../../services/core-auth.service';
import { CanActivate, Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(
        private authService: AuthService,
        private router: Router,
        private coreAuthService: CoreAuthService,
        private toastService: ToastService,
    ) {

    }

    getUser(): Promise<UserDto | null> {
        return new Promise((resolve, reject) => {
            this.toastService.addSingle({
                severity: 'info',
                message: 'MESSAGE.LOADING',
                isLoading: true,
                key: 'authLoading',
            })

            this.coreAuthService.getCurrentAuthUser().then(user => {
                this.coreAuthService.user = user;
                this.authService.getAllRoles().subscribe({
                    next: res => {
                        console.log(res)
                        this.coreAuthService.roles = res.data;
                    },
                    error: err => {
                        console.log(err)
                    },
                    complete: () => {
                        this.authService.getUserPermission(user.uid).then(permission => {
                            this.coreAuthService.userPermission = permission;
                        }).finally(() => {
                            this.toastService.clear('authLoading');
                            resolve(user)
                        });
                    }
                });
            }).catch(err => {
                console.log(err);
                this.router.navigate(["/signin"]);
                resolve(null);
            })
        })
    }

    async canActivate(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            this.getUser().then(user => {
                return resolve(true);
            }).catch(error => {
                return resolve(false);
            })
        });
    }
}