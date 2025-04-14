import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
@Component({
  selector: 'app-menugame',
  imports: [CommonModule],
  templateUrl: './menugame.component.html',
  styleUrl: './menugame.component.css',
})
export class MenugameComponent {
  constructor(private route: Router, private cookieService: CookieService) {}
  Game777() {
    this.route.navigate(['/game/slot777']);
  }
  GameMines() {
    this.route.navigate(['/game/rr']);
  }
  GameSpaceman() {
    this.route.navigate(['/game/spaceman']);
  }
  GameChanLe() {
    this.route.navigate(['/game/cl']);
  }
  Football(){
    this.route.navigate(['/football']);
  }
}
