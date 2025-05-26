import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Observable, of, switchMap, tap, catchError, finalize, shareReplay, Subscription, BehaviorSubject, map } from 'rxjs';

import { AdminService } from '../../../services/admin.service';
import { PublicService } from '../../../services/public.service';
import { FeeWrite } from '../../../model/fee-write.mode';
import { Faculty } from '../../../model/faculty.model';

import { DynamicTableComponent } from '../../shared/dynamic-table/dynamic-table.component';
import { TableColumn } from '../../shared/dynamic-table/table-column.interface';
import { TableAction } from '../../shared/dynamic-table/table-action.interface';
import { DynamicFormComponent } from '../../shared/dynamic-form/dynamic-form.component';
import { FormConfig, FormFieldOption } from '../../shared/dynamic-form/form-config.interface';
import { Validators } from '@angular/forms';
import { AddButtonComponent } from '../../shared/add-button/add-button.component';

@Component({
  selector: 'app-admin-fee-sub-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DynamicTableComponent,
    DynamicFormComponent,
    AddButtonComponent
  ],
  templateUrl: './admin-fee-sub-dashboard.component.html',
  styleUrl: './admin-fee-sub-dashboard.component.scss',
  providers: [CurrencyPipe]
})
export class AdminFeeSubDashboardComponent implements OnInit, OnDestroy {
  private adminService = inject(AdminService);
  private publicService = inject(PublicService);
  private cdRef = inject(ChangeDetectorRef);
  private currencyPipe = inject(CurrencyPipe);

  private refreshTrigger = new BehaviorSubject<void>(undefined);

  faculties$: Observable<Faculty[]>;
  fees$: Observable<FeeWrite[]>;
  facultyOptions$: Observable<FormFieldOption[]>;
  private facultiesMap = new Map<number, string>();
  private subscriptions = new Subscription();

  selectedItem: FeeWrite | null = null;
  isEditing = false;
  isLoadingAction = false;
  isLoadingFees = false;
  isLoadingFaculties = false;
  error: string | null = null;

  tableColumns: TableColumn[] = [];
  tableActions: TableAction[] = [];

  feeFormConfig: FormConfig | null = null;

  get isLoading(): boolean {
    return this.isLoadingFees || this.isLoadingFaculties || this.isLoadingAction;
  }

  constructor() {
    this.faculties$ = this.refreshTrigger.pipe(
      tap(() => {
        this.isLoadingFaculties = true;
        this.error = null;
      }),
      switchMap(() => this.publicService.getFaculties().pipe(
        tap(faculties => {
          this.facultiesMap.clear();
          faculties.forEach(f => this.facultiesMap.set(f.id, f.name));
        }),
        catchError(_ => {
          this.error = 'Failed to load faculties.';
          this.facultiesMap.clear();
          return of([]);
        }),
        finalize(() => this.isLoadingFaculties = false)
      )),
      shareReplay(1)
    );

    this.facultyOptions$ = this.faculties$.pipe(
      map(faculties => faculties.map(f => ({ value: f.id, label: f.name } as FormFieldOption))),
      tap(options => {
        this.updateFormConfig(options);
      }),
      shareReplay(1)
    );

    this.fees$ = this.refreshTrigger.pipe(
      tap(() => {
        this.isLoadingFees = true;
        this.isLoadingAction = false;
      }),
      switchMap(() => this.adminService.getFees().pipe(
        catchError(err => {
          this.error = this.error ?? 'Failed to load fees.';
          return of([]);
        }),
        finalize(() => this.isLoadingFees = false)
      )),
      shareReplay(1)
    );

    this.setupTableConfiguration();
  }

