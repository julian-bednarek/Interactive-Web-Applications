import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Faculty } from "../model/faculty.model";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class PublicService {
    private readonly API_URL: string = "http://localhost:8080/api/public";

    constructor(private http: HttpClient) { }

    getFaculty(id: number): Observable<Faculty> {
        return this.http.get<Faculty>(`${this.API_URL}/faculty/${id}`);
    }

    getFaculties(): Observable<Faculty[]> {
        return this.http.get<Faculty[]>(`${this.API_URL}/faculty`);
    };
};