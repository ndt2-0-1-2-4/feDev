import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import { environment } from '../../environments/environment';
import { format } from 'date-fns';
import { userService } from '../service/users.service';
import { AtmService } from '../service/atm.service';
@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, HighchartsChartModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true,
})
export class HomeComponent implements OnInit {
  matches: any[] = [];
  listdailyBalances: any[] = [];
  listdailyRecharge: any[] = [];
  Highcharts: typeof Highcharts = Highcharts;
  chartOption: Highcharts.Options = {};
  chartOption2: Highcharts.Options = {};
  apiFootball = environment.apiFootball;
  apiLottery = environment.apiLottery;

  constructor(
    private router: Router,
    private http: HttpClient,
    private userService: userService,
    private AtmService: AtmService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // this.fetchMatches();
    this.loadLotteryData();
    this.UpChartBalance();
    this.UpChartRecharge();
  }

  lotteryData: any = {};
  selectedDate = new Date();

  // fetchMatches() {
  //   this.isLoading = true; // Bật trạng thái loading trước khi gọi API
  //   let dayStart = format(new Date(), 'yyyy-MM-dd');
  //   let dayEnd = format(new Date(Date.now() + 86400000 * 4), 'yyyy-MM-dd');
  //   this.gameService.getMatches(dayStart, dayEnd).subscribe(
  //     (response: any) => {
  //       this.matches = response.matches;
  //       this.isLoading = false; // Tắt trạng thái loading khi nhận được dữ liệu
  //     },
  //     (error) => {
  //       console.error(error);
  //       this.isLoading = false; // Tắt trạng thái loading nếu có lỗi
  //     }
  //   );
  // }

  loadLotteryData() {
    const dayStart = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
    const dayEnd = format(new Date(Date.now()), 'yyyy-MM-dd');
    const apiUrl = `${this.apiLottery}?dateFrom=${dayStart}&dateTo=${dayEnd}`;
    console.log('ok');

    this.http.get(apiUrl).subscribe({
      next: (res: any) => {
        const issues = res?.t?.issueList;
        const now = new Date();

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
            g7: parsed[7].split(','),
          };
        }

        //  Lấy ngày từ API để hiển thị đúng
        this.selectedDate = new Date(latestValidIssue?.openTime || Date.now());

        console.log('Dữ liệu nhận về từ API:', res);
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
  //Thống kê
  UpChartBalance() {
    const idMy = Number(this.userService.getCookies());
    let startDate = format(new Date(), 'yyyy-MM-dd');
    this.AtmService.getDailyClosingBalance(idMy, startDate).subscribe(
      (rs: any) => {
        this.listdailyBalances = rs.dailyBalances;
        this.chartOption = {
          chart: {
            type: 'line',
          },
          title: {
            text: 'Thống kê số dư',
          },
          xAxis: {
            categories: this.listdailyBalances.map((item) => item.date),
            labels: {
              style: {
                fontSize: '0.5rem',
              },
            },
            title: {
              text: 'Ngày',
            },
          },
          yAxis: {
            title: {
              text: 'Số dư',
            },
          },
          tooltip: {
            formatter: function () {
              return `
                <b>Số dư:</b> ${this.y?.toLocaleString() ?? 'N/A'}
              `;
            },
          },
          series: [
            {
              type: 'line',
              name: 'Số dư',
              data: this.listdailyBalances.map((item) => ({
                y: item.hasData ? item.closingBalance : 0,
              })),
            },
          ],
        };
        this.cdr.detectChanges();
      },
      (error: any) => {
        console.log(error);
      }
    );
  }
  UpChartRecharge() {
    const Idmy = Number(this.userService.getCookies());
    let endDate = format(new Date(), 'yyyy-MM-dd');
    this.AtmService.getDailyRecharge(Idmy, endDate).subscribe(
      (response: any) => {
        this.listdailyRecharge = response.dailyrecharges;
        this.chartOption2 = {
          chart: {
            type: 'line',
          },
          title: {
            text: 'Thống kê số tiền nạp',
          },
          xAxis: {
            categories: this.listdailyRecharge.map((item) => item.date),
            labels: {
              style: {
                fontSize: '0.5rem',
              },
            },
            title: {
              text: 'Ngày',
            },
          },
          yAxis: {
            title: {
              text: 'Số dư',
            },
          },
          tooltip: {
            formatter: function () {
              return `
                <b>Số dư:</b> ${this.y?.toLocaleString() ?? 'N/A'}
              `;
            },
          },
          series: [
            {
              type: 'line',
              name: 'Số dư',
              data: this.listdailyRecharge.map((item) => ({
                y: item.hasData ? item.totalRecharge : 0,
              })),
            },
          ],
        };
        this.cdr.detectChanges();
      },
      (err: any) => {
        console.log(err);
      }
    );
  }
}
