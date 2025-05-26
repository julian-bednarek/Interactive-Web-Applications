import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of, BehaviorSubject, Subscription, switchMap, tap, catchError, finalize, shareReplay, map } from 'rxjs';

import { AdminService } from '../../../services/admin.service';
import { SubjectWrite } from '../../../model/subject-write.model';
import { TeacherWrite } from '../../../model/teacher-write.model';
import { DynamicTableComponent } from '../../shared/dynamic-table/dynamic-table.component';
import { TableColumn } from '../../shared/dynamic-table/table-column.interface';
import { TableAction } from '../../shared/dynamic-table/table-action.interface';
import { DynamicFormComponent } from '../../shared/dynamic-form/dynamic-form.component';
import { FormConfig, FormFieldOption, FormField } from '../../shared/dynamic-form/form-config.interface';
import { Validators } from '@angular/forms';
import { AddButtonComponent } from '../../shared/add-button/add-button.component';

@Component({
  selector: 'app-admin-subject-sub-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DynamicTableComponent,
    DynamicFormComponent,
    AddButtonComponent
  ],
  templateUrl: './admin-subject-sub-dashboard.component.html',
  styleUrl: './admin-subject-sub-dashboard.component.scss'
})
export class AdminSubjectSubDashboardComponent implements OnInit, OnDestroy {
  private adminService = inject(AdminService);
  private cdRef = inject(ChangeDetectorRef);

  private refreshTrigger = new BehaviorSubject<void>(undefined);
  private subscriptions = new Subscription();

  subjects$: Observable<SubjectWrite[]>;
  teachers$: Observable<TeacherWrite[]>;
  teacherOptions$: Observable<FormFieldOption[]>;
  selectedItem: SubjectWrite | null = null;
  isEditing = false;
  isLoadingSubjects = false;
  isLoadingTeachers = false;
  isLoadingAction = false;
  error: string | null = null;

  tableColumns: TableColumn[] = [];
  tableActions: TableAction[] = [];
  subjectFormConfig: FormConfig | null = null;

  get isLoading(): boolean {
    return this.isLoadingSubjects || this.isLoadingTeachers || this.isLoadingAction;
  }

  constructor() {
    this.teachers$ = this.refreshTrigger.pipe(
      tap(() => {
        this.isLoadingTeachers = true;
        this.error = null;
      }),
      switchMap(() => this.adminService.getTeachers().pipe(
        catchError(err => {
          this.error = `Failed to load teachers. ${err?.error?.message || ''}`.trim();
          return of([]); // Return empty array on error
        }),
        finalize(() => this.isLoadingTeachers = false)
      )),
      shareReplay(1)
    );

    this.teacherOptions$ = this.teachers$.pipe(
      map(teachers => teachers
        .filter(t => t.id != null)
        .map(t => ({
          value: t.id,
          label: `${t.academicTitle} ${t.firstName} ${t.lastName}`
        } as FormFieldOption))
      ),
      tap(options => {
        this.updateFormConfig(options);
      }),
      shareReplay(1)
    );
    this.subjects$ = this.refreshTrigger.pipe(
      tap(() => {
        this.isLoadingSubjects = true;
        this.isLoadingAction = false;
      }),
      switchMap(() => this.adminService.getSubjects().pipe(
        catchError(err => {
          if (!this.error) {
            this.error = `Failed to load subjects. ${err?.error?.message || ''}`.trim();
          }
          return of([]);
        }),
        finalize(() => this.isLoadingSubjects = false)
      )),
      shareReplay(1)
    );

    this.setupTableConfiguration();
    this.updateFormConfig([]);
  }

