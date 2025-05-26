import { Component, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DashboardNavComponent, NavItem } from '../../shared/dashboard-nav/dashboard-nav.component';
import { AdminUserSubDashboardComponent } from '../admin-user-sub-dashboard/admin-user-sub-dashboard.component';
import { AdminSubjectSubDashboardComponent } from '../admin-subject-sub-dashboard/admin-subject-sub-dashboard.component';
import { AdminFeeSubDashboardComponent } from '../admin-fee-sub-dashboard/admin-fee-sub-dashboard.component';
import { AdminFosSubDashboardComponent } from '../admin-fos-sub-dashboard/admin-fos-sub-dashboard.component';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-admin-dashboard',
  imports: [
    CommonModule,
    RouterOutlet,
    DashboardNavComponent,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
  standalone: true
})
export class AdminDashboardComponent {
  private platformId = inject(PLATFORM_ID);
  auth = inject(AuthService);

  private readonly storageKey = 'adminDashboard_activeSection';

  isMobileMenuOpen: boolean = false;

  adminNavItems: NavItem[] = [
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'subjects', label: 'Subjects', icon: '📚' },
    { id: 'fees', label: 'Fees', icon: '💰' },
    { id: 'fos', label: 'Fields of Study', icon: '🎓' }
  ];

  constructor() {
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout(): void {
    this.auth.logout({ logoutParams: { returnTo: window.location.origin } });
  }
}
