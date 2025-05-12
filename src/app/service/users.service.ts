import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { endWith, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../environments/environment';
import { format, isValid } from 'date-fns';
import path from 'path';
@Injectable({
  providedIn: 'root',
})
export class userService {
  private apiUrl = 'http://localhost:8082/user/changePassword';
  
  private apiLogin = environment.apiLogin;
  private apiGetInfo = environment.apiGetInfo;
  private apiGetAtm = environment.apiGetAtm;
  private apiGetHisBalance = environment.apiGetHisBalance;
  private apiGetPlayerHisAll = environment.apiGetPlayerHisAll;
  private username: any = '';
  private apiSearch = environment.apiSearchFullname;
  private keySecret: string = environment.keysecret;
  constructor(private http: HttpClient, private cookieService: CookieService) {}
  login(account: string, password: string): Observable<any> {
    const body = { tk: account, mk: password };
    return this.http.post(this.apiLogin, body);
  }
  getFullname(fullname: string){
    const body = { 
      fullname:fullname,
      id:this.getCookies()
     };
    return this.http.post(this.apiSearch,body)
}


  getUser():Observable<any>{
    const id =this.getCookies()
    const body={id:id}
    return this.http.post(this.apiGetInfo, body );
  }
  getUserById(id:any){
    const body={id:id}
    return this.http.post(this.apiGetInfo, body );
  }

  getAtmUser(id: any){
    const body = { idPlayer: id };
    return this.http.post(this.apiGetAtm, body);
  }
  getCookies() {
    return this.decryptData(this.cookieService.get('id'));
  }

  saveBetHis(
    namegame: any,
    playerId: any,
    rs: any,
    bet: any,
    reward: any,
    choice: any
  ) {
    let time = new Date().getTime();
    const formattedDate = format(time, 'yyyy-MM-dd HH:mm:ss');
    const body = {
      nameGame: namegame,
      playerId: playerId,
      timeoccurs: formattedDate,
      result: rs,
      bet: bet,
      reward: reward,
      choice: choice,
    };
    return this.http.post(environment.apiSaveHisPlayer, body);
  }
  encryptData(dataEncrypt: any) {
    if (typeof dataEncrypt !== 'string' || dataEncrypt.trim() === '') {
      console.error('Dữ liệu đầu vào không hợp lệ');
    }
    return CryptoJS.AES.encrypt(dataEncrypt, this.keySecret).toString();
  }
  decryptData(dataEncrypt: any) {
    const bytes = CryptoJS.AES.decrypt(dataEncrypt, this.keySecret);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
  setToken(token: string) {
    localStorage.setItem('token', token);
  }
  getToken() {
    return localStorage.getItem('token');
  }

  getHisBalance(id: any): Observable<any> {
    const body = { idPlayer: id };
    return this.http.post<any[]>(this.apiGetHisBalance, body).pipe(
      map((response: any[]) => {
        return response.map((item: any) => {
          let formattedTime = 'Không xác định';  // Mặc định là Không xác định nếu không có thời gian
  
          // Kiểm tra trường hợp item.timeChange có giá trị hợp lệ không
          if (item.timeChange) {
            const parsedDate = new Date(item.timeChange.replace(' ', 'T')); // Thử chuyển đổi
  
            // Nếu parsedDate hợp lệ thì định dạng lại
            if (!isNaN(parsedDate.getTime())) {
              formattedTime = format(parsedDate, 'dd-MM-yyyy HH:mm:ss');
            } else {
              console.log("Chuỗi thời gian không hợp lệ:", item.timeChange); // Log trường hợp không hợp lệ
            }
          }
  
          return {
            idPlayer: item.idPlayer,
            content: item.content,
            trans: item.trans,
            balance: item.balance,
            timeChangeFormatted: formattedTime, // Trả về thời gian đã định dạng hoặc "Không xác định"
          };
        });
      }),
      catchError((error) => {
        console.error('Lỗi khi lấy lịch sử cược:', error);
        return of([]); // Xử lý khi có lỗi API
      })
    );
  }
      

  getPlayerHisAll(id: any): Observable<any> {
    const body = { playerId: id };
    return this.http.post<any[]>(this.apiGetPlayerHisAll, body).pipe(
      map((response: any[]) => {
        return response.map((item: any) => {
          let formattedTime = 'Không xác định';
          if (item.timeoccurs) {
            const parsedDate = new Date(item.timeoccurs.replace(' ', 'T'));
            if (!isNaN(parsedDate.getTime())) {
              formattedTime = format(parsedDate, 'dd-MM-yyyy HH:mm:ss');
            }
          }
    
          return {
            nameGame: item.nameGame,
            playerId: item.playerId,
            timeoccurs: formattedTime,
            result: item.result,
            bet: item.bet,
            reward: item.reward,
            choice: item.choice
          };
        });
      }),
      catchError((error) => {
        console.error('Lỗi khi lấy lịch sử cược:', error);
        return of([]);
      })
    );
  }
  register(tk:any ,mk:any,fullname:any,email:any){
    const body={
      "fullname":fullname,
      "tk":tk,
      "mk":mk,
      "email":email
    }
    return this.http.post(environment.apiRegister,body)
  }
  
  changePassword(userId:number, oldPassword:string, newPassword: string){
    const payload = {
      id: userId,
      oldPassword,
      newPassword
    };
    return this.http.post(this.apiUrl, payload);
  }
  
}
