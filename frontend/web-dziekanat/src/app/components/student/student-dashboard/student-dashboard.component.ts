import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { DashboardNavComponent, NavItem } from '../../shared/dashboard-nav/dashboard-nav.component';
import { Observable, Subscription, of } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';
import { StudentService } from '../../../services/student.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    DashboardNavComponent,
  ],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.scss',
})
export class StudentDashboardComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  studentService = inject(StudentService);

  isMobileMenuOpen: boolean = false;
  // Define the type for the emitted state object
  indexLoadingState$: Observable<{ isLoading: boolean; error: string | null; indexAvailable: boolean; indexValue: string | null }>;
  studentIndexValue: string | null = null;

  private subscriptions = new Subscription();

  studentNavItems: NavItem[] = [
    { id: 'personal-data', label: 'Personal Data', icon: '👤' },
    { id: 'field-of-study', label: 'Field of Study', icon: '🎓' },
    { id: 'report-card', label: 'Report Card', icon: '📝' },
    { id: 'bank-account', label: 'Bank Account', icon: '🏦' },
    { id: 'payments', label: 'Payments', icon: '💰' }
  ];

  constructor() {
    this.indexLoadingState$ = this.studentService.getStudentIndex().pipe(
      map(index => ({
        isLoading: false,
        error: null,
        indexAvailable: !!index,
        indexValue: index
      })),
      startWith({ isLoading: true, error: null, indexAvailable: false, indexValue: null }),
      catchError(_ => {
        // Ensure the object returned here matches the defined type
        return of({
          isLoading: false,
          error: 'Could not retrieve student information. Unable to load dashboard.',
          indexAvailable: false,
          indexValue: null // *** THIS WAS THE MISSING PIECE IN THE CATCHERROR ***
        });
      })
    );
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.indexLoadingState$.subscribe(state => {
        this.studentIndexValue = state.indexValue;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  retryFetchIndex(): void {
    console.log("Retry fetch index - Manual refetch needs implementation in StudentService");
  }

  logout(): void {
    const returnTo = typeof window !== 'undefined' ? window.location.origin : '';
    this.auth.logout({ logoutParams: { returnTo: returnTo } });
  }
}