import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { AuthService } from "@auth0/auth0-angular";
import { jwtDecode } from "jwt-decode";
import { Observable, switchMap } from "rxjs";
import { SubjectTeacherRead } from "../model/subject-teacher-read.model";
import { SubjectGradeEdit } from "../model/subject-grade-edit.model";


@Injectable({
    providedIn: 'root'
})
export class TeacherService {
    private readonly API_URL: string = "http://localhost:8080/api/teacher";

    private http = inject(HttpClient);
    private auth = inject(AuthService);

    private getAuthHeaders(token: string): HttpHeaders {
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    updateFinalGrade(teacherId: number, subjectCode: string, studentIndex: string, finalGrade: number): Observable<void> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token => {
                return this.http.put<void>(`${this.API_URL}/grades/${teacherId}/${subjectCode}&${studentIndex}`, finalGrade, {
                    headers: this.getAuthHeaders(token)
                });
            })
        );
    }

    getStudentFromSubject(teacherId: number, subjectCode: string): Observable<SubjectGradeEdit> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token => {
                return this.http.get<SubjectGradeEdit>(`${this.API_URL}/grades/${teacherId}/${subjectCode}`, {
                    headers: this.getAuthHeaders(token)
                });
            }));
    }

    getTeachersCourses(teacherId: number): Observable<SubjectTeacherRead[]> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token => {
                return this.http.get<SubjectTeacherRead[]>(`${this.API_URL}/subjects/${teacherId}`, {
                    headers: this.getAuthHeaders(token)
                });
            })
        );
    }

    getTeacherId(): Observable<number> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token => {
                const decodedToken = jwtDecode(token as string) as { sub: string };
                const sub = encodeURIComponent(decodedToken.sub);
                return this.http.get<number>(`${this.API_URL}/teacher-id/${sub}`, {
                    headers: this.getAuthHeaders(token)
                });
            })
        );
    }
}

