import { Component, OnInit } from '@angular/core';
import { userService } from '../../service/users.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { AtmService } from '../../service/atm.service';
import { ToastrService } from 'ngx-toastr';
import { formatCurrencyVND } from '../../utils/format.util';
@Component({
  selector: 'app-header',
  imports: [NgIf],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  constructor(
    private userService: userService,
    private cookie: CookieService,
    private router: Router,
    private atmService: AtmService,
    private toastr: ToastrService
  ) {}
  fullname: any = '';
  money: any = '';

  formatCurrency(money: number): string {
    return formatCurrencyVND(money);
  }
  ngOnInit(): void {
    if (this.userService.getCookies() !== '') {
      this.userService.getUser().subscribe(
        (data) => {
          this.fullname = data.fullname;
        },
        (error) => {
          const allCookies = this.cookie.getAll();
          for (const cookie in allCookies) {
            if (allCookies.hasOwnProperty(cookie)) {
              this.cookie.delete(cookie);
            }
          }
          localStorage.clear();
        }
      );
      this.userService.getAtmUser(this.userService.getCookies()).subscribe((data: any) => {
          this.money = data.balance;
          // if (data.error !== undefined) {
          //   this.toastr.warning('Hãy bấm vào User để tạo ATM ', 'Hệ thống');
          // }
        });
    }
  }
  Login() {
    this.router.navigate(['/login']);
  }
  recharge() {
    this.router.navigate(['/payment']);
  }
  userInfo() {
    this.router.navigate(['/user']);
  }
}
