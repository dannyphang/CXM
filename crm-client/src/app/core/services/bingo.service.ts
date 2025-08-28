import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CoreHttpService, ResponseModel } from "./core-http.service";
import { Observable } from "rxjs/internal/Observable";

@Injectable({ providedIn: 'root' })
export class BingoService {
    constructor(
        private http: HttpClient,
        private coreService: CoreHttpService
    ) {

    }

    getBingoData(): Observable<ResponseModel<any>> {
        return this.coreService.get<any>('bingo').pipe();
    }

    getBingoDataById(id: string): Observable<ResponseModel<any>> {
        return this.coreService.get<any>(`bingo/${id}`).pipe();
    }
}