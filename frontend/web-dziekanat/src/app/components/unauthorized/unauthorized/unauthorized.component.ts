import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.scss']
})
export class UnauthorizedComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);

  statusCode: number | null = null;
  title: string = 'Access Denied';
  message: string = 'You do not have permission to access this page.';

  private errorMessages: { [key: number]: { title: string, message: string } } = {
    401: { title: 'Authentication Required', message: 'You need to log in to access this page.' },
    403: { title: 'Forbidden', message: 'You do not have the necessary permissions to view this resource.' },
  };

  ngOnInit(): void {
    this.statusCode = this.route.snapshot.data['statusCode'] || this.route.snapshot.queryParams['statusCode'] || null;

    if (this.statusCode && this.errorMessages[this.statusCode]) {
      this.title = `${this.statusCode} - ${this.errorMessages[this.statusCode].title}`;
      this.message = this.errorMessages[this.statusCode].message;
    } else if (this.statusCode) {
      this.title = `Error ${this.statusCode}`;
      this.message = 'An unexpected authorization error occurred.';
    }
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
