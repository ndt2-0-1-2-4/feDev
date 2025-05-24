import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(
    private http: HttpClient
  ) { }
  private apiSaveHisPlayer = environment.apiSaveHisPlayer;
  apiFootBall=environment.apiFootball
  getHistory(namegame:string){
    const body = {"namegame":namegame}
    return this.http.post(environment.apiGetHistoryGame,body)
  }
  getMatches(dateFrom: string, dateTo: string): Observable<any> {
    // Thêm header ngrok-skip-browser-warning
    const headers = new HttpHeaders()
      .set('Accept', 'application/json')
      .set('ngrok-skip-browser-warning', 'true'); // Giá trị bất kỳ, ví dụ 'true'

    return this.http.get(`${this.apiFootBall}?dateFrom=${dateFrom}&dateTo=${dateTo}`, { headers });
  }
}
