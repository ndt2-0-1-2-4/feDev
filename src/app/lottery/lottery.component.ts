import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient ,HttpHeaders} from '@angular/common/http';
import { environment } from '../../environments/environment';
import { format, parse, isBefore } from 'date-fns';
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
    this.money = parseInt(this.userService.getBalanceCookies());

  }

  lotteryData: any = {};
  selectedDate = new Date();
  activeTab = 'bet';
  money: number = 0; // Số tiền cược cho mỗi trận

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
  betNumber: string = '';
  betAmount: number = 1000;

  
  placeBet() {
    if (parseInt(this.userService.getBalanceCookies()) >= this.betAmount) {
      let amount = -this.betAmount;
      this.money -= this.betAmount;
  
      // Cập nhật UI số vàng
      const goldElement = document.querySelector('.gold');
      if (goldElement) goldElement.innerHTML = this.money.toString();
  
      // Cập nhật cookie số dư
      this.userService.setBalanceCookies(this.money.toString());
  
      // Gọi API cập nhật số dư (trừ tiền)
      this.atmService.updateBalan(amount, this.userService.getCookies()).subscribe(
        response => {
          // console.log('Đã trừ tiền cược xổ số:', response);
  
          // Gửi cược lên server
          const betData = {
            idPlayer: parseInt(this.userService.getCookies()),
            betType: 'LOTTERY',
            referenceId: format(new Date(), 'yyyy-MM-dd'),
            prediction: this.betNumber,
            betAmount: this.betAmount,
            multi: 1
          };
  
          this.http.post(this.apiPlaceBet, betData).subscribe(
            (res: any) => {
              console.log('Đặt cược xổ số thành công:', res);
              alert(res.message || "Đặt cược thành công!");
  
              // Reset lại form
              this.betNumber = '';
              this.betAmount = 1000;
            },
            (err) => {
              console.error('Lỗi khi lưu cược xổ số:', err);
              alert("Có lỗi xảy ra khi lưu cược.");
            }
          );
        },
        error => {
          console.error('Lỗi cập nhật số dư:', error);
          alert("Có lỗi xảy ra khi trừ tiền.");
        }
      );
    } else {
      alert("Bạn không đủ tiền để đặt cược!");
    }
  }

  lotteryHistory: any[] = [];

  showBetHistory() {
    const requestBody = {
      idPlayer: parseInt(this.userService.getCookies()),
      betType: 'LOTTERY',
    };
  
    this.http.post(this.apigetBethis, requestBody).subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) {
          const now = new Date();
          const todayStr = format(now, 'yyyy-MM-dd');
          const cutoffTime = new Date();
          cutoffTime.setHours(18, 30, 0, 0); // 18:30 hôm nay
  
          const startRange = new Date();
          startRange.setDate(startRange.getDate() - 1);
          startRange.setHours(19, 0, 0, 0); // 19:00 hôm qua
  
          this.lotteryHistory = res.map((bet: any) => {
            const betTime = new Date(bet.betTime);
            let statusText = '';
  
            if (bet.status === true) {
              if (bet.reward && bet.reward > 0) {
                statusText = `Thắng +${bet.reward.toLocaleString()} VNĐ`;
            
                // Dùng localStorage để kiểm tra đã cộng chưa
                const rewardKey = `rewarded_${bet.id}`;
                if (!localStorage.getItem(rewardKey)) {
                  this.atmService.updateBalan(bet.reward, this.userService.getCookies()).subscribe(
                    response => {
                      console.log('Đã cộng tiền thưởng', response);
                    }
                  );
            
                  const newBalance = parseInt(this.userService.getBalanceCookies()) + bet.reward;
                  this.userService.setBalanceCookies(newBalance.toString());
            
                  const goldElement = document.querySelector('.gold');
                  if (goldElement) goldElement.innerHTML = newBalance.toString();
            
                  // Đánh dấu đã cộng để không cộng lại khi reload
                  localStorage.setItem(rewardKey, 'true');
                }
              } else {
                statusText = 'Thua';
              }
            } else {
              if (betTime >= startRange && betTime <= cutoffTime) {
                statusText = 'Đang chờ';
              } else {
                statusText = '---'; // Ngoài khung xét, không cần hiển thị rõ
              }
            }
  
            return {
              ...bet,
              status: statusText
            };
          });
  
          console.log('Lịch sử cược xổ số:', this.lotteryHistory);
        } else {
          console.warn("Phản hồi không phải mảng:", res);
          this.lotteryHistory = [];
        }
      },
      error: (err) => {
        console.error('Lỗi khi lấy lịch sử cược:', err);
        alert('Không thể tải lịch sử cược.');
      }
    });
  }

}


