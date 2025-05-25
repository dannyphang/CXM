import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FirebaseApp, initializeApp } from "firebase/app";
import { CommonService } from "./common.service";
import { FirebaseStorage, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { AuthService } from "./auth.service";
import { CoreHttpService } from "./core-http.service";
import { PreviewType } from "@eternalheart/ngx-file-preview";

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
                    resolve(url)
                })
            })
        })
    }

    mapMimeTypeToPreviewType(mimeType: string): PreviewType {
        const lower = mimeType.toLowerCase();

        if (lower.startsWith('image/')) return 'image';
        if (lower.startsWith('video/')) return 'video';
        if (lower.startsWith('audio/')) return 'audio';

        if (lower === 'application/pdf') return 'pdf';

        // Word docs
        if (
            lower === 'application/msword' ||
            lower === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) return 'word';

        // Excel docs
        if (
            lower === 'application/vnd.ms-excel' ||
            lower === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ) return 'excel';

        // PowerPoint
        if (
            lower === 'application/vnd.ms-powerpoint' ||
            lower === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ) return 'ppt';

        // Text files
        if (
            lower.startsWith('text/plain') ||
            lower === 'application/json' ||
            lower === 'text/csv'
        ) return 'txt';

        // Zip/rar
        if (
            lower === 'application/zip' ||
            lower === 'application/x-rar-compressed' ||
            lower === 'application/x-7z-compressed'
        ) return 'zip';

        return 'unknown';
    }
}