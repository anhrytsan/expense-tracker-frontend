import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';


export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Just check if localStorage has our token
  const token = localStorage.getItem('auth_token');

  if (token) {
    return true;
  } else {
    // If token not found, redirect to login
    return router.createUrlTree(['/login']);
  }
};
