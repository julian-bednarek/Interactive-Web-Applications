import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Observable, BehaviorSubject, Subscription, switchMap, catchError, of, finalize, tap, map, shareReplay, firstValueFrom } from 'rxjs';

import { AdminService } from '../../../services/admin.service';
import { PublicService } from '../../../services/public.service';
import { FieldOfStudyWrite } from '../../../model/field-of-study-write.model';
import { FieldOfStudyRead } from '../../../model/field-of-study-read.model';
import { Faculty } from '../../../model/faculty.model';

import { DynamicTableComponent } from '../../shared/dynamic-table/dynamic-table.component';
import { TableColumn } from '../../shared/dynamic-table/table-column.interface';
import { TableAction } from '../../shared/dynamic-table/table-action.interface';
import { DynamicFormComponent } from '../../shared/dynamic-form/dynamic-form.component';
import { FormConfig, FormFieldOption } from '../../shared/dynamic-form/form-config.interface';
import { Validators } from '@angular/forms';
import { AddButtonComponent } from '../../shared/add-button/add-button.component';

enum Degree {
  BACHELOR = 'Bachelor',
  MASTER = 'Master',
  DOCTORAL = 'Doctoral'
}

enum FormOfStudy {
  FULL_TIME = 'Full-time',
  PART_TIME = 'Part-time'
}

@Component({
  selector: 'app-admin-fos-sub-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DynamicTableComponent,
    DynamicFormComponent,
    AddButtonComponent
  ],
  templateUrl: './admin-fos-sub-dashboard.component.html',
  styleUrls: ['./admin-fos-sub-dashboard.component.scss'],
  providers: [TitleCasePipe]
})
export class AdminFosSubDashboardComponent implements OnInit, OnDestroy {

  private adminService = inject(AdminService);
  private publicService = inject(PublicService);
  private cdRef = inject(ChangeDetectorRef);

  private refreshTrigger = new BehaviorSubject<void>(undefined);
  private subscriptions = new Subscription();

  fieldsOfStudy$: Observable<FieldOfStudyRead[]>;
  faculties$: Observable<Faculty[]>;
  facultyOptions$: Observable<FormFieldOption[]>;

  selectedItem: FieldOfStudyWrite | null = null;
  isEditing = false;

  isLoadingFos = false;
  isLoadingFaculties = false;
  isLoadingAction = false;
  error: string | null = null;
  facultyError: string | null = null;

  tableColumns: TableColumn[] = [];
  tableActions: TableAction[] = [];

  fosFormConfig: FormConfig | null = null;

  degreeOptions: FormFieldOption[] = Object.keys(Degree).map(key => ({ value: key, label: Degree[key as keyof typeof Degree] }));
  formOfStudyOptions: FormFieldOption[] = Object.keys(FormOfStudy).map(key => ({ value: key, label: FormOfStudy[key as keyof typeof FormOfStudy] }));

  get isLoading(): boolean {
    return this.isLoadingFos || this.isLoadingFaculties || this.isLoadingAction;
  }

