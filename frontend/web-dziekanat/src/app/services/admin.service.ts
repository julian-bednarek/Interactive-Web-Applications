import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AuthService } from "@auth0/auth0-angular";
import { Observable, Observer, switchMap, of } from "rxjs";
import { TeacherWrite } from "../model/teacher-write.model";
import { StudentWrite } from "../model/student-write.model";
import { SubjectWrite } from "../model/subject-write.model";
import { FeeWrite } from "../model/fee-write.mode";
import { Auth0 } from "../model/auth0.model";
import { Injectable, inject } from "@angular/core";
import { FieldOfStudyWrite } from "../model/field-of-study-write.model";
import { FieldOfStudyRead } from "../model/field-of-study-read.model";
import { Payments } from "../model/payments.model";


@Injectable({
    providedIn: 'root'
})
export class AdminService {

    private readonly API_URL: string = "http://localhost:8080/api/admin";

    private http = inject(HttpClient);
    private auth = inject(AuthService);

    private getAuthHeaders(token: string): HttpHeaders {
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    syncUsers(): Observable<any> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.post(`${this.API_URL}/sync-users`, {}, { headers: this.getAuthHeaders(token) })
            )
        );
    };

    fillTeacher(teacherAuth0Id: string, teacherDTO: TeacherWrite): Observable<any> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.post(`${this.API_URL}/fill-teacher/${teacherAuth0Id}`, teacherDTO, { headers: this.getAuthHeaders(token) })
            )
        );
    };

    fillStudent(studentAuth0Id: string, studetnDTO: StudentWrite): Observable<any> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.post(`${this.API_URL}/fill-student/${studentAuth0Id}`, studetnDTO, { headers: this.getAuthHeaders(token) })
            )
        );
    };

    addSubject(subject: SubjectWrite): Observable<SubjectWrite> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.post<SubjectWrite>(`${this.API_URL}/add-subject/`, subject, { headers: this.getAuthHeaders(token) })
            )
        );
    };

    addFee(fee: FeeWrite): Observable<FeeWrite> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.post<FeeWrite>(`${this.API_URL}/add-fee/`, fee, { headers: this.getAuthHeaders(token) })
            )
        );
    }

    assignSubjectToTeacher(studentIndex: string, subjectCode: String, semester: number): Observable<any> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.post(`${this.API_URL}/assign-subject-to-teacher/${studentIndex}/${subjectCode}/${semester}`, {}, { headers: this.getAuthHeaders(token) })
            )
        );
    };

    deleteStudent(studentIndex: string): Observable<object> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.delete<object>(`${this.API_URL}/delete-student/${studentIndex}`, { headers: this.getAuthHeaders(token) })
            )
        );
    };

    deleteTeacher(teacherId: number): Observable<object> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.delete<object>(`${this.API_URL}/delete-teacher/${teacherId}`, { headers: this.getAuthHeaders(token) })
            )
        );
    };

    deleteSubject(subjectCode: string): Observable<object> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.delete<object>(`${this.API_URL}/delete-subject/${subjectCode}`, { headers: this.getAuthHeaders(token) })
            )
        );
    };

    deleteFee(feeId: number): Observable<object> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.delete<object>(`${this.API_URL}/delete-fee/${feeId}`, { headers: this.getAuthHeaders(token) })
            )
        );
    };

    removeStudentFromSubject(studentIndex: string, subjectCode: string, semester: number): Observable<any> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.delete(`${this.API_URL}/remove-student-from-subject/${studentIndex}&${subjectCode}&${semester}`, { headers: this.getAuthHeaders(token) })
            )
        );
    };

    updateSubject(subjectCode: string, subjectDTO: SubjectWrite): Observable<SubjectWrite> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.put<SubjectWrite>(`${this.API_URL}/update-subject/${subjectCode}`, subjectDTO, { headers: this.getAuthHeaders(token) })
            )
        );
    };

    updateFee(feeId: number, feeDTO: FeeWrite): Observable<FeeWrite> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.put<FeeWrite>(`${this.API_URL}/update-fee/${feeId}`, feeDTO, { headers: this.getAuthHeaders(token) })
            )
        );
    };

    changeSubjectTeacher(subjectCode: string, teacherId: number): Observable<any> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.put(`${this.API_URL}/change-subject-teacher/${subjectCode}/${teacherId}`, {}, { headers: this.getAuthHeaders(token) })
            )
        );
    };

    getNotFilledUsers(): Observable<Array<Auth0>> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.get<Array<Auth0>>(`${this.API_URL}/get-not-filled-users`, { headers: this.getAuthHeaders(token) })
            )
        );
    }

    getSubjects(): Observable<Array<SubjectWrite>> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.get<Array<SubjectWrite>>(`${this.API_URL}/get-subjects`, { headers: this.getAuthHeaders(token) })
            )
        );
    }

    getFees(): Observable<Array<FeeWrite>> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.get<Array<FeeWrite>>(`${this.API_URL}/get-fees`, { headers: this.getAuthHeaders(token) })
            )
        );
    };

    getStudents(): Observable<Array<StudentWrite>> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.get<Array<StudentWrite>>(`${this.API_URL}/get-students`, { headers: this.getAuthHeaders(token) })
            )
        );
    }

    getTeachers(): Observable<Array<TeacherWrite>> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.get<Array<TeacherWrite>>(`${this.API_URL}/get-teachers`, { headers: this.getAuthHeaders(token) })
            )
        );
    };

    getFieldsOfStudy(): Observable<Array<FieldOfStudyRead>> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.get<Array<FieldOfStudyRead>>(`${this.API_URL}/fields-of-study`, { headers: this.getAuthHeaders(token) })
            )
        );
    };

    addFieldOfStudy(fieldOfStudy: FieldOfStudyWrite): Observable<object> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.post<FieldOfStudyWrite>(`${this.API_URL}/fields-of-study`, fieldOfStudy, { headers: this.getAuthHeaders(token) })
            )
        );
    };

    updateFieldOfStudy(fieldOfStudy: FieldOfStudyWrite, id: number): Observable<object> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.put<FieldOfStudyWrite>(`${this.API_URL}/fields-of-study/${id}`, fieldOfStudy, { headers: this.getAuthHeaders(token) })
            )
        );
    };

    deleteFieldOfStudy(fieldOfStudyId: number): Observable<object> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.delete<object>(`${this.API_URL}/fields-of-study/${fieldOfStudyId}`, { headers: this.getAuthHeaders(token) })
            )
        );
    };

    assignSubjectToStudent(studentIndex: string, subjectCode: string, semester: number): Observable<any> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.post(`${this.API_URL}/assign-student-to-subject/${studentIndex}&${subjectCode}&${semester}`, {}, { headers: this.getAuthHeaders(token) })
            )
        );
    };
    getStudentSubjects(studentIndex: string): Observable<Array<SubjectWrite>> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token => {
                return this.http.get<Array<SubjectWrite>>(`${this.API_URL}/get-subjects/${studentIndex}`, { headers: this.getAuthHeaders(token) });
            })
        );
    };

    assignFeeToStudent(studentIndex: string, feeId: number): Observable<any> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.post(`${this.API_URL}/assign-fee-to-student/${studentIndex}&${feeId}`, {}, { headers: this.getAuthHeaders(token) })
            )
        );
    };

    getStudentFees(studentIndex: string): Observable<Payments> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.get<Payments>(`${this.API_URL}/student-fees/${studentIndex}`, { headers: this.getAuthHeaders(token) })
            )
        );
    };

    removeFeeFromStudent(studentIndex: string, feeId: number): Observable<any> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.delete(`${this.API_URL}/remove-fee-from-student/${studentIndex}&${feeId}`, { headers: this.getAuthHeaders(token) })
            )
        );
    };

    setFeePaid(studentIndex: string, feeId: number): Observable<any> {
        return this.auth.getAccessTokenSilently().pipe(
            switchMap(token =>
                this.http.put(`${this.API_URL}/set-fee-paid/${studentIndex}&${feeId}`, {}, { headers: this.getAuthHeaders(token) })
            )
        );
    };
};