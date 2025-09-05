import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const publicGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('auth_token');

  if (token) {
    // Якщо токен є (користувач залогінений), перенаправляємо на дашборд
    return router.createUrlTree(['/dashboard']);
  } else {
    // Якщо токена немає, дозволяємо доступ
    return true;
  }
};
