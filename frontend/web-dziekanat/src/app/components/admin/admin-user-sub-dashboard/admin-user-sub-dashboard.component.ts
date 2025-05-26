import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Observable, of, switchMap, tap, catchError, finalize, shareReplay, Subscription, BehaviorSubject } from 'rxjs';
import { AdminService } from '../../../services/admin.service';
import { PublicService } from '../../../services/public.service';
import { StudentWrite } from '../../../model/student-write.model';
import { TeacherWrite } from '../../../model/teacher-write.model';
import { Auth0 } from '../../../model/auth0.model';
import { Roles } from '../../../model/enum/roles.enum';
import { Faculty } from '../../../model/faculty.model';
import { AdminFillUserDetailsFormComponent } from '../admin-fill-user-details-form/admin-fill-user-details-form.component';
import { DynamicTableComponent } from '../../shared/dynamic-table/dynamic-table.component';
import { TableColumn } from '../../shared/dynamic-table/table-column.interface';
import { TableAction } from '../../shared/dynamic-table/table-action.interface';
import { ManageStudentSubjectsComponent } from '../manage-student-subjects/manage-student-subjects.component';
import { SubjectWrite } from '../../../model/subject-write.model';
import { ManageFeesComponent } from '../manage-fees/manage-fees.component';

type AdminUserView = 'notFilled' | 'students' | 'teachers';

