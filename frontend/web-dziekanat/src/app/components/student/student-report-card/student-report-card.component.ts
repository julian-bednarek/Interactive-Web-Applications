import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core'; // Added OnInit, OnDestroy, ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { forkJoin, Observable, Subscription, of, EMPTY, throwError } from 'rxjs'; // Added necessary RxJS
import { catchError, finalize, switchMap, tap, map } from 'rxjs/operators';

import { ReportCardView } from '../../../model/report-card.model';
import { GeneralStudyInfo } from '../../../model/general-study.model'; // Need GeneralStudyInfo
import { StudentService } from '../../../services/student.service'; // Need StudentService
import { SemesterSelectorComponent } from '../../shared/semester-selector/semester-selector.component';

@Component({
  selector: 'app-student-report-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    SemesterSelectorComponent
  ],
  templateUrl: './student-report-card.component.html',
  styleUrls: ['./student-report-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush // Keep OnPush
})
export class StudentReportCardComponent implements OnInit, OnDestroy {
  // Remove @Input
  // @Input() reportCardData: ReportCardView[] | null | undefined;

  private studentService = inject(StudentService);
  private cdRef = inject(ChangeDetectorRef); // Inject ChangeDetectorRef
  private dataSubscription: Subscription | null = null;

  allReportCardData: ReportCardView[] = []; // Store all fetched cards
  availableSemesters: number[] = [];
  selectedSemester: number | null = null;
  displayedReportCard: ReportCardView | null = null;

  isLoading = false;
  error: string | null = null;
  studentIndexValue: string | null = null;

  displayedColumns: string[] = ['name', 'code', 'teacher', 'ects', 'finalGrade'];

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.dataSubscription?.unsubscribe();
  }

  loadInitialData(): void {
    this.isLoading = true;
    this.error = null;
    this.resetState(); // Clear previous data

    this.dataSubscription = this.studentService.studentIndex$.pipe(
      tap(index => this.studentIndexValue = index),
      switchMap(index => {
        if (!index) {
          this.error = "Student index not available.";
          return EMPTY;
        }
        // First, get General Study Info to determine semesters
        return this.studentService.getGeneralStudyInfo(index).pipe(
          catchError(err => {
            console.error("Error fetching general info for report card:", err);
            this.error = "Failed to load semester information.";
            return throwError(() => new Error("Failed to load general info")); // Propagate error to outer catch
          }),
          switchMap(generalInfo => {
            if (!generalInfo || typeof generalInfo.currentSemester !== 'number' || generalInfo.currentSemester < 1) {
              this.error = "No valid semester data found.";
              this.availableSemesters = [];
              return of([] as ReportCardView[]); // Return empty array if no semesters
            }

            // Generate semester list (descending)
            this.availableSemesters = Array.from({ length: generalInfo.currentSemester }, (_, i) => i + 1).sort((a, b) => b - a);

            if (this.availableSemesters.length > 0) {
              this.selectedSemester = this.availableSemesters[0]; // Default to latest semester
              // Create API calls for each semester's report card
              const reportCardCalls = this.availableSemesters.map(semester =>
                this.studentService.getReportCard(index, semester).pipe(
                  catchError(err => {
                    console.warn(`Could not load report card for semester ${semester}:`, err);
                    // Don't set global error, just return null for this semester
                    return of(null);
                  })
                )
              );
              return forkJoin(reportCardCalls).pipe(
                map(results => results.filter(rc => rc !== null) as ReportCardView[]) // Filter out nulls
              );
            } else {
              return of([] as ReportCardView[]); // No semesters, return empty
            }
          })
        );
      }),
      catchError(err => { // Catch errors from index or general info fetch
        console.error("ReportCard: Error in initial data fetch pipeline:", err);
        if (!this.error) { // Set a general error if none exists yet
          this.error = "Failed to load report card data.";
        }
        this.resetState(); // Clear data on error
        return of([] as ReportCardView[]); // Return empty array on error
      }),
      finalize(() => {
        this.isLoading = false;
        this.cdRef.markForCheck(); // Trigger change detection after loading
        console.log("ReportCard: Data loading finalized.", { isLoading: this.isLoading, error: this.error });
      })
    ).subscribe(reportCards => {
      this.allReportCardData = reportCards;
      this.updateDisplayedCard(); // Display the default selected semester card
      if (this.availableSemesters.length > 0 && this.allReportCardData.length === 0 && !this.error) {
        // Handle case where semesters exist but no report cards loaded (e.g., all calls failed silently)
        // this.error = "Could not load any report card details.";
        console.warn("No report card details loaded despite available semesters.");
      } else if (this.availableSemesters.length === 0 && !this.error) {
        // This case should be handled earlier, but as a fallback:
        this.error = "No semesters available to display report cards.";
      }
      this.cdRef.markForCheck(); // Ensure UI updates
    });
  }

  onSemesterChange(newSemester: number): void {
    this.selectedSemester = newSemester;
    this.updateDisplayedCard();
  }

  private updateDisplayedCard(): void {
    if (this.selectedSemester !== null) {
      this.displayedReportCard = this.allReportCardData.find(rc => rc.semester === this.selectedSemester) || null;
    } else {
      this.displayedReportCard = null;
    }
    this.cdRef.markForCheck(); // Trigger UI update
  }

  private resetState(): void {
    this.allReportCardData = [];
    this.availableSemesters = [];
    this.selectedSemester = null;
    this.displayedReportCard = null;
  }
}