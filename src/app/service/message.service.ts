import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class MessageService{
  constructor(private http: HttpClient){}
  getChatHis(idMy:number,idFriend:number):Observable<any>{
    const body={idMy:idMy,idFriend:idFriend}
    return this.http.post(environment.apiGetChatHis,body)
  }
}
