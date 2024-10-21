import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from 'firebase/auth';
// import { AuthService } from './auth.service'; // Import your authentication service

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(
        private authService: AuthService,
        private router: Router
    ) {

    }

    getUser(): Promise<User | null> {
        return new Promise((resolve, reject) => {
            this.authService.getCurrentUser().then(user => {
                resolve(user)
            });
        })
    }

    async canActivate(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            if (await this.getUser()) {
                return resolve(true); // Allow access to the route
            } else {
                // Redirect to the login page
                this.router.navigate(['/signin']);
                return resolve(false);
            }
        });
    }
}