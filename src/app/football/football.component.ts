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
  selector: 'app-football',
  imports: [CommonModule, FormsModule],
  templateUrl: './football.component.html',
  styleUrl: './football.component.css'
})
export class FootballComponent {
  activeTab: 'matches' | 'history' = 'matches';
  matches: any[] = [];
  betAmount: number = 1000; // Số tiền cược mặc định
  money: number = 0; // Số tiền cược cho mỗi trận

  apiFootball=environment.apiFootball
  apiPlaceBet=environment.apiPlaceBet
  apigetBethis=environment.apigetbetHisfbxs
    
    constructor (
      private router:Router,
      private http :HttpClient,
      private userService: userService,
      private atmService: AtmService, 
    ) { }


      ngOnInit() {
        this.fetchMatches();
        const goldElement = document.querySelector('.gold');
        const gold = goldElement?.textContent
        if(gold){
          this.money = parseInt(gold);
        }
        this.fetchBetHistory();
      }

      private fetchMatches() {
        const dayStart = format(new Date(Date.now() - 86400000*4), 'yyyy-MM-dd'); 
        const dayEnd = format(new Date(Date.now() + 86400000 * 4), 'yyyy-MM-dd'); 
        const apiUrl = `${this.apiFootball}?dateFrom=${dayStart}&dateTo=${dayEnd}`;
        console.log("ok");
        const headers = new HttpHeaders({
          'X-Auth-Token': environment.keyFootball
        });
    
        this.http.get(apiUrl, { headers }).subscribe(
          (data: any) => {
            this.matches = data.matches.map((match: any) => ({
              ...match,
              id: match.id,
              prediction: { // Khởi tạo prediction cho mỗi trận
                home: 0,
                away: 0
              },
              betAmount: 0 // Khởi tạo betAmount cho mỗi trận
            })) || [];
            console.log(data);
          },
          (error: any) => {
            console.log(error);
          }
        );
      }
      
      placeBet(match: any) {
        if (this.money >= this.betAmount) {
          let amount = -this.betAmount;
          this.money -= this.betAmount;
      
          // Cập nhật UI
          const goldElement = document.querySelector('.gold');
          if (goldElement) goldElement.innerHTML = this.money.toString();

      
          // Trừ tiền
          this.atmService.updateBalan(amount, this.userService.getCookies()).subscribe(
            response => {
              console.log('Đã trừ tiền cược', response);
      
              // Gọi API lưu cược
              const betData = {
                idPlayer: parseInt(this.userService.getCookies()),
                betType: 'FOOTBALL',
                referenceId: match.id.toString(), 
                prediction: `${match.prediction.home}-${match.prediction.away}`, 
                betAmount: this.betAmount,
                multi: 1
              };
      
              this.http.post(this.apiPlaceBet, betData).subscribe(
                (res: any) => {
                  console.log('Đặt cược thành công:', JSON.stringify(res));
                  alert(res.message || "Đặt cược thành công!");

                  // reset lại giá trị cược
                  match.prediction.home = 0;
                  match.prediction.away = 0;
                  match.betAmount = 0;
                },
                (err) => {
                  console.error('Lỗi lưu đặt cược:', err);
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

    betHistory: any[] = [];

    fetchBetHistory() {
      // tạo object gửi ID của người chơi lên server thông qua API.
      const requestBody = {
        idPlayer: parseInt(this.userService.getCookies()),
        betType: 'FOOTBALL'  
      };
      const apiUrl = this.apigetBethis;   // Đường dẫn API lấy lịch sử cược

      this.http.post(apiUrl, requestBody).subscribe(
        (data: any) => {
          this.betHistory = data.map((bet: any) => {
            // Tìm trận đấu tương ứng theo referenceId
            const matched = this.matches.find(m => m.id === parseInt(bet.referenceId));

            let resultText = 'Đang chờ';
    
            if (matched && matched.status === 'FINISHED') {
              const fullTime = matched.score.fullTime;
              const actualScore = `${fullTime.home}-${fullTime.away}`;
    
              if (actualScore === bet.prediction) {
                const reward = bet.betAmount * bet.multi;
                resultText = `Thắng: +${reward}`;
    
                // Chỉ cộng tiền nếu status là false (chưa xử lý trước đó)
                if (!bet.status) {
                  this.atmService.updateBalan(reward, this.userService.getCookies()).subscribe(
                    response => {
                      console.log('Đã cộng tiền thưởng', response);
                    }
                  );
                
                  const goldElement = document.querySelector('.gold');
                }
              } else {
                resultText = 'Thua';
              }
            }

            return {
              matchName: matched
                ? `${matched.homeTeam.name} vs ${matched.awayTeam.name}`
                : 'Không rõ trận',
              prediction: bet.prediction,
              betAmount: bet.betAmount,
              betTime: new Date(bet.betTime),
              resultText: resultText,
              status: bet.status,
            };
          });
    
          console.log('Lịch sử cược sau xử lý:', this.betHistory);
        },
        (err) => {
          console.error('Lỗi khi gọi API lấy lịch sử cược:', err);
        }
      );
      
    }


    showBetHistory() {
      this.activeTab = 'history';
      this.fetchBetHistory();
    }
  

    showMatches() {
      this.activeTab = 'matches';
    }

}
