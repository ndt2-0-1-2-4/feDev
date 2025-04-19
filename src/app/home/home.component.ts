import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { format } from 'date-fns';
import { userService } from '../service/users.service';
@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true,
})
export class HomeComponent implements OnInit {
  matches: any[] = [];

  apiFootball = environment.apiFootball;
  apiLottery = environment.apiLottery;

  constructor(
    private router: Router,
    private http: HttpClient,
    private userService: userService
  ) {}
  ngOnInit() {
    this.fetchMatches();
    this.loadLotteryData();
  }

  lotteryData: any = {};
  selectedDate = new Date();

  fetchMatches() {
    let dayStart = format(new Date(), 'yyyy-MM-dd');
    let dayEnd = format(new Date(Date.now() + 86400000 * 4), 'yyyy-MM-dd');
    this.apiFootball += `?dateFrom=${dayStart}&dateTo=${dayEnd}`;
    const headers = new HttpHeaders({
      'X-Auth-Token': environment.keyFootball,
    });
    this.http.get(this.apiFootball, { headers }).subscribe(
      (data: any) => {
        this.matches = data.matches || [];
        console.log(data);
      },
      (error: any) => {
        console.log(error);
      }
    );
  }

  loadLotteryData() {
    const dayStart = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd'); 
    const dayEnd = format(new Date(Date.now()), 'yyyy-MM-dd'); 
    const apiUrl = `${this.apiLottery}?dateFrom=${dayStart}&dateTo=${dayEnd}`;
    console.log("ok");
  
    this.http.get(apiUrl).subscribe({
      next: (res: any) => {
        const issues = res?.t?.issueList;
        const now = new Date()
  
        const latestValidIssue = issues?.find((issue: any) => {
          const openTime = new Date(issue.openTime);
          return openTime < now;
        });

        if (latestValidIssue && latestValidIssue.detail) {
          const parsed = JSON.parse(latestValidIssue.detail);
  
          this.lotteryData = {
            gdb: parsed[0],
            g1: parsed[1],
            g2: parsed[2].split(','),
            g3: parsed[3].split(','),
            g4: parsed[4].split(','),
            g5: parsed[5].split(','),
            g6: parsed[6].split(','),
            g7: parsed[7].split(',')
          };
        }
  
        //  Lấy ngày từ API để hiển thị đúng
        this.selectedDate = new Date(latestValidIssue?.openTime || Date.now());
  
        console.log('Dữ liệu nhận về từ API:', res);
      },
      error: (err) => {
        console.error('Lỗi khi gọi API:', err);
      }
    });
  }

  FootballPage() {
    this.router.navigate(['/football']);
  }
  LotteryPage() {
    this.router.navigate(['/lottery']);
  }
  Game777() {
    this.router.navigate(['/game/slot777']);
  }
  GameMines() {
    this.router.navigate(['/game/rr']);
  }
  GameSpaceman() {
    this.router.navigate(['/game/spaceman']);
  }
  GameChanLe() {
    this.router.navigate(['/game/cl']);
  }
}
