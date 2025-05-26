import { Component, Input, Output, EventEmitter, OnInit, inject, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, Subscription, catchError, finalize, of, tap, shareReplay } from 'rxjs';
import { AdminService } from '../../../services/admin.service';
import { Roles } from '../../../model/enum/roles.enum';
import { StudentWrite } from '../../../model/student-write.model';
import { TeacherWrite } from '../../../model/teacher-write.model';
import { Person } from '../../../model/person.model';
import { Faculty } from '../../../model/faculty.model';
import { FieldOfStudyRead } from '../../../model/field-of-study-read.model';

@Component({
    selector: 'app-admin-fill-user-details-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './admin-fill-user-details-form.component.html',
    styleUrls: ['./admin-fill-user-details-form.component.scss']
})
export class AdminFillUserDetailsFormComponent implements OnInit, OnChanges, OnDestroy {
    @Input({ required: true }) auth0Id!: string;
    @Input({ required: true }) role!: Roles;
    @Input() faculties$: Observable<Faculty[]> | null = null;
    @Input() isLoadingFaculties: boolean = false;
    @Input() facultyError: string | null = null;
    @Output() formSubmitted = new EventEmitter<void>();
    @Output() cancelled = new EventEmitter<void>();

    private fb = inject(FormBuilder);
    private adminService = inject(AdminService);
    private submitSubscription: Subscription | null = null;

    detailsForm!: FormGroup;
    isLoading = false;
    error: string | null = null;
    RolesEnum = Roles;

    fieldsOfStudy$: Observable<FieldOfStudyRead[]>;
    isLoadingFos = false;
    fosError: string | null = null;

    constructor() {
        this.fieldsOfStudy$ = this.adminService.getFieldsOfStudy().pipe(
            tap(() => this.isLoadingFos = true),
            catchError(err => {
                this.fosError = `Failed to load Fields of Study. ${err?.error?.message || ''}`.trim();
                return of([]);
            }),
            finalize(() => this.isLoadingFos = false),
            shareReplay(1)
        );
    }

    ngOnInit(): void {
        this.initializeForm();
        if (this.role === Roles.STUDENT) {
            this.fieldsOfStudy$.subscribe();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        const roleChanged = changes['role'] && !changes['role'].firstChange && changes['role'].currentValue !== changes['role'].previousValue;
        const auth0IdChanged = changes['auth0Id'] && !changes['auth0Id'].firstChange && changes['auth0Id'].currentValue !== changes['auth0Id'].previousValue;

        if (roleChanged) {
            this.initializeForm();
        }

        if (roleChanged || auth0IdChanged) {
            this.error = null;
            this.isLoading = false;
            this.submitSubscription?.unsubscribe();
            this.submitSubscription = null;
        }

        if (changes['role'] && changes['role'].currentValue === Roles.STUDENT) {
            this.fieldsOfStudy$.subscribe();
        }
    }

    private initializeForm(): void {
        if (!this.role) {
            this.error = 'Cannot initialize form: Role is missing.';
            this.detailsForm = this.fb.group({});
            return;
        }

        const personGroup = {
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            fatherName: [null as string | null],
            pesel: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
            placeOfBirth: ['', Validators.required],
            phoneNumber: ['', Validators.required],
            eDeliveryMail: [null as string | null, Validators.email],
            facultyId: [null as number | null, Validators.required],
            street: ['', Validators.required],
            houseNumber: ['', Validators.required],
            flatNumber: [null as number | null],
            postalCode: ['', [Validators.required, Validators.pattern(/^\d{2}-\d{3}$/)]],
            city: ['', Validators.required],
            voivodeship: ['', Validators.required]
        };

        try {
            if (this.role === Roles.STUDENT) {
                this.detailsForm = this.fb.group({
                    ...personGroup,
                    indexNumber: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
                    fieldOfStudyId: [null as number | null, [Validators.required, Validators.min(1)]],
                    semester: [1, [Validators.required, Validators.min(1)]],
                    depositNumber: ['', Validators.required]
                });
            } else if (this.role === Roles.TEACHER) {
                this.detailsForm = this.fb.group({
                    ...personGroup,
                    academicTitle: ['', Validators.required]
                });
            } else {
                throw new Error(`Unsupported role: ${this.role}`);
            }
            console.log('Form initialized for role:', this.role);
        } catch (e) {
            this.error = `Error initializing form: ${(e as Error).message || 'Unknown error'}`;
            this.detailsForm = this.fb.group({});
        }
    }

    onSubmit(): void {
        if (!this.detailsForm) {
            this.error = 'Form not initialized.';
            return;
        }

        if (this.detailsForm.get('facultyId')?.value == null) {
            this.detailsForm.get('facultyId')?.setErrors({ required: true });
            this.detailsForm.get('facultyId')?.markAsTouched();
        }

        if (this.detailsForm.invalid || !this.auth0Id || !this.role) {
            this.error = 'Form is invalid. Please check all required fields.';
            this.detailsForm.markAllAsTouched();
            return;
        }
        if (this.isLoading) return;

        this.isLoading = true;
        this.error = null;
        this.submitSubscription?.unsubscribe();

        let submitObservable;
        const formValue = this.detailsForm.value;
        const addressData = {
            street: formValue.street,
            houseNumber: formValue.houseNumber,
            flatNumber: formValue.flatNumber || null,
            postalCode: formValue.postalCode,
            city: formValue.city,
            voivodeship: formValue.voivodeship,
            confirmed: false
        };

        const personData: Omit<Person, 'id' | 'auth0Id' | 'address'> = {
            firstName: formValue.firstName,
            lastName: formValue.lastName,
            fatherName: formValue.fatherName || null,
            pesel: formValue.pesel,
            placeOfBirth: formValue.placeOfBirth,
            phoneNumber: formValue.phoneNumber,
            eDeliveryMail: formValue.eDeliveryMail || null,
            facultyId: formValue.facultyId,
        };

        try {
            if (this.role === Roles.STUDENT) {
                const studentData: StudentWrite = {
                    ...personData,
                    indexNumber: formValue.indexNumber,
                    fieldOfStudy: formValue.fieldOfStudyId,
                    semester: formValue.semester,
                    depositNumber: formValue.depositNumber,
                    auth0Id: this.auth0Id,
                    id: null,
                    address: addressData
                };
                submitObservable = this.adminService.fillStudent(this.auth0Id, studentData);
            } else if (this.role === Roles.TEACHER) {
                const teacherData: TeacherWrite = {
                    ...personData,
                    academicTitle: formValue.academicTitle,
                    auth0Id: this.auth0Id,
                    id: null,
                    address: addressData
                };
                submitObservable = this.adminService.fillTeacher(this.auth0Id, teacherData);
            } else {
                throw new Error(`Invalid role for submission: ${this.role}`);
            }

            this.submitSubscription = submitObservable.subscribe({
                next: (_: any) => {
                    this.isLoading = false;
                    this.formSubmitted.emit();
                },
                error: (err: any) => {
                    const message = err?.error?.message || err?.message || 'Unknown server error';
                    this.error = `Failed to submit details: ${message}`;
                    this.isLoading = false;
                }
            });

        } catch (e) {
            this.error = `Error preparing submission: ${(e as Error).message || 'Unknown error'}`;
            this.isLoading = false;
        }
    }

    onCancel(): void {
        this.submitSubscription?.unsubscribe();
        this.isLoading = false;
        this.error = null;
        this.cancelled.emit();
    }

    ngOnDestroy(): void {
        this.submitSubscription?.unsubscribe();
    }
}