  ngOnInit(): void {
    this.subscriptions.add(this.teacherOptions$.subscribe());
    this.refreshData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  refreshData(): void {
    this.error = null;
    this.refreshTrigger.next();
  }

  private updateFormConfig(teacherOpts: FormFieldOption[]): void {
    const isEditingMode = !!this.selectedItem;
    const title = isEditingMode ? 'Edit Subject' : 'Add New Subject';

    const fields: FormField[] = [
      {
        name: 'code',
        label: 'Subject Code',
        type: isEditingMode ? 'hidden' : 'text',
        validators: [Validators.required, Validators.pattern('^[a-zA-Z0-9_-]+$')],
        placeholder: 'Enter unique subject code',
        initialValue: this.selectedItem?.code ?? ''
      },
      {
        name: 'name',
        label: 'Subject Name',
        type: 'text',
        validators: [Validators.required],
        placeholder: 'Enter subject name',
        initialValue: this.selectedItem?.name ?? ''
      },
      {
        name: 'ects',
        label: 'ECTS Points',
        type: 'number',
        validators: [Validators.required, Validators.min(0)],
        placeholder: 'Enter ECTS points',
        initialValue: this.selectedItem?.ects ?? null
      },
      {
        name: 'teacherId',
        label: 'Teacher',
        type: 'select',
        options: teacherOpts,
        validators: [Validators.required],
        placeholder: '-- Select Teacher --',
        initialValue: this.selectedItem?.teacherId ?? null
      }
    ];
    if (isEditingMode && this.selectedItem?.code) {
      fields.splice(1, 0, {
        name: 'displayCode',
        label: 'Subject Code',
        type: 'text',
        initialValue: this.selectedItem.code,
        hidden: false
      });
    }


    this.subjectFormConfig = {
      title: title,
      fields: fields
    };
    this.cdRef.markForCheck();
  }
  private setupTableConfiguration(): void {
    this.tableColumns = [
      { key: 'code', header: 'Code', type: 'string', isSortable: true },
      { key: 'name', header: 'Name', type: 'string', isSortable: true },
      { key: 'ects', header: 'ECTS', type: 'number', isSortable: true },
      {
        key: 'teacherId',
        header: 'Teacher',
        displayFn: (item) => this.getTeacherName(item?.teacherId) ?? 'N/A',
        type: 'string',
        isSortable: true
      }
    ];

    this.tableActions = [
      { actionId: 'edit', label: 'Edit', buttonClass: 'button button-edit', title: 'Edit Subject' },
      { actionId: 'delete', label: 'Delete', buttonClass: 'button button-danger', title: 'Delete Subject' }
    ];
  }
  private getTeacherName(teacherId: number | null | undefined): string | null {
    if (teacherId === null || teacherId === undefined) return 'N/A';
    const teacherField = this.subjectFormConfig?.fields.find(f => f.name === 'teacherId');
    const option = teacherField?.options?.find(opt => opt.value === teacherId);
    return option ? option.label : `ID: ${teacherId}`; // Fallback to ID
  }
  handleTableAction(event: { actionId: string; item: SubjectWrite; itemId: string }): void {
    console.log('Subject Table action:', event);
    switch (event.actionId) {
      case 'edit':
        this.selectItemToEdit(event.item);
        break;
      case 'delete':
        this.deleteSubject(event.item.code);
        break;
      default:
        console.warn('Unhandled subject table action:', event.actionId);
    }
  }

  selectItemToEdit(subject: SubjectWrite): void {
    this.selectedItem = { ...subject };
    this.isEditing = true;
    this.error = null;
    const sub = this.teacherOptions$.subscribe(opts => this.updateFormConfig(opts));
    sub.unsubscribe();
  }

  initNewSubject(): void {
    this.selectedItem = null;
    this.isEditing = true;
    this.error = null;
    const sub = this.teacherOptions$.subscribe(opts => this.updateFormConfig(opts));
    sub.unsubscribe();
  }

  cancelEdit(): void {
    this.selectedItem = null;
    this.isEditing = false;
    this.error = null;
    this.isLoadingAction = false;
    this.cdRef.markForCheck();
  }

  saveSubject(formData: SubjectWrite): void {
    const dataToSave = { ...formData };

    if (!dataToSave.code || !dataToSave.name || dataToSave.ects == null || !dataToSave.teacherId) {
      this.error = "Please fill all required fields.";
      return;
    }
    if (dataToSave.teacherId === 0) {
      this.error = "Please select a valid teacher.";
      return;
    }

    this.isLoadingAction = true;
    this.error = null;
    const isUpdating = !!this.selectedItem;
    let operation$: Observable<SubjectWrite>;

    console.log(`Saving Subject (${isUpdating ? 'Update' : 'Add'}):`, dataToSave);

    if (isUpdating) {
      const originalCode = this.selectedItem!.code;
      operation$ = this.adminService.updateSubject(originalCode, dataToSave);
    } else {
      operation$ = this.adminService.addSubject(dataToSave);
    }

    this.subscriptions.add(
      operation$.pipe(
        tap((_) => {
          this.refreshData();
          this.cancelEdit();
        }),
        catchError(err => {
          const action = isUpdating ? 'update' : 'add';
          this.error = `Failed to ${action} subject. ${err?.error?.message || 'Check details or code uniqueness.'}`.trim();
          return of(null); // Keep stream alive
        }),
        finalize(() => {
          this.isLoadingAction = false;
          this.cdRef.markForCheck();
        })
      ).subscribe()
    );
  }

  deleteSubject(subjectCode: string | null): void {
    if (!subjectCode || !confirm('Are you sure you want to delete this subject?')) {
      return;
    }

    this.isLoadingAction = true;
    this.error = null;

    this.subscriptions.add(
      this.adminService.deleteSubject(subjectCode).pipe(
        tap(() => {
          this.refreshData();
          if (this.selectedItem?.code === subjectCode) {
            this.cancelEdit();
          }
        }),
        catchError(err => {
          this.error = `Failed to delete subject. ${err?.error?.message || 'Server error'}`.trim();
          return of(null);
        }),
        finalize(() => {
          this.isLoadingAction = false;
          this.cdRef.markForCheck();
        })
      ).subscribe()
    );
  }
}
