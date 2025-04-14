import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HeaderComponent } from './shared/header/header.component';
import { LeftsideComponent } from './shared/leftside/leftside.component';
import { RightsideComponent } from './shared/rightside/rightside.component';
import { MessageComponent } from "./message/message.component";
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    LeftsideComponent,
    RightsideComponent,
    LoginComponent,
    NgIf,
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  stock:any={}
  // message:any=""
  constructor(private route: Router
  ) {
  }
  isLoginPage(): boolean {
    return this.route.url === '/login';
  }
}