  constructor() {
    this.faculties$ = this.refreshTrigger.pipe(
      tap(() => {
        this.isLoadingFaculties = true;
        this.error = null;
      }),
      switchMap(() => this.publicService.getFaculties().pipe(
        catchError(_ => {
          this.facultyError = 'Failed to load faculties for display/selection.';
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

    this.fieldsOfStudy$ = this.refreshTrigger.pipe(
      tap(() => {
        this.isLoadingFos = true;
        this.isLoadingAction = false;
      }),
      switchMap(() => this.adminService.getFieldsOfStudy().pipe(
        map(fosList => fosList as FieldOfStudyRead[]),
        catchError(err => {
          if (!this.error) {
            this.error = `Failed to load fields of study. ${err?.error?.message || ''}`.trim();
          }
          return of([]);
        }),
        finalize(() => this.isLoadingFos = false)
      )),
      shareReplay(1)
    );

    this.setupTableConfiguration();
    this.updateFormConfig([]);
  }

  ngOnInit(): void {
    this.subscriptions.add(this.facultyOptions$.subscribe());
    this.refreshData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.refreshTrigger.complete();
  }

  refreshData(): void {
    this.facultyError = null;
    this.error = null;
    this.refreshTrigger.next();
  }

  private updateFormConfig(facultyOpts: FormFieldOption[]): void {
    const isEditingMode = !!this.selectedItem;
    const title = isEditingMode ? 'Edit Field of Study' : 'Add New Field of Study';

    this.fosFormConfig = {
      title: title,
      fields: [
        { name: 'fieldOfStudyId', label: 'ID', type: 'hidden', initialValue: this.selectedItem?.fieldOfStudyId ?? null },
        {
          name: 'facultyId',
          label: 'Faculty',
          type: 'select',
          options: facultyOpts,
          validators: [Validators.required],
          placeholder: '-- Select Faculty --',
          initialValue: this.selectedItem?.facultyId ?? null
        },
        {
          name: 'name',
          label: 'Name',
          type: 'text',
          validators: [Validators.required],
          placeholder: 'Enter field of study name',
          initialValue: this.selectedItem?.name ?? ''
        },
        {
          name: 'degree',
          label: 'Degree',
          type: 'select',
          options: this.degreeOptions,
          validators: [Validators.required],
          placeholder: '-- Select Degree --',
          initialValue: this.selectedItem?.degree ?? null
        },
        {
          name: 'duration',
          label: 'Duration (Semesters)',
          type: 'number',
          validators: [Validators.required, Validators.min(1)],
          placeholder: 'Enter duration in semesters',
          initialValue: this.selectedItem?.duration ?? null
        },
        {
          name: 'formOfStudy',
          label: 'Form of Study',
          type: 'select',
          options: this.formOfStudyOptions,
          validators: [Validators.required],
          placeholder: '-- Select Form of Study --',
          initialValue: this.selectedItem?.formOfStudy ?? null
        }
      ]
    };
    this.cdRef.markForCheck();
  }

  private setupTableConfiguration(): void {
    this.tableColumns = [
      { key: 'name', header: 'Name', type: 'string', isSortable: true },
      { key: 'faculty', header: 'Faculty', type: 'string', isSortable: true },
      { key: 'degree', header: 'Degree', displayFn: item => item?.degree ? (Degree[item.degree as keyof typeof Degree] || item.degree) : 'N/A', type: 'string', isSortable: true },
      { key: 'duration', header: 'Duration (Sem.)', type: 'number', isSortable: true },
      { key: 'formOfStudy', header: 'Form', displayFn: item => item?.formOfStudy ? (FormOfStudy[item.formOfStudy as keyof typeof FormOfStudy] || item.formOfStudy) : 'N/A', type: 'string', isSortable: true },
    ];

    this.tableActions = [
      { actionId: 'edit', label: 'Edit', buttonClass: 'button button-edit', title: 'Edit Field of Study' },
      { actionId: 'delete', label: 'Delete', buttonClass: 'button button-danger', title: 'Delete Field of Study' }
    ];
  }

  async handleTableAction(event: { actionId: string; item: FieldOfStudyRead; itemId: number }): Promise<void> {
    switch (event.actionId) {
      case 'edit':
        const options = await firstValueFrom(this.facultyOptions$);
        const facultyOption = options.find(opt => opt.label === event.item.faculty);
        if (!facultyOption) {
          this.error = `Cannot edit: Could not find faculty ID for ${event.item.faculty}.`;
          return;
        }
        const facultyId = facultyOption.value;

        const itemToWriteModel: FieldOfStudyWrite = {
          fieldOfStudyId: event.item.fieldOfStudyId,
          name: event.item.name,
          degree: Object.keys(Degree).find(key => Degree[key as keyof typeof Degree] === event.item.degree) || event.item.degree,
          duration: event.item.duration,
          formOfStudy: Object.keys(FormOfStudy).find(key => FormOfStudy[key as keyof typeof FormOfStudy] === event.item.formOfStudy) || event.item.formOfStudy,
          facultyId: facultyId,
        };
        this.selectItemToEdit(itemToWriteModel);
        break;
      case 'delete':
        this.deleteFos(event.item.fieldOfStudyId);
        break;
    }
  }

  selectItemToEdit(fos: FieldOfStudyWrite): void {
    this.selectedItem = { ...fos };
    this.isEditing = true;
    this.error = null;
    const sub = this.facultyOptions$.subscribe(opts => this.updateFormConfig(opts));
    sub.unsubscribe();
  }

  initNewFos(): void {
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
    this.cdRef.markForCheck();
  }

  saveFos(formData: FieldOfStudyWrite): void {
    const dataToSave = { ...formData };

    if (!dataToSave.facultyId || !dataToSave.name || !dataToSave.degree || !dataToSave.duration || !dataToSave.formOfStudy) {
      this.error = "Please ensure all required fields are filled correctly.";
      return;
    }

    this.isLoadingAction = true;
    this.error = null;

    const isUpdating = dataToSave.fieldOfStudyId !== '';
    let operation$: Observable<any>;;

    if (isUpdating) {
      const id = Number(dataToSave.fieldOfStudyId);
      if (isNaN(id)) {
        this.error = "Invalid ID for update operation.";
        this.isLoadingAction = false;
        return;
      }
      operation$ = this.adminService.updateFieldOfStudy(dataToSave, id);
    } else {
      const { fieldOfStudyId, ...addData } = dataToSave;
      operation$ = this.adminService.addFieldOfStudy(addData as FieldOfStudyWrite);
    }

    this.subscriptions.add(
      operation$.pipe(
        tap((result) => {
          this.refreshData();
          this.cancelEdit();
        }),
        catchError(err => {
          const message = err?.error?.message || `perform ${isUpdating ? 'update' : 'add'} operation`;
          this.error = `Failed to ${message}. Please check details.`;
          return of(null);
        }),
        finalize(() => {
          this.isLoadingAction = false;
          this.cdRef.markForCheck();
        })
      ).subscribe()
    );
  }

  deleteFos(fosId: number | null): void {
    if (fosId === null || !confirm('DELETE Field of Study? This may affect associated data. Are you sure?')) {
      return;
    }

    this.isLoadingAction = true;
    this.error = null;

    this.subscriptions.add(
      this.adminService.deleteFieldOfStudy(fosId).pipe(
        tap(() => {
          this.refreshData();
          if (this.selectedItem?.fieldOfStudyId === fosId) {
            this.cancelEdit();
          }
        }),
        catchError(err => {
          this.error = `Failed to delete Field of Study. ${err?.error?.message || 'Server error'}`.trim();
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
