import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentBankAccountView } from '../../../model/student-back-account.model';
import { StudentService } from '../../../services/student.service';
import { catchError, tap, EMPTY, take, lastValueFrom, Subscription, finalize, of } from 'rxjs';

// Import Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-student-bank-account',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './student-bank-account.component.html',
  styleUrls: ['./student-bank-account.component.scss']
})
export class StudentBankAccountComponent implements OnInit, OnDestroy {
  private studentService = inject(StudentService);
  private cdRef = inject(ChangeDetectorRef); // Inject ChangeDetectorRef
  private indexSubscription: Subscription | null = null;
  private updateSubscription: Subscription | null = null;

  bankAccountData: StudentBankAccountView | null = null;
  studentIndexValue: string | null = null; // To store the index for update operations

  editMode = false;
  originalWithdrawalAccount: string | null | undefined = '';
  isLoadingData = false;
  isSaving = false;
  fetchError: string | null = null;
  saveErrorMessage: string | null = null;
  isWithdrawalAccountValid: boolean = true;
  validationErrorMessage: string | null = null;

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.indexSubscription?.unsubscribe();
    this.updateSubscription?.unsubscribe();
  }

  private async fetchBankAccountDetails(index: string): Promise<void> {
    try {
      const data = await lastValueFrom(
        this.studentService.getStudentBankAccounts(index).pipe(
          catchError(err => {
            this.fetchError = "Failed to load bank account data.";
            this.bankAccountData = null;
            return of(null); // Resolve with null on error
          })
        )
      );
      this.bankAccountData = data;
      if (data) {
        this.originalWithdrawalAccount = data.withdrawalAccount;
        this.validateWithdrawalAccount(data.withdrawalAccount);
      } else if (!this.fetchError) {
        this.fetchError = "Bank account information could not be retrieved.";
      }
    } catch (err) {
      if (!this.fetchError) {
        this.fetchError = "An unexpected error occurred while fetching bank account data.";
      }
      this.bankAccountData = null;
    }
  }

  loadInitialData(): void {
    this.isLoadingData = true;
    this.fetchError = null;
    this.bankAccountData = null;
    this.cdRef.markForCheck();

    this.indexSubscription = this.studentService.studentIndex$.pipe(
      take(1) // Take the first valid index
    ).subscribe(async (index) => {
      this.studentIndexValue = index; // Store the index

      if (!index) {
        this.fetchError = "Student index not available. Cannot load bank account data.";
        this.isLoadingData = false;
        this.cdRef.markForCheck();
        return;
      }

      try {
        await this.fetchBankAccountDetails(index);
      } finally {
        this.isLoadingData = false;
        this.cdRef.markForCheck();
      }
    },
      (err) => { // Error callback for studentIndex$ observable itself
        this.fetchError = "Failed to obtain student index for loading bank account data.";
        this.isLoadingData = false;
        this.cdRef.markForCheck();
      });
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    this.saveErrorMessage = null;
    this.validationErrorMessage = null;
    this.isWithdrawalAccountValid = true;

    if (this.editMode) {
      // originalWithdrawalAccount is already set from loadData or successful save
    } else if (!this.isSaving) {
      if (this.bankAccountData) {
        this.bankAccountData.withdrawalAccount = this.originalWithdrawalAccount || '';
      }
      this.validateWithdrawalAccount(this.bankAccountData?.withdrawalAccount);
    }
    this.cdRef.markForCheck();
  }

  validateWithdrawalAccount(accountNumber: string | null | undefined): void {
    this.validationErrorMessage = null;
    this.isWithdrawalAccountValid = true;
    const value = accountNumber?.trim() || '';

    if (!value) {
      return;
    }
    if (!/^\d+$/.test(value)) {
      this.validationErrorMessage = 'Account number must contain only digits.';
      this.isWithdrawalAccountValid = false;
      return;
    }
    if (value.length !== 26) {
      this.validationErrorMessage = 'Account number must be exactly 26 digits long.';
      this.isWithdrawalAccountValid = false;
      return;
    }
  }

  saveWithdrawalAccount(): void {
    this.validateWithdrawalAccount(this.bankAccountData?.withdrawalAccount);
    if (!this.isWithdrawalAccountValid || this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.saveErrorMessage = null;
    this.cdRef.markForCheck();

    const indexToUse = this.studentIndexValue;

    if (!this.bankAccountData) {
      this.saveErrorMessage = 'Bank account data is not available.';
      this.isSaving = false;
      this.cdRef.markForCheck();
      return;
    }

    if (!indexToUse) {
      this.saveErrorMessage = 'Student identifier is missing. Cannot save.';
      this.isSaving = false;
      this.cdRef.markForCheck();
      return;
    }

    const dataToSend: StudentBankAccountView = {
      depositAccount: this.bankAccountData.depositAccount || '',
      withdrawalAccount: this.bankAccountData.withdrawalAccount?.trim() || ''
    };

    this.updateSubscription = this.studentService.updateBankAccount(indexToUse, dataToSend).pipe(
      tap((updatedData) => {
        this.bankAccountData = updatedData;
        this.originalWithdrawalAccount = updatedData.withdrawalAccount;
        this.editMode = false;
        this.saveErrorMessage = null;
      }),
      catchError((error) => {
        this.saveErrorMessage = 'Failed to update withdrawal account. Please try again.';
        return EMPTY;
      }),
      finalize(() => {
        this.isSaving = false;
        this.cdRef.markForCheck();
      })
    ).subscribe();
  }
}
