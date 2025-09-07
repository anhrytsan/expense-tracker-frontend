import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const publicGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('auth_token');

  if (token) {
    // If token exists (user is logged in), redirect to control panel
    return router.createUrlTree(['/dashboard']);
  } else {
    // If there is no token, allow access
    return true;
  }
};
