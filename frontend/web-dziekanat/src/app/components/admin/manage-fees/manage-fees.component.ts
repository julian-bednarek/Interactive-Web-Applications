import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, Subscription, of, throwError } from 'rxjs';
import { catchError, finalize, startWith, switchMap, tap, map } from 'rxjs/operators';

import { AdminService } from '../../../services/admin.service';
import { StudentWrite } from '../../../model/student-write.model';
import { FeeWrite } from '../../../model/fee-write.mode';
import { Payments } from '../../../model/payments.model';
import { FeeRead } from '../../../model/fee-read.model';

@Component({
  selector: 'app-manage-fees',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './manage-fees.component.html',
  styleUrls: ['./manage-fees.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ManageFeesComponent implements OnInit, OnDestroy {
  @Input({ required: true }) student!: StudentWrite;
  @Output() close = new EventEmitter<void>();

  private adminService = inject(AdminService);
  private subscriptions = new Subscription();
  private reloadStudentFees = new Subject<void>();

  currentFees: FeeRead[] = [];
  allFeeDefinitions: FeeWrite[] = [];
  availableFeesToAdd: FeeWrite[] = [];
  selectedFeeIdToAdd: number | null = null;

  isLoadingCurrent = false;
  isLoadingAll = false;
  isUpdating = false;
  error: string | null = null;

  ngOnInit(): void {
    if (!this.student?.indexNumber) {
      this.error = "Critical Error: Student index number is missing.";
      return;
    }
    this.loadAllFeeDefinitions();
    this.subscriptions.add(
      this.reloadStudentFees.pipe(
        startWith(null),
        tap(() => {
          this.isLoadingCurrent = true;
          this.error = null;
        }),
        switchMap(() => {
          return this.adminService.getStudentFees(this.student.indexNumber).pipe(
            map((data: Payments): FeeRead[] => {
              const fees = data.fees || [];
              return fees.map(fee => ({
                ...fee
              }));
            }),
            catchError(_ => {
              this.error = 'Failed to load student\'s fees.';
              return of([] as FeeRead[]);
            }),
            finalize(() => {
              this.isLoadingCurrent = false;
            }));
        }),
        tap((studentFees) => {
          this.currentFees = studentFees;
          this.filterAvailableFees();
        })
      ).subscribe({
        error: (_) => {
          if (!this.error) {
            this.error = 'An unexpected error occurred while processing fee data.';
          }
          this.isLoadingCurrent = false;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.reloadStudentFees.complete();
  }

  private loadAllFeeDefinitions(): void {
    this.isLoadingAll = true;
    this.error = null;
    this.subscriptions.add(
      this.adminService.getFees().pipe(
        catchError(_ => {
          this.error = 'Failed to load available fee definitions.';
          return of([] as FeeWrite[]);
        }),
        finalize(() => {
          this.isLoadingAll = false;
        })
      ).subscribe(allFees => {
        this.allFeeDefinitions = allFees;
        this.filterAvailableFees();
      })
    );
  }

  private filterAvailableFees(): void {
    if (!this.allFeeDefinitions) {
      this.availableFeesToAdd = [];
      return;
    }
    const currentFeeIds = new Set(this.currentFees.map(f => f.id));
    this.availableFeesToAdd = this.allFeeDefinitions.filter(f => f.id !== null && !currentFeeIds.has(f.id));
    this.selectedFeeIdToAdd = null;
  }

  addSelectedFee(): void {
    if (!this.selectedFeeIdToAdd || this.isUpdating || !this.student?.indexNumber) {
      this.error = 'Select a fee to add.';
      return;
    }

    this.isUpdating = true;
    this.error = null;
    const feeIdToAdd = this.selectedFeeIdToAdd;

    this.subscriptions.add(
      this.adminService.assignFeeToStudent(this.student.indexNumber, feeIdToAdd).pipe(
        tap(() => {
          this.reloadStudentFees.next();
        }),
        catchError(err => {
          this.error = `Failed to add fee. ${err?.error?.message || 'Server error'}`.trim();
          return throwError(() => err);
        }),
        finalize(() => {
          this.isUpdating = false;
        })
      ).subscribe()
    );
  }

  removeFee(feeId: number | null): void {
    if (feeId === null || this.isUpdating || !this.student?.indexNumber || !confirm('Are you sure you want to remove this fee assignment?')) {
      return;
    }

    this.isUpdating = true;
    this.error = null;
    this.subscriptions.add(
      this.adminService.removeFeeFromStudent(this.student.indexNumber, feeId).pipe(
        tap(() => {
          this.reloadStudentFees.next();
        }),
        catchError(err => {
          this.error = `Failed to remove fee. ${err?.error?.message || 'Server error'}`.trim();
          return throwError(() => err);
        }),
        finalize(() => {
          this.isUpdating = false;
        })
      ).subscribe()
    );
  }

  markAsPaid(feeId: number | null): void {
    if (feeId === null || this.isUpdating || !this.student?.indexNumber) {
      return;
    }
    this.isUpdating = true;
    this.error = null;

    this.subscriptions.add(
      this.adminService.setFeePaid(this.student.indexNumber, feeId).pipe(
        tap(() => {
          this.reloadStudentFees.next();
        }),
        catchError(err => {
          this.error = `Failed to mark fee as paid. ${err?.error?.message || 'Server error'}`.trim();
          return throwError(() => err);
        }),
        finalize(() => {
          this.isUpdating = false;
        })
      ).subscribe()
    );
  }


  closeModal(): void {
    this.close.emit();
  }
  get isLoading(): boolean {
    return this.isLoadingCurrent || this.isLoadingAll;
  }
} 