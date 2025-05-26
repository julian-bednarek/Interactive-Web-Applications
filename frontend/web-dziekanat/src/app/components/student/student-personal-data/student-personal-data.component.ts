import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { StudentPersonalView } from '../../../model/student-personal.model';
import { StudentService } from '../../../services/student.service'; // Inject StudentService
import { Observable, Subscription, of, EMPTY } from 'rxjs'; // Import necessary RxJS operators
import { catchError, finalize, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-student-personal-data',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './student-personal-data.component.html',
  styleUrls: ['./student-personal-data.component.scss']
})
export class StudentPersonalDataComponent implements OnInit, OnDestroy {
  // Remove @Input() if data is fetched internally
  // @Input() personalData: StudentPersonalView | null | undefined;

  private studentService = inject(StudentService);
  private subscription: Subscription | null = null;

  personalData$: Observable<StudentPersonalView | null> = of(null); // Observable to hold data
  isLoading = false;
  error: string | null = null;
  studentIndex: string | null = null;

  ngOnInit(): void {
    this.isLoading = true;
    this.error = null;

    // Get student index (assuming it's fetched by parent and stored in service or similar)
    this.subscription = this.studentService.getStudentIndex().pipe(
      tap(index => this.studentIndex = index),
      switchMap(index => {
        if (!index) {
          this.error = "Student index not found.";
          this.isLoading = false;
          return EMPTY; // Stop the observable chain if no index
        }
        // Fetch data using the index
        return this.studentService.getStudentPersonalData(index).pipe(
          catchError(err => {
            console.error("Error loading personal data:", err);
            this.error = "Failed to load personal data.";
            return of(null); // Return null on error
          }),
          finalize(() => {
            this.isLoading = false; // Stop loading indicator
          })
        );
      }),
      catchError(err => { // Catch errors from getStudentIndex() itself
        console.error("Error getting student index:", err);
        this.error = "Failed to retrieve student identifier.";
        this.isLoading = false;
        return of(null);
      })
    ).subscribe(data => {
      // Assign fetched data to the observable stream source if needed,
      // or directly use the data in the template with async pipe
      // For simplicity with async pipe, we assign the result to personalData$
      this.personalData$ = of(data);
    });

    // Alternative: If parent passes index via ActivatedRoute data or params, use that.
    // Example: this.route.parent?.paramMap.subscribe(...) or this.route.parent?.data.subscribe(...)
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}