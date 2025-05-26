import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { TeacherDashboardComponent } from './components/teacher/teacher-dashboard/teacher-dashboard.component';
import { StudentDashboardComponent } from './components/student/student-dashboard/student-dashboard.component';
import { AuthGuard } from './authorization/auth.guard';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized/unauthorized.component';
import { LoginViewComponent } from './components/unauthorized/login-view/login-view.component';

// Admin Sub-Dashboard Components
import { AdminUserSubDashboardComponent } from './components/admin/admin-user-sub-dashboard/admin-user-sub-dashboard.component';
import { AdminSubjectSubDashboardComponent } from './components/admin/admin-subject-sub-dashboard/admin-subject-sub-dashboard.component';
import { AdminFeeSubDashboardComponent } from './components/admin/admin-fee-sub-dashboard/admin-fee-sub-dashboard.component';
import { AdminFosSubDashboardComponent } from './components/admin/admin-fos-sub-dashboard/admin-fos-sub-dashboard.component';

// Student Sub-Dashboard Components
import { StudentPersonalDataComponent } from './components/student/student-personal-data/student-personal-data.component';
import { StudentFieldOfStudyComponent } from './components/student/student-field-of-study/student-field-of-study.component';
import { StudentReportCardComponent } from './components/student/student-report-card/student-report-card.component';
import { StudentBankAccountComponent } from './components/student/student-bank-account/student-bank-account.component';
import { StudentPaymentsComponent } from './components/student/student-payments/student-payments.component';



export const routes: Routes = [
    {
        path: 'admin',
        component: AdminDashboardComponent,
        canActivate: [AuthGuard],
        data: { permissions: ['read:everything', 'write:everything'] },
        children: [
            { path: '', redirectTo: 'users', pathMatch: 'full' },
            { path: 'users', component: AdminUserSubDashboardComponent },
            { path: 'subjects', component: AdminSubjectSubDashboardComponent },
            { path: 'fees', component: AdminFeeSubDashboardComponent },
            { path: 'fos', component: AdminFosSubDashboardComponent }
        ]
    },
    {
        path: 'student',
        component: StudentDashboardComponent,
        canActivate: [AuthGuard],
        data: { permissions: ['read:student', 'write:student'] },
        children: [
            { path: '', redirectTo: 'personal-data', pathMatch: 'full' },
            { path: 'personal-data', component: StudentPersonalDataComponent },
            { path: 'field-of-study', component: StudentFieldOfStudyComponent },
            { path: 'report-card', component: StudentReportCardComponent },
            { path: 'bank-account', component: StudentBankAccountComponent },
            { path: 'payments', component: StudentPaymentsComponent }
        ]
    },
    {
        path: 'teacher',
        component: TeacherDashboardComponent,
        canActivate: [AuthGuard],
        data: { permissions: ['read:teacher', 'write:teacher'] }
    },
    { path: 'unauthorized', component: UnauthorizedComponent },
    { path: 'login', component: LoginViewComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', redirectTo: '/login' }
];
