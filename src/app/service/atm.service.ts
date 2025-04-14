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
  constructor(private httpClient: HttpClient , 
              private userService: userService
  ) {}

  searchAtm(stk: any): Observable<any> {
    // tìm thông tin tài khoản
    const body = { stk: stk };
    return this.httpClient.post(environment.apiSearchAtm, body);
  }
  updateBalan(number: number,id:any) {
    // cập nhật số dư : Nhập số tiền thay đổi , vd: -1000;
    const body = { balance: number ,idPlayer:id};
    return this.httpClient.post(environment.apiupdateBalan, body);
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




}
