import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Subscription, of, throwError, lastValueFrom } from 'rxjs'; // Added lastValueFrom
import { catchError, tap, take } from 'rxjs/operators'; // Added take

import { FieldOfStudyRead } from '../../../model/field-of-study-read.model';
import { GeneralStudyInfo } from '../../../model/general-study.model';
import { StudentService } from '../../../services/student.service';
import { SnakeToNormalCasePipe } from '../../../pipes/snake-to-normal-case.pipe';

@Component({
  selector: 'app-student-field-of-study',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    SnakeToNormalCasePipe
  ],
  templateUrl: './student-field-of-study.component.html',
  styleUrls: ['./student-field-of-study.component.scss']
})
export class StudentFieldOfStudyComponent implements OnInit, OnDestroy {
  private studentService = inject(StudentService);
  private cdRef = inject(ChangeDetectorRef);
  private indexSubscription: Subscription | null = null;

  fieldOfStudyData: FieldOfStudyRead | null = null;
  generalInfo: GeneralStudyInfo | null = null;

  isLoading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.initiateDataLoad();
  }

  ngOnDestroy(): void {
    this.indexSubscription?.unsubscribe();
  }

  private async fetchFieldOfStudyData(index: string): Promise<void> {
    try {
      const fosData = await lastValueFrom(
        this.studentService.getFieldOfStudyData(index).pipe(
          catchError(err => {
            this.error = (this.error ? this.error + " | " : "") + "Failed to load field of study details.";
            this.fieldOfStudyData = null;
            return of(null); // Resolve with null on error
          })
        )
      );
      this.fieldOfStudyData = fosData;
    } catch (err) {
      // This catch is for unexpected errors not handled by the inner pipe's catchError
      if (!this.error) { // Avoid overwriting more specific error
        this.error = (this.error ? this.error + " | " : "") + "An error occurred while fetching field of study details.";
      }
      this.fieldOfStudyData = null;
    }
  }

  private async fetchGeneralInfoData(index: string): Promise<void> {
    try {
      const giData = await lastValueFrom(
        this.studentService.getGeneralStudyInfo(index).pipe(
          catchError(err => {
            this.error = (this.error ? this.error + " | " : "") + "Failed to load general study info.";
            this.generalInfo = null;
            return of(null); // Resolve with null on error
          })
        )
      );
      this.generalInfo = giData;
    } catch (err) {
      if (!this.error) {
        this.error = (this.error ? this.error + " | " : "") + "An error occurred while fetching general study info.";
      }
      this.generalInfo = null;
    }
  }

  initiateDataLoad(): void {
    this.isLoading = true;
    this.error = null;
    this.fieldOfStudyData = null;
    this.generalInfo = null;
    this.cdRef.markForCheck();

    this.indexSubscription = this.studentService.studentIndex$.pipe(
      take(1) // Take the first valid index and then unsubscribe from studentIndex$ for this load operation
    ).subscribe(async (index) => {
      if (!index) {
        this.error = "Student index not available. Cannot load data.";
        this.isLoading = false;
        this.cdRef.markForCheck();
        return;
      }

      // Perform fetches. Promise.all ensures both complete before we finalize loading state.
      try {
        await Promise.all([
          this.fetchFieldOfStudyData(index),
          this.fetchGeneralInfoData(index)
        ]);
      } catch (overallError) {
        // This catch is unlikely to be hit if individual fetches handle their errors
        // and resolve to null, but it's a safeguard.
        if (!this.error) {
          this.error = "An unexpected error occurred during data loading.";
        }
      } finally {
        this.isLoading = false;
        if (!this.fieldOfStudyData && !this.generalInfo && !this.error) {
          this.error = "Field of study information could not be loaded at this time.";
        }
        this.cdRef.markForCheck();
      }
    },
      (err) => { // Error callback for studentIndex$ observable itself
        this.error = "Failed to obtain student index for data loading.";
        this.isLoading = false;
        this.cdRef.markForCheck();
      });
  }
}
