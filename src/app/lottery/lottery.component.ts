import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient ,HttpHeaders} from '@angular/common/http';
import { environment } from '../../environments/environment';
import { format } from 'date-fns';
import { userService } from '../service/users.service';
import { AtmService } from '../service/atm.service';



@Component({
  selector: 'app-lottery',
  imports: [CommonModule, FormsModule],
  templateUrl: './lottery.component.html',
  styleUrl: './lottery.component.css'
})
export class LotteryComponent {

  constructor (
    private router:Router,
    private http :HttpClient,
    private userService: userService,
    private atmService: AtmService, 
  ) { }

  apiLottery = environment.apiLottery;
  apiPlaceBet=environment.apiPlaceBet
  apigetBethis=environment.apigetbetHisfbxs

  ngOnInit() {
    this.loadLotteryData();
  }

  lotteryData: any = {};
  selectedDate = new Date();

  loadLotteryData() {
    const dayStart = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd'); 
    const dayEnd = format(new Date(Date.now()), 'yyyy-MM-dd'); 
    const apiUrl = `${this.apiLottery}?dateFrom=${dayStart}&dateTo=${dayEnd}`;
    console.log("ok");

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
          g7: parsed[7].split(',')
        };
      }
        console.log('Dữ liệu nhận về từ API:', res);
      },
      error: (err) => {
        console.error('Lỗi khi gọi API:', err);
      }
    });
  }
  betNumber: string = '';
  betAmount: number = 1000;

  submitBet() {
    // Kiểm tra định dạng cược số (2 chữ số)
    const validNumber = /^\d{2}$/.test(this.betNumber);
    const validAmount = this.betAmount >= 1000;

    if (!validNumber) {
      alert('Vui lòng nhập đúng 2 chữ số!');
      return;
    }

    if (!validAmount) {
      alert('Số tiền tối thiểu là 1000!');
      return;
    }

    // Nếu hợp lệ
    alert(`Bạn đã đặt cược số ${this.betNumber} với số tiền ${this.betAmount.toLocaleString()}đ`);

    // Reset form sau khi cược
    this.betNumber = '';
    this.betAmount = 1000;
  }
}


