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

    urlShortener(url: {
        url: string,
        expiry?: number,
        password?: string
    }): Observable<ResponseModel<UrlShortenerDto[]>> {
        return this.coreService.post<UrlShortenerDto[]>('short', { url: url.url, expiry: url.expiry, password: url.password }).pipe();
    }

    getUrlShortener(path: string): Observable<ResponseModel<any>> {
        let headers = {
            'path': path
        }
        return this.coreService.get<any>('short/url/', { headers: headers }).pipe();
    }

    getAllUrl(): Observable<ResponseModel<UrlShortenerDto[]>> {
        return this.coreService.get<UrlShortenerDto[]>('short/all/').pipe();
    }

    getTitle(url: string): Observable<ResponseModel<string>> {
        let headers = {
            'url': url
        }
        return this.coreService.get<string>('short/title/', { headers: headers }).pipe();
    }
}

export class UrlShortenerDto extends BasedDto {
    originalUrl: string;
    shortUrl: string;
    expiry: number;
    id: number;
    uid: string;
    path: string;
    isDev: boolean;
    analytics: UrlAnalyticsDto[];
}

export class UrlAnalyticsDto extends BasedDto {
    urlUid: string;
    uid: string;
    id: number;
    ipAddress: string;
    device: string;
    country: string;
}