import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { userService } from '../service/users.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { isValidPassword } from '../utils/validation.util';
@Component({
  selector: 'app-forgetpassword',
  imports: [CommonModule, FormsModule],
  templateUrl: './forgetpassword.component.html',
  styleUrl: './forgetpassword.component.css'
})
export class ForgetpasswordComponent {

  constructor(
      private userService: userService,
      private toastr: ToastrService,
      private http : HttpClient,
      private router: Router,
      private route: ActivatedRoute
    ) { }

  ngOnInit(): void {
  this.route.queryParams.subscribe(params => {
    this.token = params['token'];
    console.log('Token nhận được:', this.token);
  });
}


  newPassword: string = '';
  confirmPassword: string = '';
  token: string = '';

  resetPassword() {
  if(isValidPassword(this.newPassword) === false){
    this.toastr.error('Mật khẩu không hợp lệ. Vui lòng nhập lại.');
    return;
  }

  if (this.newPassword !== this.confirmPassword) {
    this.toastr.error('Mật khẩu không khớp. Vui lòng thử lại.');
    return;
  }

  this.userService.resetpass(this.token, this.newPassword).subscribe(
    (response: any) => {
      this.toastr.success('Mật khẩu đã được đặt lại thành công.');
      this.router.navigate(['/login']);
    },
    error => {
      console.error('Error resetting password:', error);
      this.toastr.error('Đã xảy ra lỗi khi đặt lại mật khẩu. Vui lòng thử lại sau.');
    }
  );
}

}
