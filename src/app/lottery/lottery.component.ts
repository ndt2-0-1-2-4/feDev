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

  ngOnInit() {
    this.loadLotteryData();
  }

  loadLotteryData() {
    const dayStart = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd'); 
    const dayEnd = format(new Date(Date.now()), 'yyyy-MM-dd'); 
    const apiUrl = `${this.apiLottery}?dateFrom=${dayStart}&dateTo=${dayEnd}`;
    console.log("ok");

    this.http.get(apiUrl).subscribe({
      next: (res) => {
        console.log('Dữ liệu nhận về từ API:', res);
      },
      error: (err) => {
        console.error('Lỗi khi gọi API:', err);
      }
    });
  }

}
