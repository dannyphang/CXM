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
import { BasedDto, CommonService, ResponseModel } from "./common.service";
import apiConfig from "../../../environments/apiConfig";
import { Observable } from "rxjs";

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

    signUp(email: string, password: string) {
        return createUserWithEmailAndPassword(this.auth, email, password);
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

    createUser(user: CreateUserDto[], createBy: string): Observable<ResponseModel<any>> {
        return this.http.post<ResponseModel<any>>(apiConfig.baseUrl + '/auth/user', { user, createdBy: createBy }).pipe();
    }

    getUser(userUid: string): Observable<ResponseModel<UserDto>> {
        return this.http.get<ResponseModel<UserDto>>(apiConfig.baseUrl + '/auth/user/' + userUid).pipe();
    }

    updateUserFirestore(user: CreateUserDto[], updateBy: string): Observable<ResponseModel<any>> {
        return this.http.put<ResponseModel<any>>(apiConfig.baseUrl + '/auth/user/update', { user, updatedBy: updateBy }).pipe();
    }
}

export class CreateUserDto extends BasedDto {
    firstName?: string;
    lastName?: string;
    nickname?: string;
    displayName?: string;
    profilePhotoUrl?: string;
    email?: string;
    phoneNumber?: string;
    uid: string;
}

export class UserDto extends BasedDto {
    uid: string;
    firstName: string;
    lastName: string;
    nickname: string;
    displayName: string;
    phoneNumber: string;
    profilePhotoUrl: string;
    email: string;
    roleId: string;
}