@Component({
  selector: 'app-admin-user-sub-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AdminFillUserDetailsFormComponent,
    DynamicTableComponent,
    ManageStudentSubjectsComponent,
    ManageFeesComponent
  ],
  templateUrl: './admin-user-sub-dashboard.component.html',
  styleUrls: ['./admin-user-sub-dashboard.component.scss']
})
export class AdminUserSubDashboardComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private adminService = inject(AdminService);
  private publicService = inject(PublicService);

  private refreshTrigger = new BehaviorSubject<void>(undefined);
  private subscriptions = new Subscription();
  private readonly storageKey = 'adminUserSubDashboard_activeView';
  private readonly defaultView: AdminUserView = 'notFilled';
  private readonly validViews: AdminUserView[] = ['notFilled', 'students', 'teachers'];

  students$: Observable<StudentWrite[]>;
  teachers$: Observable<TeacherWrite[]>;
  notFilledUsers$: Observable<Auth0[]>;
  allSubjects$: Observable<SubjectWrite[]>;

  faculties$: Observable<Faculty[]> | null = null;
  isLoadingFaculties = false;
  facultyError: string | null = null;

  isLoadingStudents = false;
  isLoadingTeachers = false;
  isLoadingNotFilled = false;
  isLoadingSync = false;
  isLoadingAllSubjects = false;
  error: string | null = null;
  activeUserView: AdminUserView = this.defaultView;
  showFillForm = false;
  selectedUserToFill: { auth0Id: string; role: Roles } | null = null;
  showManageSubjectsModal = false;
  selectedStudentForSubjects: StudentWrite | null = null;
  showManageFeesModal = false;
  selectedStudentForFees: StudentWrite | null = null;
  studentTableColumns: TableColumn[] = [];
  studentTableActions: TableAction[] = [];
  teacherTableColumns: TableColumn[] = [];
  teacherTableActions: TableAction[] = [];

  get isLoading(): boolean {
    return this.isLoadingStudents || this.isLoadingTeachers || this.isLoadingNotFilled || this.isLoadingSync || this.isLoadingAllSubjects;
  }

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedView = localStorage.getItem(this.storageKey) as AdminUserView | null;
      if (savedView && this.validViews.includes(savedView)) {
        this.activeUserView = savedView;
      } else {
        this.activeUserView = this.defaultView;
      }
    }

    this.students$ = this.refreshTrigger.pipe(
      tap(() => {
        this.isLoadingStudents = true;
        this.error = null;
      }),
      switchMap(() => this.adminService.getStudents().pipe(
        catchError((_) => {
          this.handleError('Failed to load students.');
          return of([]);
        }),
        finalize(() => this.isLoadingStudents = false)
      )),
      shareReplay(1)
    );

    this.teachers$ = this.refreshTrigger.pipe(
      tap(() => {
        this.isLoadingTeachers = true;
      }),
      switchMap(() => this.adminService.getTeachers().pipe(
        catchError((_) => {
          this.handleError('Failed to load teachers.');
          return of([]);
        }),
        finalize(() => this.isLoadingTeachers = false)
      )),
      shareReplay(1)
    );

    this.notFilledUsers$ = this.refreshTrigger.pipe(
      tap(() => {
        this.isLoadingNotFilled = true;
      }),
      switchMap(() => this.adminService.getNotFilledUsers().pipe(
        catchError((_) => {
          this.handleError('Failed to load pending users.');
          return of([]);
        }),
        finalize(() => this.isLoadingNotFilled = false)
      )),
      shareReplay(1)
    );

    this.allSubjects$ = this.refreshTrigger.pipe(
      tap(() => {
        this.isLoadingAllSubjects = true;
      }),
      switchMap(() => this.adminService.getSubjects().pipe(
        catchError((_) => {
          this.handleError('Failed to load subjects list.');
          return of([]);
        }),
        finalize(() => this.isLoadingAllSubjects = false)
      )),
      shareReplay(1)
    );

    this.setupTableConfigurations();
  }

  ngOnInit(): void {
    this.loadFaculties();
    this.subscriptions.add(this.allSubjects$.subscribe());
    this.refreshTrigger.next();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.refreshTrigger.complete();
  }

  private loadFaculties(): void {
    this.isLoadingFaculties = true;
    this.facultyError = null;
    this.faculties$ = this.publicService.getFaculties().pipe(
      tap(faculties => console.log(`Dashboard: Loaded ${faculties?.length ?? 0} faculties`)),
      catchError((err: any) => {
        this.facultyError = 'Failed to load faculties for the form.';
        this.handleError(this.facultyError);
        return of([]);
      }),
      finalize(() => {
        this.isLoadingFaculties = false
      }),
      shareReplay(1)
    );
  }

  refreshData(): void {
    this.error = null;
    this.facultyError = null;
    this.loadFaculties();
    this.refreshTrigger.next();
  }

  setActiveView(view: AdminUserView) {
    if (this.activeUserView !== view && this.validViews.includes(view)) {
      this.activeUserView = view;
      this.error = null;
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.storageKey, this.activeUserView);
      }
    }

  }

  deleteStudent(studentIndex: string | null): void {
    if (!studentIndex || !confirm('Are you sure you want to delete this student?')) {
      return;
    }
    this.isLoadingStudents = true;
    this.error = null;

    this.subscriptions.add(
      this.adminService.deleteStudent(studentIndex).pipe(
        catchError((_) => {
          this.handleError('Failed to delete student.');
          return of(null);
        }),
        finalize(() => {
          this.refreshData();
        })
      ).subscribe()
    );
  }

  deleteTeacher(teacherId: number | null): void {
    if (teacherId === null || !confirm('Are you sure you want to delete this teacher?')) {
      return;
    }
    this.isLoadingTeachers = true;
    this.error = null;

    this.subscriptions.add(
      this.adminService.deleteTeacher(teacherId).pipe(
        catchError((_) => {
          this.handleError('Failed to delete teacher.');
          return of(null);
        }),
        finalize(() => {
          this.refreshData();
        })
      ).subscribe()
    );
  }

  syncUsers(): void {
    if (!confirm('Syncing users may take a moment. Continue?')) return;
    this.isLoadingSync = true;
    this.error = null;

    this.subscriptions.add(
      this.adminService.syncUsers()
        .pipe(
          catchError((_) => {
            this.handleError('Failed to initiate user sync.');
            return of(null);
          }),
          finalize(() => {
            this.isLoadingSync = false;
            setTimeout(() => this.refreshData(), 1500);
          })
        ).subscribe()
    );
  }

  fillUserDetails(user_id: string | undefined, role: Roles | undefined) {
    if (!user_id || !role) {
      console.error('Attempted to fill details for user with missing User ID or role.', { user_id, role });
      return;
    }
    setTimeout(() => {
      this.selectedUserToFill = { auth0Id: user_id, role };
      this.showFillForm = true;
      this.error = null;
    }, 0);
  }

  handleFormSubmitted(): void {
    this.showFillForm = false;
    this.selectedUserToFill = null;
    this.refreshData();
  }

  handleFormCancelled(): void {
    this.showFillForm = false;
    this.selectedUserToFill = null;
  }

  private handleError(message: string): void {
    this.error = this.error ? `${this.error} ${message}` : message;
  }

  private setupTableConfigurations(): void {
    this.studentTableColumns = [
      { key: 'indexNumber', header: 'Index', type: 'string', isSortable: true },
      { key: 'firstName', header: 'First Name', type: 'string', isSortable: true },
      { key: 'lastName', header: 'Last Name', type: 'string', isSortable: true },
      { key: 'pesel', header: 'PESEL', type: 'string', isSortable: true },
      { key: 'semester', header: 'Semester', type: 'number', isSortable: true },
    ];
    this.studentTableActions = [
      {
        actionId: 'manageSubjects',
        label: 'Manage Subjects',
        buttonClass: 'button button-edit',
        title: 'Manage student subjects'
      },
      {
        actionId: 'manageFees',
        label: 'Manage Fees',
        buttonClass: 'button button-edit',
        title: 'Manage student fees'
      },
      {
        actionId: 'deleteStudent',
        label: 'Delete',
        buttonClass: 'button button-danger',
        title: 'Delete Student'
      }
    ];
    this.teacherTableColumns = [
      { key: 'id', header: 'ID', type: 'number', isSortable: true },
      { key: 'academicTitle', header: 'Title', type: 'string', isSortable: true },
      { key: 'firstName', header: 'First Name', type: 'string', isSortable: true },
      { key: 'lastName', header: 'Last Name', type: 'string', isSortable: true },
    ];
    this.teacherTableActions = [
      {
        actionId: 'deleteTeacher',
        label: 'Delete',
        buttonClass: 'button button-danger',
        title: 'Delete Teacher'
      }
    ];
  }

  handleStudentTableAction(event: { actionId: string; item: StudentWrite; itemId: string }): void {
    switch (event.actionId) {
      case 'deleteStudent':
        this.deleteStudent(event.item.indexNumber);
        break;
      case 'manageSubjects':
        this.selectedStudentForSubjects = event.item;
        this.showManageSubjectsModal = true;
        this.error = null;
        break;
      case 'manageFees':
        this.selectedStudentForFees = event.item;
        this.showManageFeesModal = true;
        this.error = null;
        break;
    }
  }

  handleTeacherTableAction(event: { actionId: string; item: TeacherWrite; itemId: number }): void {
    if (event.actionId === 'deleteTeacher') {
      this.deleteTeacher(event.itemId);
    }
  }

  handleManageSubjectsClosed(): void {
    this.showManageSubjectsModal = false;
    this.selectedStudentForSubjects = null;
  }

  handleManageFeesClosed(): void {
    this.showManageFeesModal = false;
    this.selectedStudentForFees = null;
  }
}
