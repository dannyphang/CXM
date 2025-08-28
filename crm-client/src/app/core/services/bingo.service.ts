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

    getBingoData(): Observable<ResponseModel<BingoDto[]>> {
        return this.coreService.get<BingoDto[]>('bingo/data').pipe();
    }

    getBingoDataById(id: string): Observable<ResponseModel<BingoDto>> {
        return this.coreService.get<BingoDto>(`bingo/data/${id}`).pipe();
    }

    createUser(user: any): Observable<ResponseModel<any>> {
        return this.coreService.post<any>('bingo/user', user).pipe();
    }

    getUser(name: string): Observable<ResponseModel<any>> {
        return this.coreService.get<any>(`bingo/user`, { headers: { name: name } }).pipe();
    }

    updateUser(user: any): Observable<ResponseModel<any>> {
        return this.coreService.put<any>('bingo/user', user).pipe();
    }
}

export class BingoDto {
    description: string;
    category: 'FAST' | 'CONNECTION' | 'SPIRITUAL' | 'SERVING';
    uid: string;
    id: number;
}