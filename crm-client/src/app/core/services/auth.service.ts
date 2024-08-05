import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FirebaseApp, initializeApp } from "firebase/app";
import {
    getAuth,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    updateProfile,
    updateEmail,
    sendEmailVerification,
    updatePassword,
    reauthenticateWithCredential,
    deleteUser,
    signOut,
    Auth,
    User,
    UserCredential,
    onAuthStateChanged,
} from "firebase/auth";
import { CommonService } from "./common.service";

@Injectable({ providedIn: 'root' })
export class AuthService {
    app: FirebaseApp;
    auth: Auth;
    user: User | null;

    constructor(
        private http: HttpClient,
        private commonService: CommonService,
    ) {
        this.commonService.getEnvToken().subscribe(res => {
            this.app = initializeApp(res);
            this.auth = getAuth(this.app);
            this.getCurrentUser();
        })

    }

    signUp(email: string, password: string): boolean {
        createUserWithEmailAndPassword(this.auth, email, password)
            .then((userCredential) => {
                // Signed up 
                const user = userCredential.user;
                console.log(user)
                return true;
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(`${errorCode}: ${errorMessage}`)
                return false;
            });
        return false;
    }

    async signIn(email: string = "danny64phang@gmail.com", password: string = "123456"): Promise<any> {
        return await signInWithEmailAndPassword(this.auth, email, password)
            .then((userCredential) => {
                console.log(userCredential)
                this.user = this.auth.currentUser;
                return {
                    status: true,
                    user: this.user
                };
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(`${errorCode}: ${errorMessage}`)
                return {
                    status: false
                };
            });
    }

    signOut() {
        signOut(this.auth).then(() => {

        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(`${errorCode}: ${errorMessage}`)
        });
    }

    async getCurrentUser(): Promise<any> {
        return this.auth ? onAuthStateChanged(this.auth, (user) => {
            if (user) {
                // User is signed in.
                console.log(user)
                return this.user
            } else {
                // User is not signed in.
                console.log("no data...")
                return null;
            }
        }) : null;
    }

    updateCurrentUserInfo() {
        updateProfile(this.auth.currentUser!, {
            displayName: "Danny Phang"
        }).then(() => {
            // Profile updated!
            // ...
        }).catch((error) => {
            // An error occurred
            // ...
        });
    }
}