import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, Subscription, of, throwError } from 'rxjs';
import { catchError, finalize, startWith, switchMap, tap } from 'rxjs/operators';

import { AdminService } from '../../../services/admin.service';
import { StudentWrite } from '../../../model/student-write.model';
export interface SubjectInfo {
  code: string;
  name: string;
  teacherName?: string;
}

@Component({
  selector: 'app-manage-student-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-student-subjects.component.html',
  styleUrls: ['./manage-student-subjects.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ManageStudentSubjectsComponent implements OnInit, OnDestroy, OnChanges {
  @Input({ required: true }) student!: StudentWrite;
  @Input() allSubjectsInput: SubjectInfo[] | null = null;
  @Input() isLoadingAllSubjects: boolean = false;
  @Output() close = new EventEmitter<void>();

  private adminService = inject(AdminService);
  private subscriptions = new Subscription();
  private reloadStudentSubjects = new Subject<void>();

  currentSubjects: SubjectInfo[] = [];
  availableSubjects: SubjectInfo[] = [];
  selectedSubjectCodeToAdd: string | null = null;
  isLoadingCurrent = false;
  isUpdating = false;
  error: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['allSubjectsInput']) {
      if (this.allSubjectsInput) {
        this.filterAvailableSubjects();
      }
    }
  }

  ngOnInit(): void {
    if (!this.student?.indexNumber) {
      this.error = "Critical Error: Student index number is missing.";
      this.isLoadingCurrent = false;
      return;
    }

    this.subscriptions.add(
      this.reloadStudentSubjects.pipe(
        startWith(null),
        tap(() => {
          this.isLoadingCurrent = true;
          this.error = null;
        }),
        switchMap(() => {
          return this.adminService.getStudentSubjects(this.student.indexNumber).pipe(
            catchError(_ => {
              this.error = 'Failed to load student\'s subjects due to an API error.';
              return of([] as SubjectInfo[]);
            }),
            finalize(() => {
              this.isLoadingCurrent = false;
            })
          );
        }),
        tap((current) => {
          if (this.error) {
            return;
          }
          this.currentSubjects = current;
          this.filterAvailableSubjects();
        })
      ).subscribe({
        error: (err) => {
          if (!this.error) {
            this.error = 'An unexpected error occurred while processing subject data.';
          }
          this.isLoadingCurrent = false;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.reloadStudentSubjects.complete();
  }

  loadCurrentSubjects(): void {
    this.reloadStudentSubjects.next();
  }

  private filterAvailableSubjects(): void {
    if (!this.allSubjectsInput) {
      this.availableSubjects = [];
      return;
    }
    const currentCodes = new Set(this.currentSubjects.map(s => s.code));
    this.availableSubjects = this.allSubjectsInput.filter(s => !currentCodes.has(s.code));
    this.selectedSubjectCodeToAdd = null;
  }

  addSubject(): void {
    if (!this.selectedSubjectCodeToAdd || this.isUpdating || !this.allSubjectsInput || !this.student?.semester) {
      this.error = 'Cannot add subject: Missing required data.';
      return;
    }

    this.isUpdating = true;
    this.error = null;
    const subjectCodeToAdd = this.selectedSubjectCodeToAdd;
    const subjectToAdd = this.allSubjectsInput.find(s => s.code === subjectCodeToAdd);
    const currentSemester = this.student.semester;

    if (!subjectToAdd) {
      this.error = 'An internal error occurred trying to add the subject.';
      this.isUpdating = false;
      return;
    }
    this.subscriptions.add(
      this.adminService.assignSubjectToStudent(this.student.indexNumber, subjectCodeToAdd, currentSemester).pipe(
        tap(() => {
          this.currentSubjects.push(subjectToAdd);
          this.filterAvailableSubjects();
        }),
        catchError(err => {
          this.error = `Failed to add subject. ${err?.error?.message || 'Server error'}`.trim();
          this.currentSubjects = this.currentSubjects.filter(s => s.code !== subjectCodeToAdd);
          this.filterAvailableSubjects();
          return throwError(() => err);
        }),
        finalize(() => {
          this.isUpdating = false
        })
      ).subscribe()
    );
  }

  removeSubject(subjectCodeToRemove: string): void {
    if (this.isUpdating || !this.student?.semester || !confirm(`Remove subject ${subjectCodeToRemove} from ${this.student.firstName} ${this.student.lastName}?`)) {
      if (!this.student?.semester) this.error = 'Cannot remove subject: Student semester unknown.';
      return;
    }

    this.isUpdating = true;
    this.error = null;
    const subjectToRemove = this.currentSubjects.find(s => s.code === subjectCodeToRemove);
    const currentSemester = this.student.semester;
    if (!subjectToRemove) return;

    const originalCurrentSubjects = [...this.currentSubjects];
    this.currentSubjects = this.currentSubjects.filter(s => s.code !== subjectCodeToRemove);
    this.filterAvailableSubjects();

    this.subscriptions.add(
      this.adminService.removeStudentFromSubject(this.student.indexNumber, subjectCodeToRemove, currentSemester).pipe(
        catchError(err => {
          this.error = `Failed to remove subject. ${err?.error?.message || 'Server error'}`.trim();
          this.currentSubjects = originalCurrentSubjects;
          this.filterAvailableSubjects();
          return throwError(() => err);
        }),
        finalize(() => {
          this.isUpdating = false
        })
      ).subscribe()
    );
  }
  get isLoading(): boolean {
    return this.isLoadingAllSubjects || this.isLoadingCurrent;
  }
  closeModal(): void {
    console.log('ManageStudentSubjects: Close button clicked');
    this.close.emit();
  }
  retryLoadCurrentSubjects(): void {
    console.log("ManageStudentSubjects: Retry button clicked.");
    this.loadCurrentSubjects();
  }
} 