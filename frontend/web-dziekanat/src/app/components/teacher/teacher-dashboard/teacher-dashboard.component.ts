import { Component, inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { CommonModule } from '@angular/common';
import { DashboardNavComponent, NavItem } from '../../shared/dashboard-nav/dashboard-nav.component';
import { TeacherService } from '../../../services/teacher.service';
import { Observable, of, Subscription } from 'rxjs';
import { SubjectTeacherRead } from '../../../model/subject-teacher-read.model';
import { SubjectGradeEdit } from '../../../model/subject-grade-edit.model';
import { StudentSubjectGradeEdit } from '../../../model/subject-grade-edit.model';
import { DynamicTableComponent } from '../../shared/dynamic-table/dynamic-table.component';
import { DynamicFormComponent } from '../../shared/dynamic-form/dynamic-form.component';
import { TableColumn } from '../../shared/dynamic-table/table-column.interface';
import { TableAction } from '../../shared/dynamic-table/table-action.interface';
import { FormConfig, FormField } from '../../shared/dynamic-form/form-config.interface';
import { switchMap } from 'rxjs/operators'; // Import switchMap

@Component({
  selector: 'app-teacher-dashboard',
  imports: [CommonModule, DashboardNavComponent, DynamicTableComponent, DynamicFormComponent],
  templateUrl: './teacher-dashboard.component.html',
  styleUrl: './teacher-dashboard.component.scss',
  standalone: true
})
export class TeacherDashboardComponent {

  // ... (keep existing properties and constructor)
  gradeFormConfig: FormConfig = {
    title: 'Update Grade',
    fields: [
      {
        name: 'finalGrade',
        label: 'Final Grade',
        type: 'select',
        options: [
          { value: 2, label: '2.0' },
          { value: 3, label: '3.0' },
          { value: 3.5, label: '3.5' },
          { value: 4, label: '4.0' },
          { value: 4.5, label: '4.5' },
          { value: 5, label: '5.0' }
        ],
        validators: []
      },
      {
        name: 'confirmation',
        label: 'Confirm Grade',
        type: 'checkbox',
        validators: [] // Consider adding a required validator if confirmation is mandatory
      }
    ],
    submitButtonText: 'Save Grade',
    cancelButtonText: 'Cancel'
  };
  private teacherService = inject(TeacherService);
  private auth = inject(AuthService);
  private subscriptions = new Subscription();

  teacherId: number | null = null;

  subjects: SubjectTeacherRead[] = [];
  selectedSubject: SubjectGradeEdit | null = null;
  selectedStudent: StudentSubjectGradeEdit | null = null;

  isLoading: boolean = false;
  activeSection: string = 'courses';
  isMobileMenuOpen: boolean = false;

  teacherNavItems: NavItem[] = [
    { id: 'courses', label: 'Courses', icon: '📚' },
  ];

  subjectColumns: TableColumn[] = [
    { key: 'code', header: 'Code', type: 'string', isSortable: true },
    { key: 'name', header: 'Name', type: 'string', isSortable: true },
  ];

  subjectActions: TableAction[] = [
    { actionId: 'manageStudents', label: 'Manage Students', buttonClass: 'button button-edit' }
  ];

  studentActions: TableAction[] = [
    { actionId: 'updateGrade', label: 'Update Grade', buttonClass: 'button button-edit' }
  ];

  studentColumns: TableColumn[] = [
    { key: 'studentName', header: 'Student Name', type: 'string', isSortable: true },
    { key: 'studentSurname', header: 'Student Surname', type: 'string', isSortable: true },
    { key: 'studentIndexNumber', header: 'Student Index Number', type: 'string', isSortable: true },
    { key: 'finalGrade', header: 'Final Grade', type: 'number', isSortable: true }, // Displayed in the table
  ];


  ngOnInit(): void {
    this.isLoading = true;
    this.subscriptions.add(
      // Use switchMap to avoid nested subscriptions if getTeacherId() emits multiple times
      this.teacherService.getTeacherId().pipe(
        switchMap(id => {
          this.teacherId = id;
          if (id !== null) { // Ensure teacherId is not null
            return this.teacherService.getTeachersCourses(id);
          } else {
            return of([]); // Return empty array if teacherId is null
          }
        })
      ).subscribe({
        next: subjects => {
          this.subjects = subjects;
          this.isLoading = false;
        },
        error: err => {
          console.error('Error fetching teacher courses:', err);
          this.isLoading = false;
          // Handle error appropriately, e.g., show a message to the user
        }
      })
    );
  }


  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
    this.isMobileMenuOpen = false;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout(): void {
    this.auth.logout({ logoutParams: { returnTo: window.location.origin } });
  }

  onActionClicked(event: { actionId: string; item: any; itemId: any }): void {
    this.isLoading = true; // Set loading true when action starts
    if (event.actionId === 'manageStudents') {
      if (this.teacherId !== null) {
        this.subscriptions.add( // Add subscription to manage it
          this.teacherService.getStudentFromSubject(this.teacherId, (event.item as SubjectTeacherRead).code).subscribe({
            next: subject => {
              this.selectedSubject = subject;
              this.selectedStudent = null; // Ensure student form is hidden
              this.isLoading = false; // Set loading false on success
            },
            error: err => {
              console.error('Error fetching students for subject:', err);
              this.isLoading = false; // Set loading false on error
              // Handle error (e.g., show message)
            }
          })
        );
      } else {
        this.isLoading = false; // Set loading false if teacherId is null
        console.warn('Teacher ID is null, cannot fetch students.');
      }
    } else if (event.actionId === 'updateGrade') {
      this.selectedStudent = event.item as StudentSubjectGradeEdit;
      // Potentially pre-fill the form with the current grade if needed
      const gradeField = this.gradeFormConfig.fields.find(f => f.name === 'finalGrade');
      if (gradeField && gradeField.type === 'select') {
        gradeField.initialValue = this.selectedStudent.finalGrade;
      }
      this.isLoading = false; // Set loading false as selecting student is quick
    } else {
      this.isLoading = false; // Set loading false for unhandled actions
    }
  }


  clearSelectedSubject(): void {
    this.selectedSubject = null;
    this.selectedStudent = null;
  }

  onGradeSubmit(gradeData: any): void {
    if (this.teacherId !== null && this.selectedSubject && this.selectedStudent) {
      const finalGrade = gradeData.finalGrade;
      const confirmation = gradeData.confirmation;

      // Basic validation (consider adding more robust validation)
      const allowedGrades = [2, 3, 3.5, 4, 4.5, 5];
      if (!allowedGrades.includes(finalGrade)) {
        console.error('Invalid grade selected.');
        // Optionally show an error message to the user
        return;
      }
      if (!confirmation) {
        console.error('Grade update not confirmed.');
        // Optionally show an error message to the user
        return;
      }

      this.isLoading = true; // Set loading state before API call
      const subjectCode = this.selectedSubject.subjectCode; // Store before potentially clearing selectedSubject
      const studentIndex = this.selectedStudent.studentIndexNumber;

      this.subscriptions.add( // Add subscription to manage it
        this.teacherService.updateFinalGrade(
          this.teacherId,
          subjectCode,
          studentIndex,
          finalGrade
        ).pipe(
          // After update succeeds, fetch the updated student list for the *same subject*
          switchMap(() => {
            if (this.teacherId !== null) { // Check teacherId again inside switchMap
              return this.teacherService.getStudentFromSubject(this.teacherId, subjectCode);
            } else {
              // If teacherId somehow became null, return an observable of null
              // to avoid errors, though this scenario might indicate a larger issue.
              return of(null);
            }
          })
        ).subscribe({
          next: (updatedSubjectData) => {
            if (updatedSubjectData) {
              this.selectedSubject = updatedSubjectData; // Update the subject data with fresh student list
            }
            this.selectedStudent = null; // Hide the form
            this.isLoading = false; // Set loading state false
            console.log('Grade updated and student list refreshed successfully.');
            // Optionally: Reset the form if DynamicFormComponent doesn't do it automatically
            // this.gradeFormConfig = { ...this.gradeFormConfig }; // Trigger change detection if needed
          },
          error: (err) => {
            console.error('Error updating grade or refreshing student list:', err);
            this.isLoading = false; // Set loading state false on error
            // Handle error (e.g., show error message to the user)
          }
        })
      );
    } else {
      console.warn('Cannot submit grade - missing teacherId, selectedSubject, or selectedStudent.');
    }
  }

  onFormCancel(event: Event): void {
    this.selectedStudent = null; // Hide the form
    this.gradeFormConfig.fields.forEach((field: FormField) => {
      if (field.type === 'select') {
        field.initialValue = null; // Reset select field value
      }
    });
  }
}