import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('token');
  // const router = inject(Router);

  if (token) {
    return true; 
  } else {
    window.alert('Bạn cần đăng nhập để truy cập!');
    // router.navigate(['/login']);
    return false; 
  }
};
