import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const role = auth.currentRole();
    if (role && allowedRoles.includes(role)) return true;
    router.navigate(['/error'], {
      state: {
        code: 403,
        title: 'Access Denied',
        message: `You don't have permission to view this page. This area is restricted to ${allowedRoles.join(', ')} users only.`
      }
    });
    return false;
  };
}
