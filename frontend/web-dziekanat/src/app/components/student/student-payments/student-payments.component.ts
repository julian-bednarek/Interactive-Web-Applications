import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'; // Added OnInit, OnDestroy, ChangeDetectorRef
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { Payments } from '../../../model/payments.model';
import { GeneralStudyInfo } from '../../../model/general-study.model'; // Need GeneralStudyInfo
import { DynamicTableComponent } from '../../shared/dynamic-table/dynamic-table.component';
import { TableColumn } from '../../shared/dynamic-table/table-column.interface';
import { SemesterSelectorComponent } from '../../shared/semester-selector/semester-selector.component';
import { StudentService } from '../../../services/student.service';
import { Subscription, of, EMPTY, forkJoin, throwError } from 'rxjs'; // Added Subscription, of, EMPTY, forkJoin
import { catchError, finalize, switchMap, tap } from 'rxjs/operators';

interface TransformedFee {
  description: string;
  amountDisplay: string | null;
  statusDisplay: string;
  originalAmount?: number;
  originalPaid?: boolean;
  id?: number; // Include ID if needed for tracking/keying
}

@Component({
  selector: 'app-student-payments',
  standalone: true,
  imports: [CommonModule, DynamicTableComponent, SemesterSelectorComponent],
  providers: [CurrencyPipe, DecimalPipe], // Keep providers
  templateUrl: './student-payments.component.html',
  styleUrls: ['./student-payments.component.scss']
})
export class StudentPaymentsComponent implements OnInit, OnDestroy {
  // Remove @Input
  // @Input() studentIndex: string | null = null;
  // @Input() availableSemesters: number[] = [];

  private currencyPipe = inject(CurrencyPipe);
  private studentService = inject(StudentService);
  private cdRef = inject(ChangeDetectorRef);
  private dataSubscription: Subscription | null = null;

  paymentsData: Payments | null = null;
  transformedFees: TransformedFee[] = [];
  availableSemesters: number[] = []; // Will be fetched
  selectedSemester: number | null = null;
  studentIndexValue: string | null = null;

  isLoading = false; // Combined loading state
  error: string | null = null;

  feeTableColumns: TableColumn[] = [
    { key: 'description', header: 'Description', type: 'string' },
    { key: 'amountDisplay', header: 'Amount', type: 'number' }, // Keep type number for potential sorting
    { key: 'statusDisplay', header: 'Status', type: 'string' },
  ];

  ngOnInit(): void {
    this.loadInitialData(); // Load available semesters first
  }

  ngOnDestroy(): void {
    this.dataSubscription?.unsubscribe();
  }

  loadInitialData(): void {
    this.isLoading = true;
    this.error = null;
    this.resetState();

    this.dataSubscription = this.studentService.studentIndex$.pipe(
      tap(index => this.studentIndexValue = index),
      switchMap(index => {
        if (!index) {
          this.error = "Student index not available.";
          return EMPTY;
        }
        // Fetch general info to get semesters
        return this.studentService.getGeneralStudyInfo(index).pipe(
          catchError(err => {
            console.error("Error fetching general info for payments:", err);
            this.error = "Failed to load semester information for payments.";
            return throwError(() => new Error("Failed to load general info"));
          })
        );
      }),
      tap(generalInfo => {
        if (generalInfo && generalInfo.currentSemester > 0) {
          this.availableSemesters = Array.from({ length: generalInfo.currentSemester }, (_, i) => i + 1).sort((a, b) => b - a);
          if (this.availableSemesters.length > 0) {
            this.selectedSemester = this.availableSemesters[0]; // Select latest semester
            this.fetchPaymentsData(); // Fetch payments for the default semester
          } else {
            this.error = "No available semesters found.";
            this.isLoading = false; // Stop loading if no semesters
          }
        } else {
          this.error = this.error || "Could not determine available semesters.";
          this.isLoading = false; // Stop loading
        }
      }),
      catchError(err => { // Catch errors from index or general info fetch
        console.error("Payments: Error in initial data fetch:", err);
        if (!this.error) { this.error = "Failed to load necessary information for payments."; }
        this.resetState();
        this.isLoading = false;
        this.cdRef.markForCheck();
        return EMPTY; // Stop the stream
      })
      // No need for finalize here as fetchPaymentsData handles its own loading
    ).subscribe(); // Subscribe to trigger the initial load
  }


  onSemesterChange(newSemester: number): void {
    this.selectedSemester = newSemester;
    this.fetchPaymentsData();
  }

  fetchPaymentsData(): void {
    // Unsubscribe from previous payment fetch if any
    // this.paymentSubscription?.unsubscribe(); // Already handled by dataSubscription structure?

    if (!this.studentIndexValue || this.selectedSemester === null) {
      this.error = "Student index or semester not selected.";
      this.transformedFees = [];
      this.paymentsData = null;
      this.isLoading = false; // Ensure loading stops if prerequisites aren't met
      this.cdRef.markForCheck();
      return;
    }

    this.isLoading = true; // Start loading for payment fetch
    this.error = null;
    this.transformedFees = [];
    this.paymentsData = null;

    // Replace previous subscription logic with direct call within the main subscription flow
    this.studentService.getPayments(this.studentIndexValue, this.selectedSemester)
      .pipe(
        catchError(err => {
          console.error(`Error fetching payments for semester ${this.selectedSemester}:`, err);
          this.error = `Could not load payment data for semester ${this.selectedSemester}.`;
          this.paymentsData = null; // Ensure data is reset
          this.transformedFees = [];
          return of(null); // Return null to continue the stream if needed, or throwError
        }),
        finalize(() => {
          this.isLoading = false; // Stop loading after payment fetch attempt
          this.cdRef.markForCheck(); // Trigger UI update
        })
      )
      .subscribe(data => {
        this.paymentsData = data;
        this.transformFeeData();
        if (!data && !this.error) {
          // Handle case where API returns null/empty without error
          console.log(`No payment data returned for semester ${this.selectedSemester}.`);
        }
      });
  }

  private transformFeeData(): void {
    if (this.paymentsData && this.paymentsData.fees) {
      this.transformedFees = this.paymentsData.fees.map(fee => ({
        id: fee.id, // Include ID for potential trackBy in table
        description: fee.description,
        amountDisplay: this.currencyPipe.transform(fee.amount, 'PLN', 'symbol', '1.2-2', 'pl-PL'),
        statusDisplay: fee.paid ? 'Paid' : 'Unpaid',
        originalAmount: fee.amount,
        originalPaid: fee.paid
      }));
    } else {
      this.transformedFees = [];
    }
    this.cdRef.markForCheck(); // Ensure table updates
  }

  private resetState(): void {
    this.paymentsData = null;
    this.transformedFees = [];
    this.availableSemesters = [];
    this.selectedSemester = null;
    // Don't reset studentIndexValue here
  }
}