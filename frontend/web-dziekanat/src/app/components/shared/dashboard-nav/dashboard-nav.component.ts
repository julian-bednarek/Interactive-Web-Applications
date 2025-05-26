import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard-nav',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-nav.component.html',
  styleUrls: ['./dashboard-nav.component.scss']
})
export class DashboardNavComponent {
  @Input() title: string = 'Dashboard';
  @Input() navItems: NavItem[] = [];
  @Input() isMobileMenuOpen: boolean = false;

  @Output() mobileMenuToggle = new EventEmitter<boolean>();
  @Output() logoutEvent = new EventEmitter<void>();

  toggleMobileMenu(): void {
    this.mobileMenuToggle.emit(!this.isMobileMenuOpen);
  }

  logout(): void {
    this.logoutEvent.emit();
  }
} 