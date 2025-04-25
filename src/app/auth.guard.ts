import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
export const authGuard: CanActivateFn = (route, state) => {

  const toastr = inject(ToastrService);
  const token = localStorage.getItem('token');
  const router = inject(Router);

  if (token) {
    return true; 
  } else {
    toastr.error('Bạn cần đăng nhập để truy cập!');
    return router.parseUrl('');
    
  }
};
