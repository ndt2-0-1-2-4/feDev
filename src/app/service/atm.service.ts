import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { format } from 'date-fns';
import { Observable } from 'rxjs';
import { userService } from './users.service';
@Injectable({
  providedIn: 'root',
})
export class AtmService {
  private apiUrl = environment.apiCalculateReward;
  private apiGetDailyBalance = environment.apiGetHisBalance;
  private apiGetDailyRecharge = environment.apiGetDailyRecharge;

  constructor(
    private httpClient: HttpClient,
    private userService: userService
  ) {}

  searchAtm(stk: any): Observable<any> {
    // tìm thông tin tài khoản
    const body = { stk: stk };
    return this.httpClient.post(environment.apiSearchAtm, body);
  }
  updateBalan(number: number, id: any) {
    // cập nhật số dư : Nhập số tiền thay đổi , vd: -1000;
    const body = { balance: number, idPlayer: id };
    return this.httpClient.post(environment.apiupdateBalan, body);
  }
  getBalance() {
    const goldElement = document.querySelector('.gold');
    if (!goldElement) {
      return;
    }
    const goldText = goldElement.textContent || '0';
    const cleanedGoldText = goldText.replace(/[\.,]/g, ''); // Loại bỏ dấu chấm hoặc dấu phẩy
    const gold = parseInt(cleanedGoldText, 10);
    return gold;
  }
  setBalance(amount: number) {
    const goldElement = document.querySelector('.gold');
    if (!goldElement) {
      return;
    }
    const goldText = goldElement.textContent || '0';
    const cleanedGoldText = goldText
      .replace(/[\.,]/g, '')
      .replace(/[^\d]/g, ''); // Loại bỏ dấu chấm/phẩy và ký tự không phải số
    const gold = parseInt(cleanedGoldText, 10);
    const newGold = gold + amount;
    goldElement.textContent = newGold.toLocaleString('vi-VN');
  }
  saveHisBalance(idPlayer: any, content: any, trans: any, balance: any) {
    // lưu lịch sử
    let time = new Date().getTime();
    const formattedDate = format(time, 'yyyy-MM-dd HH:mm:ss');
    const body = {
      idPlayer: idPlayer,
      timeChange: formattedDate,
      content: content,
      trans: trans,
      balance: balance,
    };
    return this.httpClient.post(environment.apiSaveHisBalance, body);
  }

  CreateAtm(id: any, stk: any) {
    // tạo tài khoản ATM
    const body = { idPlayer: id, stk: stk };
    return this.httpClient.post(environment.apiCreateAtm, body);
  }

  calculateReward(idPlayer: number): Observable<any> {
    return this.httpClient.post(this.apiUrl, { idPlayer });
  }
  getDailyClosingBalance(playerId: number, startDate: string): Observable<any> {
    const url = `${this.apiGetDailyBalance}?playerId=${playerId}&startDate=${startDate}`;
    return this.httpClient.get(url);
  }
  getDailyRecharge(playerId: number, endDateStr: string): Observable<any> {
    const url = `${this.apiGetDailyRecharge}?playerId=${playerId}&endDateStr=${endDateStr}`;
    return this.httpClient.get(url);
  }
}
