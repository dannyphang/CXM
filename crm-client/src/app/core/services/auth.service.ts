import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FirebaseApp, initializeApp } from "firebase/app";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    signOut,
    Auth,
    User,
    getAuth,
} from "firebase/auth";
import { CommonService } from "./common.service";
import apiConfig from "../../../environments/apiConfig";
import { Observable } from "rxjs";
import { BasedDto, CoreHttpService, ResponseModel, RoleDto, SettingDto, TenantDto, UserDto, UserPermissionDto } from "./core-http.service";

@Injectable({ providedIn: 'root' })
export class AuthService {
    SERVICE_PATH = 'auth';
    app: FirebaseApp;
    auth: Auth;

    constructor(
        private coreService: CoreHttpService
    ) {

    }

    initAuth(): Promise<UserDto> {
        return new Promise((resolve, reject) => {
            this.coreService.getEnvToken().subscribe(res => {
                this.app = initializeApp(res);
                this.auth = getAuth(this.app);
                this.coreService.getCurrentUser().then(user => {
                    resolve(user);
                });
            })
        });
    }

    signUp(email: string, password: string) {
        return createUserWithEmailAndPassword(this.auth, email, password);
    }

    async signIn(email: string = "danny64phang@gmail.com", password: string = "123456"): Promise<any> {
        return await signInWithEmailAndPassword(this.auth, email, password)
            .then((userCredential) => {
                console.log(userCredential)
                this.coreService.user = this.auth.currentUser;
                return {
                    status: true,
                    user: this.coreService.user
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
        return this.coreService.get<any>('auth/allUser').pipe();
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

    createUser(user: CreateUserDto[]): Observable<ResponseModel<any>> {
        return this.coreService.post<any>('auth/user', { user }).pipe();
    }

    updateUserFirestore(user: CreateUserDto[]): Observable<ResponseModel<any>> {
        return this.coreService.put<any>('auth/user/update', { user }).pipe();
    }

    getAllRoles(): Observable<ResponseModel<RoleDto[]>> {
        return this.coreService.get<RoleDto[]>('auth/role').pipe();
    }

    getUserByEmail(email: string): Observable<ResponseModel<UserDto>> {
        let headers = {
            'email': email
        }
        return this.coreService.get<UserDto>('auth/user/email', {
            header: headers
        }).pipe();
    }

    setUserRoleAndTenant(updateList: UpdateUserRoleDto[]): Observable<ResponseModel<any>> {
        return this.coreService.put<any>('auth/userRole/update', { updateList }).pipe();
    }

    returnPermission(pString: string): UserPermissionDto[] {
        return JSON.parse(pString ?? '[]');
    }

    getAllUserByTenant(tenantId: string): Observable<ResponseModel<UserDto[]>> {
        return this.coreService.get<UserDto[]>('auth/user/tenant/' + tenantId).pipe();
    }

    updateUserLastActiveTime(user: UserDto): Observable<ResponseModel<UserDto>> {
        return this.coreService.put<UserDto>('/auth/user/userLastActive', { user }).pipe();
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
    roleId?: number;
    permission?: string;
    setting?: SettingDto;
}

export class UpdateUserRoleDto {
    modifiedBy: string;
    roleId: number;
    email: string;
    tenantId: string;
}