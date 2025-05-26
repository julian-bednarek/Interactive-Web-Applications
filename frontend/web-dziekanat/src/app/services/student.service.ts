import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { AuthService } from "@auth0/auth0-angular";
import { Observable, switchMap, BehaviorSubject, filter, tap, shareReplay, throwError, of } from "rxjs"; // Added BehaviorSubject, filter, tap, shareReplay, throwError, of
import { ReportCardView } from "../model/report-card.model";
import { StudentBankAccountView } from "../model/student-back-account.model";
import { StudentPersonalView } from "../model/student-personal.model";
import { FieldOfStudyRead } from "../model/field-of-study-read.model";
import { Payments } from "../model/payments.model";
import { GeneralStudyInfo } from "../model/general-study.model";
import { jwtDecode } from "jwt-decode";

@Injectable({
    providedIn: 'root'
})
export class StudentService {

    private readonly API_URL: string = "http://localhost:8080/api/student";

    private http = inject(HttpClient);
    private auth = inject(AuthService);

    // BehaviorSubject to hold the student index
    private studentIndexSubject = new BehaviorSubject<string | null>(null);
    // Observable for components to subscribe to the index
    // Use shareReplay to avoid refetching index for every subscriber
    // Use filter(Boolean) to ensure subscribers only get a valid index string
    public studentIndex$: Observable<string> = this.studentIndexSubject.asObservable().pipe(
        filter((index): index is string => index !== null && index !== ''), // Ensure index is valid
        shareReplay(1) // Cache the last emitted index
    );

    private studentIndexFetched = false; // Flag to prevent multiple fetches

    constructor() {
        // Automatically fetch index when service is initialized and user is authenticated
        this.auth.isAuthenticated$.pipe(
            filter(isAuthenticated => isAuthenticated && !this.studentIndexFetched),
            switchMap(() => this.fetchAndStoreStudentIndex())
        ).subscribe();
    }


    private getAuthHeaders(token: string): HttpHeaders {
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    private fetchAndStoreStudentIndex(): Observable<string | null> {
        this.studentIndexFetched = true;
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token => {
                const decodedToken = jwtDecode(token as string) as { sub: string };
                const sub = encodeURIComponent(decodedToken.sub);
                return this.http.get<string>(`${this.API_URL}/obtain-index/${sub}`, { headers: this.getAuthHeaders(token) });
            }),
            tap(index => {
                this.studentIndexSubject.next(index);
            }),
            switchMap(index => index ? of(index) : of(null))
        );
    }

    getStudentIndex(): Observable<string | null> {
        if (!this.studentIndexFetched) {
            return this.fetchAndStoreStudentIndex();
        }
        return this.studentIndexSubject.asObservable();
    }
    getReportCard(index: string, semester: number): Observable<ReportCardView> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.get<ReportCardView>(`${this.API_URL}/grades/${index}&${semester}`, { headers: this.getAuthHeaders(token) })
            )
        );
    }

    getStudentBankAccounts(index: string): Observable<StudentBankAccountView> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.get<StudentBankAccountView>(`${this.API_URL}/bank-accounts/${index}`, { headers: this.getAuthHeaders(token) })
            )
        );
    }

    getStudentPersonalData(index: string): Observable<StudentPersonalView> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token => {
                // console.log(token); // Keep for debugging if needed
                return this.http.get<StudentPersonalView>(`${this.API_URL}/personal-data/${index}`, { headers: this.getAuthHeaders(token) })
            })
        );
    }

    getFieldOfStudyData(index: string): Observable<FieldOfStudyRead> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.get<FieldOfStudyRead>(`${this.API_URL}/field-of-study/${index}`, { headers: this.getAuthHeaders(token) })
            )
        );
    }

    getPayments(index: string, semester: number): Observable<Payments> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.get<Payments>(`${this.API_URL}/payments/${index}&${semester}`, { headers: this.getAuthHeaders(token) })
            )
        );
    }

    updateBankAccount(index: string, bankAccount: StudentBankAccountView): Observable<StudentBankAccountView> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.put<StudentBankAccountView>(`${this.API_URL}/bank-accounts/${index}`, bankAccount, { headers: this.getAuthHeaders(token) })
            )
        );
    }

    updatePersonalData(index: string, personalData: StudentPersonalView): Observable<StudentPersonalView> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.put<StudentPersonalView>(`${this.API_URL}/personal-data/${index}`, personalData, { headers: this.getAuthHeaders(token) })
            )
        );
    }

    getGeneralStudyInfo(index: string): Observable<GeneralStudyInfo> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.get<GeneralStudyInfo>(`${this.API_URL}/general-study/${index}`, { headers: this.getAuthHeaders(token) })
            )
        );
    }
}