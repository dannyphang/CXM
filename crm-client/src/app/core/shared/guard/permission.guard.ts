import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { Location } from '@angular/common'
import { BaseCoreAbstract } from '../base/base-core.abstract';
import { AuthService } from '../../services/auth.service';
import { CoreHttpService } from '../../services/core-http.service';
import { CoreAuthService, UserDto } from '../../services/core-auth.service';
import { ToastService } from '../../services/toast.service';

@Injectable({
    providedIn: 'root'
})
export class PermissionGuard extends BaseCoreAbstract implements CanActivate {
    constructor(
        private authService: AuthService,
        private coreService: CoreHttpService,
        private router: Router,
        private _location: Location,
        private coreAuthService: CoreAuthService,
        private toastService: ToastService,

    ) {
        super(coreAuthService);
    }

    async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
        return new Promise(async (resolve, reject) => {
            try {
                let user: UserDto | null = this.authCoreService.user;
                if (!user) {
                    this.toastService.addSingle({
                        severity: 'info',
                        message: 'MESSAGE.LOADING',
                        isLoading: true,
                        key: 'authLoading',
                    })
                    user = await this.coreAuthService.getCurrentAuthUser();

                    this.authService.getAllRoles().subscribe({
                        next: res => {
                            this.coreAuthService.roles = res.data;
                        },
                        error: err => {
                            console.log(err)
                        },
                        complete: () => {
                            this.toastService.clear('authLoading');
                        }
                    });
                }

                this.authService.getUserPermission(user.uid).then(permission => {
                    this.coreAuthService.userPermission = permission;
                    let permit: boolean = true;
                    if (user?.roleId !== 1) {
                        permit = this.checkPermission(route.data['action'], route.data['module']);
                    }
                    if (!permit) {
                        this.router.navigate([]);
                    }
                    resolve(permit);
                }).catch(err => {
                    this.router.navigate(["/crm"])
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