import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import apiConfig from "../../../environments/apiConfig";

@Injectable({ providedIn: 'root' })
export class ContactService {
    constructor(
        private http: HttpClient
    ) {
    }

    getAllContact(): Observable<any[]> {
        return this.http.get<any[]>(apiConfig.baseUrl + '/contact').pipe();
    }

    getContactById(id: string): Observable<any> {
        return this.http.get<any>(apiConfig.baseUrl + '/contact/' + id).pipe();
    }
}