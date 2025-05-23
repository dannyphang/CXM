import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FirebaseApp, initializeApp } from "firebase/app";
import { CommonService } from "./common.service";
import { FirebaseStorage, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { AuthService } from "./auth.service";
import { CoreHttpService } from "./core-http.service";

@Injectable({ providedIn: 'root' })
export class StorageService {
    app: FirebaseApp;
    storage: FirebaseStorage;

    constructor(
        private coreService: CoreHttpService
    ) {
        this.coreService.getEnvToken().subscribe(res => {
            this.app = initializeApp(res);
            this.storage = getStorage();
        });
    }

    uploadImage(file: File | null, folderName: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let storageRef = ref(this.storage, `${folderName}${file!.name}`);

            uploadBytes(storageRef, file!).then(item => {
                getDownloadURL(storageRef).then(url => {
                    console.log('File available at', url);
                    resolve(url)
                })
            })
        })
    }
}