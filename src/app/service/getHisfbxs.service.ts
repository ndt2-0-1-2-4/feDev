import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { endWith, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../environments/environment';
import { format } from 'date-fns';
import { userService } from './users.service'  
import { AtmService } from './atm.service';

@Injectable({
    providedIn: 'root',
  })
export class GetHisfbxsService {
  constructor(
        private http: HttpClient, 
        private cookieService: CookieService,
        private userService: userService
    ) {}

    private apigetHisfbxs = environment.apigetbetHisfbxs;

    getHisfbxs(): Observable<any> {
      const idPlayer = parseInt(this.userService.getCookies(), 10);
      return this.http.post(this.apigetHisfbxs, { idPlayer }); 
    }
}
  
