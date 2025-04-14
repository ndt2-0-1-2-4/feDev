import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(
    private http: HttpClient
  ) { }
  private apiSaveHisPlayer = environment.apiSaveHisPlayer;

  getHistory(namegame:string){
    const body = {"namegame":namegame}
    return this.http.post(environment.apiGetHistoryGame,body)
  }

}
