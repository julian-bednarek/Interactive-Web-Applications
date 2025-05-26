import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Router } from '@angular/router';
import { AuthGuard } from '../../../authorization/auth.guard';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-login-view',
  templateUrl: './login-view.component.html',
  styleUrls: ['./login-view.component.scss']
})
export class LoginViewComponent implements OnInit {

  constructor(
    public auth: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    console.log('LoginViewComponent initialized');
    this.auth.isAuthenticated$.subscribe(isAuthenticated => {
      console.log('isAuthenticated:', isAuthenticated);
      if (isAuthenticated) {
        this.redirectBasedOnPermissions();
      }
    });
  }

  login(): void {
    this.auth.loginWithRedirect();
  }

  logout(): void {
    this.auth.logout();
  }

  private readonly ADMIN_PERMISSIONS = ['read:everything', 'write:everything'];
  private readonly STUDENT_PERMISSIONS = ['read:student', 'write:student'];
  private readonly TEACHER_PERMISSIONS = ['read:teacher', 'write:teacher'];

  private redirectBasedOnPermissions(): void {
    this.auth.getAccessTokenSilently().subscribe((token: string) => {
      console.log('Token:', token);
      const decodedToken = jwtDecode(token) as { permissions: string[] };
      console.log('Decoded Token:', decodedToken);
      const permissions: string[] = decodedToken.permissions || [];
      if (permissions.every(perm => this.ADMIN_PERMISSIONS.includes(perm))) {
        this.router.navigate(['/admin']);
      } else if (permissions.every(perm => this.STUDENT_PERMISSIONS.includes(perm))) {
        this.router.navigate(['/student']);
      } else if (permissions.every(perm => this.TEACHER_PERMISSIONS.includes(perm))) {
        this.router.navigate(['/teacher']);
      } else {
        console.log(permissions);
      }
    });
  }
}