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
import apiConfig from "../../../environments/apiConfig";

@Injectable({ providedIn: 'root' })
export class AuthService {
    SERVICE_PATH = 'auth';
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

    currentUser(): User | null {
        return this.user;
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

    async getCurrentUser(): Promise<User | null> {
        return new Promise((resolve, reject) => {
            this.commonService.getEnvToken().subscribe(res => {
                this.app = initializeApp(res);
                this.auth = getAuth(this.app);
                this.auth ? onAuthStateChanged(this.auth, (user) => {
                    if (user) {
                        this.user = user;
                        resolve(this.user);
                    } else {
                        resolve(null);
                    }
                }) : resolve(null);
            });
        });
    }

    updateCurrentUserInfo() {
        updateProfile(this.auth.currentUser!, {
            displayName: "Danny Phang 2"
        }).then(() => {
            // Profile updated!
            // ...
        }).catch((error) => {
            // An error occurred
            // ...
        });
    }

    getAllUser() {
        return this.http.get<any>(`${apiConfig.baseUrl}/${this.SERVICE_PATH}` + '/allUser').pipe();
    }

    updateUser(updateData: any) {
        if (this.auth.currentUser) {
            updateProfile(this.auth.currentUser, updateData).then(res => {
                console.log(res);
            }).catch(error => {
                console.log(error)
            })
        }

    }
}