  ngOnInit(): void {
    this.subscriptions.add(this.faculties$.subscribe());
    this.refreshData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  refreshData(): void {
    this.error = null;
    this.refreshTrigger.next();
  }

  private updateFormConfig(facultyOpts: FormFieldOption[]): void {
    const isEditingMode = !!this.selectedItem;
    this.feeFormConfig = {
      title: isEditingMode ? 'Edit Fee' : 'Add New Fee',
      fields: [
        { name: 'id', label: '', type: 'hidden', initialValue: this.selectedItem?.id ?? null },
        {
          name: 'description',
          label: 'Description',
          type: 'text',
          validators: [Validators.required],
          placeholder: 'Enter fee description',
          initialValue: this.selectedItem?.description ?? ''
        },
        {
          name: 'amount',
          label: 'Amount',
          type: 'number',
          validators: [Validators.required, Validators.min(0)],
          placeholder: 'Enter amount',
          initialValue: this.selectedItem?.amount ?? null
        },
        {
          name: 'facultyId',
          label: 'Faculty',
          type: 'select',
          options: facultyOpts,
          validators: [Validators.required],
          placeholder: '-- Select Faculty --',
          initialValue: this.selectedItem?.facultyId ?? null
        }
      ]
    };
    this.cdRef.markForCheck();
  }

  private setupTableConfiguration(): void {
    this.tableColumns = [
      { key: 'description', header: 'Description', type: 'string', isSortable: true },
      {
        key: 'amount',
        header: 'Amount',
        displayFn: (item) => this.currencyPipe.transform(item?.amount, 'PLN', 'symbol', '1.2-2', 'pl-PL') ?? 'N/A',
        type: 'number',
        isSortable: true
      },
      {
        key: 'facultyId',
        header: 'Faculty',
        displayFn: (item) => this.getFacultyName(item?.facultyId),
        type: 'string',
        isSortable: true
      }
    ];

    this.tableActions = [
      { actionId: 'edit', label: 'Edit', buttonClass: 'button button-edit', title: 'Edit Fee' },
      { actionId: 'delete', label: 'Delete', buttonClass: 'button button-danger', title: 'Delete Fee' }
    ];
  }

  private getFacultyName(facultyId: number | null | undefined): string {
    if (facultyId === null || facultyId === undefined) {
      return 'N/A';
    }
    return this.facultiesMap.get(facultyId) || (this.isLoadingFaculties ? 'Loading...' : 'Unknown');
  }

  handleTableAction(event: { actionId: string; item: FeeWrite; itemId: number }): void {
    switch (event.actionId) {
      case 'edit':
        this.selectItemToEdit(event.item);
        break;
      case 'delete':
        this.deleteFee(event.item.id);
        break;
    }
  }

  selectItemToEdit(fee: FeeWrite): void {
    this.selectedItem = { ...fee };
    this.isEditing = true;
    this.error = null;
    const sub = this.facultyOptions$.subscribe(opts => this.updateFormConfig(opts));
    sub.unsubscribe();
  }

  initNewFee(): void {
    this.selectedItem = null;
    this.isEditing = true;
    this.error = null;
    const sub = this.facultyOptions$.subscribe(opts => this.updateFormConfig(opts));
    sub.unsubscribe();
  }

  cancelEdit(): void {
    this.selectedItem = null;
    this.isEditing = false;
    this.error = null;
    this.isLoadingAction = false;
    this.cdRef.detectChanges();
  }

  saveFee(formData: FeeWrite): void {
    const dataToSave: FeeWrite = {
      ...formData,
      id: this.selectedItem?.id ?? null
    };

    if (dataToSave.facultyId === null || dataToSave.facultyId === undefined) {
      this.error = "Please select a valid faculty.";
      return;
    }

    this.isLoadingAction = true;
    this.error = null;

    let operation$: Observable<FeeWrite>;
    const isUpdating = dataToSave.id !== null;

    if (isUpdating) {
      operation$ = this.adminService.updateFee(dataToSave.id!, dataToSave);
    } else {
      operation$ = this.adminService.addFee(dataToSave);
    }

    this.subscriptions.add(
      operation$.pipe(
        tap(() => {
          this.refreshData();
          this.cancelEdit();
        }),
        catchError(err => {
          console.error(`Error ${isUpdating ? 'updating' : 'adding'} fee:`, err);
          this.error = `Failed to ${isUpdating ? 'update' : 'add'} fee. ${err?.error?.message || ''}`.trim();
          return of(null);
        }),
        finalize(() => {
          this.isLoadingAction = false;
          this.cdRef.detectChanges();
        })
      ).subscribe()
    );
  }

  deleteFee(feeId: number | null): void {
    if (feeId === null || !confirm('Are you sure you want to delete this fee?')) {
      return;
    }
    this.isLoadingAction = true;
    this.error = null;

    this.subscriptions.add(
      this.adminService.deleteFee(feeId).pipe(
        tap(() => {
          this.refreshData();
          if (this.selectedItem?.id === feeId) {
            this.cancelEdit();
          }
        }),
        catchError(err => {
          this.error = `Failed to delete fee. ${err?.error?.message || ''}`.trim();
          return of(null);
        }),
        finalize(() => {
          this.isLoadingAction = false;
          this.cdRef.detectChanges();
        })
      ).subscribe()
    );
  }
}
