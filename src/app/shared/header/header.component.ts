import { Component,OnInit } from '@angular/core';
import { userService } from '../../service/users.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
@Component({
  selector: 'app-header',
  imports: [NgIf],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  constructor (
    private userService: userService,
    private cookie:CookieService,
    private router: Router
  ) { }
  fullname:any =""
  money:any=""
  ngOnInit(): void {
    this.fullname=this.userService.getNameCookies()
    this.money=this.userService.getBalanceCookies()
  }
  Login(){
    this.router.navigate(['/login'])
  }
  recharge(){
    this.router.navigate(['/payment'])
  }
  userInfo(){
    this.router.navigate(["/user"])
  }
}
