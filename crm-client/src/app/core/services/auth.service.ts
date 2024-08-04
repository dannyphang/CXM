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
} from "firebase/auth";
import config from "../../../environments/config";

@Injectable({ providedIn: 'root' })
export class ActivityService {
    app: FirebaseApp;

    constructor(
        private http: HttpClient
    ) {
        this.app = initializeApp(config.firebaseConfig);

    }

    login() {

    }


}