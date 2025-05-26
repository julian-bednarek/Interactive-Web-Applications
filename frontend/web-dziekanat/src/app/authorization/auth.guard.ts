import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { take, switchMap, map } from 'rxjs/operators';
import { AuthService } from '@auth0/auth0-angular';
import { jwtDecode } from 'jwt-decode';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(private auth: AuthService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.auth.isAuthenticated$.pipe(
            take(1),
            switchMap(isAuthenticated => {
                if (!isAuthenticated) {
                    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
                    return of(false);
                }
                return this.auth.getAccessTokenSilently();
            }),
            map(token => {
                const decodedToken = jwtDecode(token as string) as { permissions: string[] };
                const userPermissions = decodedToken.permissions || [];
                const requiredPermissions = route.data['permissions'] || [];

                if (
                    requiredPermissions.length > 0 &&
                    !requiredPermissions.every((permission: string) => userPermissions.includes(permission))
                ) {
                    this.router.navigate(['/unauthorized']);
                    return false;
                }
                return true;
            })
        );
    }
}
