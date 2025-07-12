// role.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const expectedRoles = route.data['roles'] as string[];
    const userRole = this.authService.getCurrentUserRoles();

    if (!userRole) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    const hasAccess =
      Array.isArray(userRole)
        ? userRole.some((r) => expectedRoles.includes(r))
        : expectedRoles.includes(userRole);

    if (!hasAccess) {
      this.router.navigate(['/unauthorized']);
    }

    return hasAccess;
  }
}
