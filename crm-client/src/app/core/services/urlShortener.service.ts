import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { BasedDto, CoreAuthService } from "./core-auth.service";
import { CoreHttpService, ResponseModel } from "./core-http.service";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class UrlShortenerService {

    constructor(
        private coreService: CoreHttpService,
    ) {
    }

    urlShortener(url: string): Observable<ResponseModel<UrlShortenerDto[]>> {
        return this.coreService.post<UrlShortenerDto[]>('short', { url }).pipe();
    }

    getUrlShortener(path: string): Observable<ResponseModel<any>> {
        let headers = {
            'path': path
        }
        return this.coreService.get<any>('short/', { headers: headers }).pipe();
    }
}

export class UrlShortenerDto extends BasedDto {
    originalUrl: string;
    shortUrl: string;
    expiry: number;
    id: number;
    uid: string;
    path: string;
}