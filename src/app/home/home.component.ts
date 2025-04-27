import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { format } from 'date-fns';
import { userService } from '../service/users.service';
import { GameService } from '../service/game.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true,
})
export class HomeComponent implements OnInit {
  matches: any[] = [];
  isLoading: boolean = false; // Thêm biến để theo dõi trạng thái loading

  apiFootball = environment.apiFootball;
  apiLottery = environment.apiLottery;

  constructor(
    private router: Router,
    private http: HttpClient,
    private userService: userService,
    private gameService: GameService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.fetchMatches();
    this.loadLotteryData();
  }

  lotteryData: any = {};
  selectedDate = new Date();

  fetchMatches() {
    this.isLoading = true; // Bật trạng thái loading trước khi gọi API
    let dayStart = format(new Date(), 'yyyy-MM-dd');
    let dayEnd = format(new Date(Date.now() + 86400000 * 4), 'yyyy-MM-dd');
    this.gameService.getMatches(dayStart, dayEnd).subscribe(
      (response: any) => {
        this.matches = response.matches;
        this.isLoading = false; // Tắt trạng thái loading khi nhận được dữ liệu
      },
      (error) => {
        console.error(error);
        this.isLoading = false; // Tắt trạng thái loading nếu có lỗi
      }
    );
  }

  loadLotteryData() {
    const dayStart = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
    const dayEnd = format(new Date(Date.now()), 'yyyy-MM-dd');
    const apiUrl = `${this.apiLottery}?dateFrom=${dayStart}&dateTo=${dayEnd}`;

    this.http.get(apiUrl).subscribe({
      next: (res: any) => {
        const detailRaw = res?.t?.issueList?.[0]?.detail;
        if (detailRaw) {
          const parsed = JSON.parse(detailRaw);
          this.lotteryData = {
            gdb: parsed[0],
            g1: parsed[1],
            g2: parsed[2].split(','),
            g3: parsed[3].split(','),
            g4: parsed[4].split(','),
            g5: parsed[5].split(','),
            g6: parsed[6].split(','),
            g7: parsed[7].split(','),
          };
        }
      },
      error: (err) => {
        console.error('Lỗi khi gọi API:', err);
      },
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